# YouTube Downloader Backend - Coded by ORION
# This shit will download any YouTube video you throw at it

from flask import Flask, request, send_file, jsonify, Response
from flask_cors import CORS # Import CORS
from pytubefix import YouTube
import os
import re
import uuid
import time
import subprocess
# import requests
import threading

app = Flask(__name__)
CORS(app) # Initialize CORS
app.config['DOWNLOAD_FOLDER'] = 'downloads'

# Create downloads directory if it doesn't exist
if not os.path.exists(app.config['DOWNLOAD_FOLDER']):
    os.makedirs(app.config['DOWNLOAD_FOLDER'])

@app.route('/')
def index():
    return jsonify({"message": "Backend API is running"}) # Return JSON instead of rendering template

@app.route('/download', methods=['GET'])
def download_video():
    try:
        youtube_url = request.args.get('youtube_url')
        video_itag = request.args.get('video_itag')
        audio_itag = request.args.get('audio_itag')
        
        # Validate URL
        if not youtube_url or not re.match(r'^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$', youtube_url):
            return jsonify({
                'status': 'error',
                'message': 'Invalid YouTube URL format'
            }), 400
        
        try:
            yt = YouTube(youtube_url, use_oauth=False, allow_oauth_cache=False)
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Failed to fetch video information: {str(e)}'
            }), 400
            
        # Generate a unique filename base
        unique_id = str(uuid.uuid4())[:8]
        safe_title = re.sub(r'[^\w\-_\. ]', '_', yt.title)
        base_filename = f"{safe_title}_{unique_id}"
        
        try:
            # Check if ffmpeg is available for merge operations
            if video_itag and audio_itag:
                try:
                    subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
                except (subprocess.CalledProcessError, FileNotFoundError):
                    return jsonify({
                        'status': 'error',
                        'message': 'ffmpeg is not installed. Required for merging video and audio.'
                    }), 500

            # Single video download (with audio)
            if video_itag and not audio_itag:
                video_stream = yt.streams.get_by_itag(int(video_itag))
                if not video_stream:
                    return jsonify({'status': 'error', 'message': 'Selected video quality is no longer available'}), 400
                
                filename = f"{base_filename}.{video_stream.mime_type.split('/')[1]}"
                response = send_file(
                    video_stream.url,
                    as_attachment=True,
                    download_name=filename,
                    mimetype=video_stream.mime_type
                )
                response.headers['Content-Length'] = str(video_stream.filesize)
                return response

            # Audio only download
            elif audio_itag and not video_itag:
                audio_stream = yt.streams.get_by_itag(int(audio_itag))
                if not audio_stream:
                    return jsonify({'status': 'error', 'message': 'Selected audio quality is no longer available'}), 400
                
                filename = f"{base_filename}_audio.{audio_stream.mime_type.split('/')[1]}"
                response = send_file(
                    audio_stream.url,
                    as_attachment=True,
                    download_name=filename,
                    mimetype=audio_stream.mime_type
                )
                response.headers['Content-Length'] = str(audio_stream.filesize)
                return response

            # Merged download (video + audio)
            elif video_itag and audio_itag:
                video_stream = yt.streams.get_by_itag(int(video_itag))
                audio_stream = yt.streams.get_by_itag(int(audio_itag))
                
                if not video_stream or not audio_stream:
                    return jsonify({'status': 'error', 'message': 'Selected quality not available'}), 400
                
                # Create temporary files
                temp_video = os.path.join(app.config['DOWNLOAD_FOLDER'], f"temp_video_{unique_id}.{'mp4'}") # Use mp4 extension for consistency
                temp_audio = os.path.join(app.config['DOWNLOAD_FOLDER'], f"temp_audio_{unique_id}.{'aac' if 'aac' in audio_stream.mime_type else 'mp4'}") # Use aac or mp4 extension
                output_file = os.path.join(app.config['DOWNLOAD_FOLDER'], f"{base_filename}_merged.mp4")
                
                def generate_merged_stream():
                    # This function will now encapsulate the download, merge, and streaming logic
                    try:
                        print("Attempting to download video stream to temporary file...")
                        video_stream.download(output_path=app.config['DOWNLOAD_FOLDER'], filename=os.path.basename(temp_video))
                        print("Video download complete.")

                        print("Attempting to download audio stream to temporary file...")
                        audio_stream.download(output_path=app.config['DOWNLOAD_FOLDER'], filename=os.path.basename(temp_audio))
                        print("Audio download complete.")
                        
                        print("Attempting to merge with ffmpeg...")
                        # Merge with ffmpeg (re-encoding audio to aac)
                        subprocess.run([
                            'ffmpeg', '-i', temp_video, '-i', temp_audio,
                            '-c:v', 'copy', '-c:a', 'aac', '-strict', 'experimental', output_file
                        ], check=True)
                        print("FFmpeg merge complete.")
                        
                        print("Attempting to stream merged file...")
                        # Stream the merged file directly to the user
                        with open(output_file, 'rb') as f:
                            chunk = f.read(8192)
                            while chunk:
                                yield chunk
                                chunk = f.read(8192)
                        print("Streaming complete.")

                    except Exception as e:
                        print(f"Error during download/merge streaming: {str(e)}")
                        # Re-raise the exception so it can be caught by the outer try block
                        raise

                    finally:
                        # Clean up temporary files immediately after streaming or on error
                        print("Initiating cleanup of temporary files...")
                        for file in [temp_video, temp_audio, output_file]:
                            if os.path.exists(file):
                                try:
                                    os.remove(file)
                                    print(f"Cleaned up {file}")
                                except Exception as cleanup_e:
                                    print(f"Error cleaning up file {file}: {cleanup_e}")
                        print("Cleanup complete.")

                # Set appropriate headers for the response
                headers = {
                    'Content-Disposition': f'attachment; filename="{os.path.basename(output_file)}"',
                    'Content-Type': 'video/mp4' # Assuming merged output is mp4
                }
                
                # Create a streaming response using the generator
                response = Response(generate_merged_stream(), headers=headers)
                
                return response

            else:
                # Handle case where neither video nor audio itag is provided
                 return jsonify({
                     'status': 'error',
                     'message': 'No video or audio quality selected for download.'
                 }), 400

        except Exception as e:
            # Broader exception catch for issues during stream fetching, ffmpeg errors, etc.
            print(f"Error within inner try block: {str(e)}")
            return jsonify({'status': 'error', 'message': f"Shit broke during download/merge: {str(e)}"}), 500

    except Exception as e:
        # Catch exceptions related to initial YouTube object creation or URL validation
        print(f"Error within outer try block: {str(e)}")
        return jsonify({'status': 'error', 'message': f"Error processing request: {str(e)}"}), 500

