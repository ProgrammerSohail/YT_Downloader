# YouTube Downloader Backend - Coded by ORION
# This shit will download any YouTube video you throw at it

from flask import Flask, render_template, request, send_file, jsonify
from pytubefix import YouTube
import os
import re
import uuid
import time

app = Flask(__name__)
app.config['DOWNLOAD_FOLDER'] = 'downloads'

# Create downloads directory if it doesn't exist
if not os.path.exists(app.config['DOWNLOAD_FOLDER']):
    os.makedirs(app.config['DOWNLOAD_FOLDER'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/download', methods=['POST'])
def download_video():
    try:
        # Get the YouTube URL and options from the form
        youtube_url = request.form.get('youtube_url')
        video_itag = request.form.get('video_itag') # Get selected video itag
        audio_itag = request.form.get('audio_itag') # Get selected audio itag
        
        # Validate URL (basic check)
        if not youtube_url or not re.match(r'^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$', youtube_url):
            return jsonify({
                'status': 'error',
                'message': 'Invalid YouTube URL, dumbass!'
            }), 400
        
        print(f"Attempting to create YouTube object for URL: {youtube_url}")
        # Create a YouTube object with a fix for the 400 error
        # Adding a custom header to avoid the 400 Bad Request error
        yt = YouTube(
            youtube_url,
            use_oauth=False,
            allow_oauth_cache=False
        )
        print(f"Successfully created YouTube object for title: {yt.title}")
        
        # Generate a unique filename base
        unique_id = str(uuid.uuid4())[:8]
        safe_title = re.sub(r'[^\w\-_\. ]', '_', yt.title)
        base_filename = f"{safe_title}_{unique_id}"

        video_filepath = None
        audio_filepath = None
        output_filepath = None

        # Download video stream if itag is provided
        if video_itag:
            print(f"Attempting to get video stream with itag {video_itag}")
            video_stream = yt.streams.get_by_itag(int(video_itag))
            if not video_stream or 'video' not in video_stream.mime_type:
                return jsonify({
                    'status': 'error',
                    'message': 'Selected video quality not available or not a video stream.'
                }), 400

            video_filename = f"{base_filename}_video_{video_stream.resolution}.{video_stream.mime_type.split('/')[1]}"
            video_filepath = os.path.join(app.config['DOWNLOAD_FOLDER'], video_filename)
            print(f"Attempting to download video stream to {video_filepath}")
            video_stream.download(output_path=app.config['DOWNLOAD_FOLDER'], filename=video_filename)
            print(f"Video download complete for itag {video_itag}")

        # Download audio stream if itag is provided
        if audio_itag:
            print(f"Attempting to get audio stream with itag {audio_itag}")
            audio_stream = yt.streams.get_by_itag(int(audio_itag))
            if not audio_stream or 'audio' not in audio_stream.mime_type:
                # If a video was downloaded, delete it as we can't merge without audio
                if video_filepath and os.path.exists(video_filepath):
                    os.remove(video_filepath)
                return jsonify({
                    'status': 'error',
                    'message': 'Selected audio quality not available or not an audio stream.'
                }), 400

            audio_filename = f"{base_filename}_audio_{audio_stream.abr}.{audio_stream.mime_type.split('/')[1]}"
            audio_filepath = os.path.join(app.config['DOWNLOAD_FOLDER'], audio_filename)
            print(f"Attempting to download audio stream to {audio_filepath}")
            audio_stream.download(output_path=app.config['DOWNLOAD_FOLDER'], filename=audio_filename)
            print(f"Audio download complete for itag {audio_itag}")

        # --- Merging Step (Requires FFmpeg) ---
        # If both video and audio were downloaded, merge them
        if video_filepath and audio_filepath:
            final_filename = f"{base_filename}_merged.mp4"
            output_filepath = os.path.join(app.config['DOWNLOAD_FOLDER'], final_filename)
            print(f"Attempting to merge video ({video_filepath}) and audio ({audio_filepath}) into {output_filepath}")
            # Use subprocess to call ffmpeg
            # NOTE: FFmpeg must be installed and in the system's PATH
            import subprocess
            try:
                # Basic ffmpeg command to merge video and audio without re-encoding
                subprocess.run([
                    'ffmpeg',
                    '-i', video_filepath,
                    '-i', audio_filepath,
                    '-c', 'copy',
                    '-map', '0:v:0',
                    '-map', '1:a:0',
                    output_filepath
                ], check=True)
                print("Merging complete")
                # Clean up individual video and audio files after merging
                os.remove(video_filepath)
                os.remove(audio_filepath)
                download_type = 'video' # Indicate a video file was the primary result
            except FileNotFoundError:
                print("[!] FFmpeg command failed: FFmpeg not found. Install FFmpeg to merge streams.")
                # Don't delete video/audio files if merge fails due to missing ffmpeg
                return jsonify({
                    'status': 'error',
                    'message': 'Merging failed: FFmpeg not found. Install FFmpeg to download selected video and audio qualities together.'
                }), 500
            except subprocess.CalledProcessError as e:
                print(f"[!] FFmpeg command failed: {e}")
                # Don't delete video/audio files if merge fails
                return jsonify({
                    'status': 'error',
                    'message': f'Merging failed: FFmpeg error. {e}'
                }), 500

        elif video_filepath:
            # Only video was downloaded (progressive or video-only without selected audio)
            output_filepath = video_filepath
            download_type = 'video'
        elif audio_filepath:
            # Only audio was downloaded
            output_filepath = audio_filepath
            download_type = 'audio'
        else:
            # Nothing was downloaded (shouldn't happen with frontend validation, but as a fallback)
            return jsonify({
                'status': 'error',
                'message': 'No stream selected for download.'
            }), 400

        # Determine the stream used for reporting size and details
        # Prioritize merged stream info if available, then video, then audio
        report_stream = None
        if 'merged' in final_filename if final_filename else False:
            # For merged files, we don't have a single stream object for size.
            # We'll need to get the size of the output file.
            try:
                output_file_size_bytes = os.path.getsize(output_filepath)
                report_file_size = f"{output_file_size_bytes / (1024 * 1024):.2f} MB"
            except OSError:
                report_file_size = 'N/A' # Could not get file size
            report_title = yt.title # Use video title for merged file
            report_author = yt.author
        elif video_itag and video_stream:
            report_stream = video_stream
            report_title = yt.title
            report_author = yt.author
            report_file_size = f"{report_stream.filesize / (1024 * 1024):.2f} MB" if report_stream.filesize else 'N/A'
        elif audio_itag and audio_stream:
            report_stream = audio_stream
            # Use video title/author for audio downloads too for consistency
            report_title = yt.title
            report_author = yt.author
            report_file_size = f"{report_stream.filesize / (1024 * 1024):.2f} MB" if report_stream.filesize else 'N/A'
        else:
            # Fallback, should use info from the single downloaded stream if no itags provided
            # (e.g., default progressive or audio) - this part might need refinement
            # based on the exact stream object available here.
            # For now, assume we can get the stream object from the single downloaded file.
            # This is complex without re-fetching stream info, let's just report basic info
            report_title = yt.title
            report_author = yt.author
            try:
                output_file_size_bytes = os.path.getsize(output_filepath)
                report_file_size = f"{output_file_size_bytes / (1024 * 1024):.2f} MB" if output_file_size_bytes else 'N/A'
            except OSError:
                report_file_size = 'N/A'

        # Return success with file info
        return jsonify({
            'status': 'success',
            'message': f"Downloaded: {report_title}",
            'file_path': output_filepath,
            'title': report_title,
            'author': report_author,
            'file_size': report_file_size,
            'type': download_type # Report the final type (video, audio, or merged video)
        })
        
    except Exception as e:
        # Clean up any partially downloaded files on error
        if 'video_filepath' in locals() and video_filepath and os.path.exists(video_filepath):
            os.remove(video_filepath)
        if 'audio_filepath' in locals() and audio_filepath and os.path.exists(audio_filepath):
            os.remove(audio_filepath)
        if 'output_filepath' in locals() and output_filepath and os.path.exists(output_filepath):
            os.remove(output_filepath)

        return jsonify({
            'status': 'error',
            'message': f"Shit broke during download/merge: {str(e)}"
        }), 500

@app.route('/get_file/<path:filename>')
def get_file(filename):
    try:
        return send_file(os.path.join(app.config['DOWNLOAD_FOLDER'], filename), as_attachment=True)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f"File not found: {str(e)}"
        }), 404

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
            'streams': streams_info
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
