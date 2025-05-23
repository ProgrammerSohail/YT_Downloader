# YouTube Downloader Backend - Migrated to yt-dlp by ORION
# Fast and reliable YouTube video downloader with yt-dlp

from flask import Flask, request, send_file, jsonify, Response
from flask_cors import CORS
from yt_dlp import YoutubeDL
import os
import re
import uuid
import subprocess
import tempfile
import threading
import time

app = Flask(__name__)
CORS(app)
app.config['DOWNLOAD_FOLDER'] = 'downloads'

# Create downloads directory if it doesn't exist
if not os.path.exists(app.config['DOWNLOAD_FOLDER']):
    os.makedirs(app.config['DOWNLOAD_FOLDER'])

# Global yt-dlp options for better performance
YDL_OPTS = {
    'quiet': True,
    'no_warnings': True,
    'noplaylist': True,
    'extract_flat': False,
    'writethumbnail': False,
    'writeinfojson': False,
}

@app.route('/')
def index():
    return jsonify({"message": "YouTube Downloader Backend API is running with yt-dlp"})

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
            # Get video info
            with YoutubeDL(YDL_OPTS) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Failed to fetch video information: {str(e)}'
            }), 400
            
        # Generate a unique filename base
        unique_id = str(uuid.uuid4())[:8]
        safe_title = re.sub(r'[^\w\-_\. ]', '_', info.get('title', 'video'))[:50]  # Limit length
        base_filename = f"{safe_title}_{unique_id}"
        
        try:
            # Single video download (progressive - video with audio)
            if video_itag and not audio_itag:
                video_format = next((f for f in info['formats'] if str(f.get('format_id')) == str(video_itag)), None)
                if not video_format:
                    return jsonify({'status': 'error', 'message': 'Selected video quality is no longer available'}), 400
                
                # Check if it's a progressive format (has both video and audio)
                if video_format.get('acodec') != 'none' and video_format.get('vcodec') != 'none':
                    # Progressive format - direct download
                    ext = video_format.get('ext', 'mp4')
                    filename = f"{base_filename}.{ext}"
                    
                    ydl_opts = {
                        **YDL_OPTS,
                        'format': str(video_itag),
                        'outtmpl': os.path.join(app.config['DOWNLOAD_FOLDER'], filename)
                    }
                    
                    with YoutubeDL(ydl_opts) as ydl:
                        ydl.download([youtube_url])
                    
                    filepath = os.path.join(app.config['DOWNLOAD_FOLDER'], filename)
                    
                    def remove_file():
                        time.sleep(30)  # Wait 30 seconds before cleanup
                        try:
                            if os.path.exists(filepath):
                                os.remove(filepath)
                        except:
                            pass
                    
                    threading.Thread(target=remove_file, daemon=True).start()
                    
                    return send_file(
                        filepath,
                        as_attachment=True,
                        download_name=filename,
                        mimetype=video_format.get('mime_type', 'video/mp4')
                    )
                else:
                    return jsonify({'status': 'error', 'message': 'Selected format requires audio to be merged. Please select both video and audio quality.'}), 400

            # Audio only download
            elif audio_itag and not video_itag:
                audio_format = next((f for f in info['formats'] if str(f.get('format_id')) == str(audio_itag)), None)
                if not audio_format:
                    return jsonify({'status': 'error', 'message': 'Selected audio quality is no longer available'}), 400
                
                ext = audio_format.get('ext', 'm4a')
                filename = f"{base_filename}_audio.{ext}"
                
                ydl_opts = {
                    **YDL_OPTS,
                    'format': str(audio_itag),
                    'outtmpl': os.path.join(app.config['DOWNLOAD_FOLDER'], filename)
                }
                
                with YoutubeDL(ydl_opts) as ydl:
                    ydl.download([youtube_url])
                
                filepath = os.path.join(app.config['DOWNLOAD_FOLDER'], filename)
                
                def remove_file():
                    time.sleep(30)
                    try:
                        if os.path.exists(filepath):
                            os.remove(filepath)
                    except:
                        pass
                
                threading.Thread(target=remove_file, daemon=True).start()
                
                return send_file(
                    filepath,
                    as_attachment=True,
                    download_name=filename,
                    mimetype=audio_format.get('mime_type', 'audio/m4a')
                )

            # Merged download (video + audio) - FASTEST METHOD
            elif video_itag and audio_itag:
                # Check if ffmpeg is available
                try:
                    subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
                except (subprocess.CalledProcessError, FileNotFoundError):
                    return jsonify({
                        'status': 'error',
                        'message': 'ffmpeg is not installed. Required for merging video and audio.'
                    }), 500

                video_format = next((f for f in info['formats'] if str(f.get('format_id')) == str(video_itag)), None)
                audio_format = next((f for f in info['formats'] if str(f.get('format_id')) == str(audio_itag)), None)
                
                if not video_format or not audio_format:
                    return jsonify({'status': 'error', 'message': 'Selected quality not available'}), 400
                
                # Use yt-dlp's built-in merging capability for fastest results
                output_filename = f"{base_filename}_merged.mp4"
                output_path = os.path.join(app.config['DOWNLOAD_FOLDER'], output_filename)
                
                # Format string for yt-dlp to download and merge
                format_string = f"{video_itag}+{audio_itag}"
                
                ydl_opts = {
                    **YDL_OPTS,
                    'format': format_string,
                    'outtmpl': output_path,
                    'merge_output_format': 'mp4',
                    'postprocessors': [{
                        'key': 'FFmpegVideoConvertor',
                        'preferedformat': 'mp4',
                    }]
                }
                
                try:
                    with YoutubeDL(ydl_opts) as ydl:
                        ydl.download([youtube_url])
                    
                    # Clean up after 30 seconds
                    def remove_file():
                        time.sleep(30)
                        try:
                            if os.path.exists(output_path):
                                os.remove(output_path)
                        except:
                            pass
                    
                    threading.Thread(target=remove_file, daemon=True).start()
                    
                    return send_file(
                        output_path,
                        as_attachment=True,
                        download_name=output_filename,
                        mimetype='video/mp4'
                    )
                    
                except Exception as merge_error:
                    # Fallback to manual merge if yt-dlp merge fails
                    print(f"yt-dlp merge failed, falling back to manual merge: {merge_error}")
                    
                    # Manual download and merge
                    temp_video = os.path.join(app.config['DOWNLOAD_FOLDER'], f"temp_video_{unique_id}.{video_format.get('ext', 'mp4')}")
                    temp_audio = os.path.join(app.config['DOWNLOAD_FOLDER'], f"temp_audio_{unique_id}.{audio_format.get('ext', 'm4a')}")
                    
                    try:
                        # Download video
                        ydl_opts_video = {
                            **YDL_OPTS,
                            'format': str(video_itag),
                            'outtmpl': temp_video
                        }
                        with YoutubeDL(ydl_opts_video) as ydl:
                            ydl.download([youtube_url])
                        
                        # Download audio
                        ydl_opts_audio = {
                            **YDL_OPTS,
                            'format': str(audio_itag),
                            'outtmpl': temp_audio
                        }
                        with YoutubeDL(ydl_opts_audio) as ydl:
                            ydl.download([youtube_url])
                        
                        # Merge with ffmpeg
                        subprocess.run([
                            'ffmpeg', '-y', '-i', temp_video, '-i', temp_audio,
                            '-c:v', 'copy', '-c:a', 'aac', '-strict', 'experimental', 
                            output_path
                        ], check=True, capture_output=True)
                        
                        # Cleanup temp files immediately
                        for temp_file in [temp_video, temp_audio]:
                            if os.path.exists(temp_file):
                                os.remove(temp_file)
                        
                        # Clean up merged file after 30 seconds
                        def remove_file():
                            time.sleep(30)
                            try:
                                if os.path.exists(output_path):
                                    os.remove(output_path)
                            except:
                                pass
                        
                        threading.Thread(target=remove_file, daemon=True).start()
                        
                        return send_file(
                            output_path,
                            as_attachment=True,
                            download_name=output_filename,
                            mimetype='video/mp4'
                        )
                        
                    except Exception as manual_error:
                        # Cleanup temp files on error
                        for temp_file in [temp_video, temp_audio, output_path]:
                            if os.path.exists(temp_file):
                                try:
                                    os.remove(temp_file)
                                except:
                                    pass
                        raise manual_error

            else:
                return jsonify({
                    'status': 'error',
                    'message': 'No video or audio quality selected for download.'
                }), 400

        except Exception as e:
            print(f"Error during download/merge: {str(e)}")
            return jsonify({'status': 'error', 'message': f"Download failed: {str(e)}"}), 500

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({'status': 'error', 'message': f"Error processing request: {str(e)}"}), 500