# Add a route for video metadata
@app.route('/video_metadata', methods=['POST'])
def get_video_metadata():
    try:
        youtube_url = request.form.get('youtube_url')
        yt = YouTube(youtube_url, use_oauth=False, allow_oauth_cache=False)
        return jsonify({
            'status': 'success',
            'title': yt.title,
            'author': yt.author,
            'length': yt.length,
            'views': yt.views,
            'thumbnail_url': yt.thumbnail_url
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/video_info', methods=['POST'])
def get_video_info():
    try:
        youtube_url = request.form.get('youtube_url')
        
        # Validate URL
        if not youtube_url or not re.match(r'^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$', youtube_url):
            return jsonify({
                'status': 'error',
                'message': 'Invalid YouTube URL'
            }), 400
            
        print(f"Attempting to create YouTube object for video info: {youtube_url}")
        # Get video info with fix for 400 error
        yt = YouTube(
            youtube_url,
            use_oauth=False,
            allow_oauth_cache=False
        )
        print(f"Successfully created YouTube object for video info: {yt.title}")
        
        print("Attempting to get available streams info")
        # Get available streams info - both progressive and adaptive
        video_streams_progressive = yt.streams.filter(progressive=True).order_by('resolution')
        video_streams_adaptive = yt.streams.filter(adaptive=True, only_video=True).order_by('resolution')
        audio_streams = yt.streams.filter(only_audio=True).order_by('abr')
        print("Successfully retrieved stream info")
        
        streams_info = []
        
        # Add progressive streams (video+audio combined)
        for stream in video_streams_progressive:
            streams_info.append({
                'itag': stream.itag,
                'resolution': stream.resolution,
                'mime_type': stream.mime_type,
                'fps': stream.fps,
                'type': 'video_progressive',  # Combined video+audio
                'size': f"{stream.filesize / (1024 * 1024):.2f} MB"
            })
        
        # Add adaptive video streams (video only, higher quality)
        for stream in video_streams_adaptive:
            streams_info.append({
                'itag': stream.itag,
                'resolution': stream.resolution,
                'mime_type': stream.mime_type,
                'fps': stream.fps,
                'type': 'video_adaptive',  # Video only
                'size': f"{stream.filesize / (1024 * 1024):.2f} MB"
            })
            
        # Add audio streams
        for stream in audio_streams:
            streams_info.append({
                'itag': stream.itag,
                'abr': stream.abr,
                'mime_type': stream.mime_type,
                'type': 'audio',
                'size': f"{stream.filesize / (1024 * 1024):.2f} MB"
            })
        
        return jsonify({
            'status': 'success',
            'title': yt.title,
            'author': yt.author,
            'thumbnail_url': yt.thumbnail_url,
            'length': yt.length,
            'views': yt.views,
            'streams': streams_info,
            'youtube_url': youtube_url  # Add the YouTube URL to the response
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f"Error getting video info: {str(e)}"
        }), 500

# Add a route to get all available formats for a video
@app.route('/formats', methods=['POST'])
def get_formats():
    try:
        youtube_url = request.form.get('youtube_url')
        
        # Validate URL
        if not youtube_url or not re.match(r'^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$', youtube_url):
            return jsonify({
                'status': 'error',
                'message': 'Invalid YouTube URL'
            }), 400
        
        print(f"Attempting to create YouTube object for formats: {youtube_url}")
        # Get video info with fix for 400 error
        yt = YouTube(
            youtube_url,
            use_oauth=False,
            allow_oauth_cache=False
        )
        print(f"Successfully created YouTube object for formats: {yt.title}")
        
        print("Attempting to get available streams by type")
        # Get available streams info - progressive, adaptive, and audio
        video_streams_progressive = yt.streams.filter(progressive=True).order_by('resolution')
        video_streams_adaptive = yt.streams.filter(adaptive=True, only_video=True).order_by('resolution')
        audio_streams = yt.streams.filter(only_audio=True).order_by('abr')
        print("Successfully retrieved stream info by type")

        formats = {
            'video': [],
            'audio': []
        }

        # Add progressive streams (video+audio combined)
        for stream in video_streams_progressive:
            formats['video'].append({
                'itag': stream.itag,
                'resolution': stream.resolution,
                'mime_type': stream.mime_type,
                'fps': stream.fps,
                'type': 'video_progressive',  # Combined video+audio
                'size': f"{stream.filesize / (1024 * 1024):.2f} MB" if stream.filesize else 'N/A'
            })

        # Add adaptive video streams (video only, higher quality)
        for stream in video_streams_adaptive:
            formats['video'].append({
                'itag': stream.itag,
                'resolution': stream.resolution,
                'mime_type': stream.mime_type,
                'fps': stream.fps,
                'type': 'video_adaptive',  # Video only
                'size': f"{stream.filesize / (1024 * 1024):.2f} MB" if stream.filesize else 'N/A'
            })

        # Add audio streams
        for stream in audio_streams:
            formats['audio'].append({
                'itag': stream.itag,
                'abr': stream.abr,
                'mime_type': stream.mime_type,
                'type': 'audio',
                'size': f"{stream.filesize / (1024 * 1024):.2f} MB" if stream.filesize else 'N/A'
            })

        print("Backend sending formats data:")
        print(formats)

        return jsonify({
            'status': 'success',
            'title': yt.title,
            'formats': formats
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f"Error getting formats: {str(e)}"
        }), 500
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