@app.route('/video_metadata', methods=['POST'])
def get_video_metadata():
    try:
        youtube_url = request.form.get('youtube_url')
        
        with YoutubeDL(YDL_OPTS) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
        
        return jsonify({
            'status': 'success',
            'title': info.get('title', ''),
            'author': info.get('uploader', ''),
            'length': info.get('duration', 0),
            'views': info.get('view_count', 0),
            'thumbnail_url': info.get('thumbnail', '')
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
            
        print(f"Fetching video info for: {youtube_url}")
        
        with YoutubeDL(YDL_OPTS) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
        
        print(f"Successfully fetched info for: {info.get('title', '')}")
        
        streams_info = []
        
        # Process all formats
        for fmt in info.get('formats', []):
            if not fmt.get('format_id') or not fmt.get('url'):
                continue
            
            # Get basic stream info
            stream_entry = {
                'itag': fmt['format_id'],
                'mime_type': fmt.get('ext', ''),
                'size': f"{(fmt.get('filesize') or fmt.get('filesize_approx') or 0) / (1024 * 1024):.2f} MB"
            }
            
            # Categorize streams
            vcodec = fmt.get('vcodec', 'none')
            acodec = fmt.get('acodec', 'none')
            
            if vcodec != 'none' and acodec != 'none':
                # Progressive stream (video + audio)
                stream_entry.update({
                    'type': 'video_progressive',
                    'resolution': fmt.get('resolution', fmt.get('height', '')),
                    'fps': fmt.get('fps', ''),
                })
                streams_info.append(stream_entry)
                
            elif vcodec != 'none' and acodec == 'none':
                # Video only stream
                stream_entry.update({
                    'type': 'video_adaptive',
                    'resolution': fmt.get('resolution', fmt.get('height', '')),
                    'fps': fmt.get('fps', ''),
                })
                streams_info.append(stream_entry)
                
            elif vcodec == 'none' and acodec != 'none':
                # Audio only stream
                stream_entry.update({
                    'type': 'audio',
                    'abr': fmt.get('abr', ''),
                })
                streams_info.append(stream_entry)
        
        return jsonify({
            'status': 'success',
            'title': info.get('title', ''),
            'author': info.get('uploader', ''),
            'thumbnail_url': info.get('thumbnail', ''),
            'length': info.get('duration', 0),
            'views': info.get('view_count', 0),
            'streams': streams_info,
            'youtube_url': youtube_url
        })
        
    except Exception as e:
        print(f"Error getting video info: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error getting video info: {str(e)}"
        }), 500

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
        
        print(f"Fetching formats for: {youtube_url}")
        
        with YoutubeDL(YDL_OPTS) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
        
        print(f"Successfully fetched formats for: {info.get('title', '')}")
        
        formats = {
            'video': [],
            'audio': []
        }
        
        # Process formats and categorize them
        for fmt in info.get('formats', []):
            if not fmt.get('format_id') or not fmt.get('url'):
                continue
            
            vcodec = fmt.get('vcodec', 'none')
            acodec = fmt.get('acodec', 'none')
            
            stream_data = {
                'itag': fmt['format_id'],
                'mime_type': fmt.get('ext', ''),
                'size': f"{(fmt.get('filesize') or fmt.get('filesize_approx') or 0) / (1024 * 1024):.2f} MB"
            }
            
            if vcodec != 'none':
                # Video stream (progressive or adaptive)
                stream_data.update({
                    'resolution': fmt.get('resolution', str(fmt.get('height', '')) + 'p' if fmt.get('height') else ''),
                    'fps': fmt.get('fps', ''),
                    'type': 'video_progressive' if acodec != 'none' else 'video_adaptive'
                })
                formats['video'].append(stream_data)
                
            elif acodec != 'none':
                # Audio only stream
                stream_data.update({
                    'abr': fmt.get('abr', ''),
                    'type': 'audio'
                })
                formats['audio'].append(stream_data)
        
        # Sort formats
        formats['video'].sort(key=lambda x: int(re.findall(r'\d+', x.get('resolution', '0'))[0]) if re.findall(r'\d+', x.get('resolution', '0')) else 0, reverse=True)
        formats['audio'].sort(key=lambda x: int(x.get('abr', 0)) if x.get('abr') else 0, reverse=True)
        
        print("Sending formats data to frontend")
        
        return jsonify({
            'status': 'success',
            'title': info.get('title', ''),
            'formats': formats
        })

    except Exception as e:
        print(f"Error getting formats: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error getting formats: {str(e)}"
        }), 500

if __name__ == "__main__":
    print("Starting YouTube Downloader Backend with yt-dlp...")
    print("Make sure ffmpeg is installed for video+audio merging!")
    app.run(host="0.0.0.0", port=5000, debug=False)