# YouTube Downloader Backend - Optimized yt-dlp by ORION
# Ultra-fast YouTube video downloader with advanced optimizations

from flask import Flask, request, send_file, jsonify, Response
from flask_cors import CORS
from yt_dlp import YoutubeDL
import os
import re
import uuid
import subprocess
import threading
import time
import logging
from concurrent.futures import ThreadPoolExecutor
import json

# Configure logging for better debugging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
app.config['DOWNLOAD_FOLDER'] = 'downloads'

# Create downloads directory if it doesn't exist
if not os.path.exists(app.config['DOWNLOAD_FOLDER']):
    os.makedirs(app.config['DOWNLOAD_FOLDER'])

# Optimized yt-dlp options for maximum performance
YDL_OPTS_BASE = {
    'quiet': True,
    'no_warnings': True,
    'noplaylist': True,
    'extract_flat': False,
    'writethumbnail': False,
    'writeinfojson': False,
    'socket_timeout': 30,
    'retries': 3,
    'fragment_retries': 3,
    'skip_unavailable_fragments': True,
    'ignoreerrors': False,
}

# Cache for video info to avoid repeated API calls
info_cache = {}
CACHE_DURATION = 300  # 5 minutes

# Thread pool for parallel operations
executor = ThreadPoolExecutor(max_workers=4)

def get_cached_info(url):
    """Get cached video info or fetch new if expired"""
    current_time = time.time()
    if url in info_cache:
        cached_data, timestamp = info_cache[url]
        if current_time - timestamp < CACHE_DURATION:
            logger.info(f"🚀 Using cached info for: {cached_data.get('title', 'Unknown')}")
            return cached_data
    
    # Fetch new info
    logger.info(f"🔍 Fetching new info for: {url}")
    with YoutubeDL(YDL_OPTS_BASE) as ydl:
        info = ydl.extract_info(url, download=False)
    
    # Cache the result
    info_cache[url] = (info, current_time)
    logger.info(f"✅ Cached info for: {info.get('title', 'Unknown')}")
    return info

def cleanup_file_async(filepath, delay=30):
    """Async file cleanup with delay"""
    def cleanup():
        time.sleep(delay)
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                logger.info(f"🗑️ Cleaned up: {os.path.basename(filepath)}")
        except Exception as e:
            logger.warning(f"⚠️ Cleanup failed for {filepath}: {e}")
    
    threading.Thread(target=cleanup, daemon=True).start()

def validate_youtube_url(url):
    """Fast URL validation"""
    if not url:
        return False
    return bool(re.match(r'^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$', url))

@app.route('/download', methods=['GET'])
def download_video():
    start_time = time.time()
    logger.info("🚀 Download request received")
    
    try:
        youtube_url = request.args.get('youtube_url')
        video_itag = request.args.get('video_itag')
        audio_itag = request.args.get('audio_itag')
        
        # Fast URL validation
        if not validate_youtube_url(youtube_url):
            logger.warning("❌ Invalid URL provided")
            return jsonify({
                'status': 'error',
                'message': 'Invalid YouTube URL format'
            }), 400
        
        try:
            # Use cached info for faster processing
            info = get_cached_info(youtube_url)
            logger.info(f"📺 Processing: {info.get('title', 'Unknown')[:50]}...")
        except Exception as e:
            logger.error(f"❌ Failed to fetch video info: {e}")
            return jsonify({
                'status': 'error',
                'message': f'Failed to fetch video information: {str(e)}'
            }), 400
            
        # Generate optimized filename
        unique_id = str(uuid.uuid4())[:8]
        safe_title = re.sub(r'[^\w\-_\. ]', '_', info.get('title', 'video'))[:40]
        base_filename = f"{safe_title}_{unique_id}"
        
        try:
            # PROGRESSIVE DOWNLOAD (fastest for single format)
            if video_itag and not audio_itag:
                logger.info(f"📥 Progressive download - Format: {video_itag}")
                video_format = next((f for f in info['formats'] if str(f.get('format_id')) == str(video_itag)), None)
                if not video_format:
                    return jsonify({'status': 'error', 'message': 'Selected video quality unavailable'}), 400
                
                # Check if progressive (has both video and audio)
                if video_format.get('acodec') != 'none' and video_format.get('vcodec') != 'none':
                    ext = video_format.get('ext', 'mp4')
                    filename = f"{base_filename}.{ext}"
                    filepath = os.path.join(app.config['DOWNLOAD_FOLDER'], filename)
                    
                    # Ultra-fast download with optimized settings
                    ydl_opts = {
                        **YDL_OPTS_BASE,
                        'format': str(video_itag),
                        'outtmpl': filepath,
                        'concurrent_fragment_downloads': 4,  # Parallel fragments
                    }
                    
                    with YoutubeDL(ydl_opts) as ydl:
                        ydl.download([youtube_url])
                    
                    cleanup_file_async(filepath)
                    
                    elapsed = time.time() - start_time
                    logger.info(f"✅ Progressive download completed in {elapsed:.2f}s")
                    
                    return send_file(
                        filepath,
                        as_attachment=True,
                        download_name=filename,
                        mimetype=video_format.get('mime_type', 'video/mp4')
                    )
                else:
                    return jsonify({'status': 'error', 'message': 'Format requires audio merging. Select both video and audio.'}), 400

            # AUDIO-ONLY DOWNLOAD
            elif audio_itag and not video_itag:
                logger.info(f"🎵 Audio download - Format: {audio_itag}")
                audio_format = next((f for f in info['formats'] if str(f.get('format_id')) == str(audio_itag)), None)
                if not audio_format:
                    return jsonify({'status': 'error', 'message': 'Selected audio quality unavailable'}), 400
                
                ext = audio_format.get('ext', 'm4a')
                filename = f"{base_filename}_audio.{ext}"
                filepath = os.path.join(app.config['DOWNLOAD_FOLDER'], filename)
                
                ydl_opts = {
                    **YDL_OPTS_BASE,
                    'format': str(audio_itag),
                    'outtmpl': filepath,
                    'concurrent_fragment_downloads': 4,
                }
                
                with YoutubeDL(ydl_opts) as ydl:
                    ydl.download([youtube_url])
                
                cleanup_file_async(filepath)
                
                elapsed = time.time() - start_time
                logger.info(f"✅ Audio download completed in {elapsed:.2f}s")
                
                return send_file(
                    filepath,
                    as_attachment=True,
                    download_name=filename,
                    mimetype=audio_format.get('mime_type', 'audio/m4a')
                )

            # MERGED DOWNLOAD (video + audio) - OPTIMIZED
            elif video_itag and audio_itag:
                logger.info(f"🔀 Merge download - Video: {video_itag}, Audio: {audio_itag}")
                
                # Check ffmpeg availability
                try:
                    subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
                except (subprocess.CalledProcessError, FileNotFoundError):
                    return jsonify({
                        'status': 'error',
                        'message': 'ffmpeg required for merging'
                    }), 500

                video_format = next((f for f in info['formats'] if str(f.get('format_id')) == str(video_itag)), None)
                audio_format = next((f for f in info['formats'] if str(f.get('format_id')) == str(audio_itag)), None)
                
                if not video_format or not audio_format:
                    return jsonify({'status': 'error', 'message': 'Selected formats unavailable'}), 400
                
                output_filename = f"{base_filename}_merged.mp4"
                output_path = os.path.join(app.config['DOWNLOAD_FOLDER'], output_filename)
                
                # METHOD 1: yt-dlp native merging (fastest)
                format_string = f"{video_itag}+{audio_itag}"
                logger.info(f"🚀 Attempting native yt-dlp merge: {format_string}")
                
                ydl_opts = {
                    **YDL_OPTS_BASE,
                    'format': format_string,
                    'outtmpl': output_path,
                    'merge_output_format': 'mp4',
                    'concurrent_fragment_downloads': 4,
                    'postprocessors': [{
                        'key': 'FFmpegVideoConvertor',
                        'preferedformat': 'mp4',
                    }, {
                        'key': 'FFmpegExtractAudio',
                        'preferredcodec': 'aac',
                        'preferredquality': '192',
                    }]
                }
                
                try:
                    with YoutubeDL(ydl_opts) as ydl:
                        ydl.download([youtube_url])
                    
                    cleanup_file_async(output_path)
                    
                    elapsed = time.time() - start_time
                    logger.info(f"✅ Native merge completed in {elapsed:.2f}s")
                    
                    return send_file(
                        output_path,
                        as_attachment=True,
                        download_name=output_filename,
                        mimetype='video/mp4'
                    )
                    
                except Exception as merge_error:
                    logger.warning(f"⚠️ Native merge failed, trying manual: {merge_error}")
                    
                    # METHOD 2: Manual parallel download + merge
                    temp_video = os.path.join(app.config['DOWNLOAD_FOLDER'], f"temp_v_{unique_id}.{video_format.get('ext', 'mp4')}")
                    temp_audio = os.path.join(app.config['DOWNLOAD_FOLDER'], f"temp_a_{unique_id}.{audio_format.get('ext', 'm4a')}")
                    
                    def download_video_stream():
                        ydl_opts = {**YDL_OPTS_BASE, 'format': str(video_itag), 'outtmpl': temp_video}
                        with YoutubeDL(ydl_opts) as ydl:
                            ydl.download([youtube_url])
                    
                    def download_audio_stream():
                        ydl_opts = {**YDL_OPTS_BASE, 'format': str(audio_itag), 'outtmpl': temp_audio}
                        with YoutubeDL(ydl_opts) as ydl:
                            ydl.download([youtube_url])
                    
                    # Parallel download
                    logger.info("⚡ Starting parallel downloads...")
                    video_future = executor.submit(download_video_stream)
                    audio_future = executor.submit(download_audio_stream)
                    
                    # Wait for both downloads
                    video_future.result()
                    audio_future.result()
                    logger.info("✅ Parallel downloads completed")
                    
                    # Fast merge with optimized ffmpeg settings
                    logger.info("🔀 Starting ffmpeg merge...")
                    result = subprocess.run([
                        'ffmpeg', '-y', '-i', temp_video, '-i', temp_audio,
                        '-c:v', 'copy', '-c:a', 'aac', '-strict', 'experimental',
                        output_path
                    ], check=True, capture_output=True, text=True)

                    logger.info(f"FFmpeg stdout:\n{result.stdout}")
                    logger.error(f"FFmpeg stderr:\n{result.stderr}")
                    
                    # Cleanup temp files immediately
                    for temp_file in [temp_video, temp_audio]:
                        if os.path.exists(temp_file):
                            os.remove(temp_file)
                    
                    cleanup_file_async(output_path)
                    
                    elapsed = time.time() - start_time
                    logger.info(f"✅ Manual merge completed in {elapsed:.2f}s")
                    
                    return send_file(
                        output_path,
                        as_attachment=True,
                        download_name=output_filename,
                        mimetype='video/mp4'
                    )

            else:
                 return jsonify({
                     'status': 'error',
                    'message': 'No download quality selected'
                 }), 400

        except Exception as e:
            logger.error(f"❌ Download error: {e}")
            return jsonify({'status': 'error', 'message': f"Download failed: {str(e)}"}), 500

    except Exception as e:
        logger.error(f"❌ Request error: {e}")
        return jsonify({'status': 'error', 'message': f"Request failed: {str(e)}"}), 500

@app.route('/video_metadata', methods=['POST'])
def get_video_metadata():
    start_time = time.time()
    try:
        youtube_url = request.form.get('youtube_url')
        
        if not validate_youtube_url(youtube_url):
            return jsonify({'status': 'error', 'message': 'Invalid YouTube URL'}), 400
        
        # Use cached info for instant response
        info = get_cached_info(youtube_url)
        
        elapsed = time.time() - start_time
        logger.info(f"⚡ Metadata retrieved in {elapsed:.2f}s")
        
        return jsonify({
            'status': 'success',
            'title': info.get('title', ''),
            'author': info.get('uploader', ''),
            'length': info.get('duration', 0),
            'views': info.get('view_count', 0),
            'thumbnail_url': info.get('thumbnail', '')
        })
    except Exception as e:
        logger.error(f"❌ Metadata error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/video_info', methods=['POST'])
def get_video_info():
    start_time = time.time()
    try:
        youtube_url = request.form.get('youtube_url')
        
        if not validate_youtube_url(youtube_url):
            return jsonify({'status': 'error', 'message': 'Invalid YouTube URL'}), 400
            
        logger.info(f"📊 Getting video info for: {youtube_url}")
        
        # Use cached info for speed
        info = get_cached_info(youtube_url)
        
        logger.info(f"📺 Processing: {info.get('title', 'Unknown')[:50]}...")
        
        # Fast format processing with optimized categorization
        streams_info = []
        formats = info.get('formats', [])
        
        # Process formats efficiently
        for fmt in formats:
            if not fmt.get('format_id') or not fmt.get('url'):
                continue
            
            # Calculate size efficiently
            filesize = fmt.get('filesize') or fmt.get('filesize_approx') or 0
            size_mb = f"{filesize / (1024 * 1024):.1f} MB" if filesize > 0 else 'N/A'
            
            # Basic stream data
            stream_entry = {
                'itag': fmt['format_id'],
                'mime_type': fmt.get('ext', ''),
                'size': size_mb,
                'url': fmt.get('url') # Include the direct URL
            }
            
            # Fast codec detection
            vcodec = fmt.get('vcodec', 'none')
            acodec = fmt.get('acodec', 'none')
            
            # Determine stream type and add specific info
            if vcodec != 'none' and acodec != 'none':
                # Progressive (video + audio)
                height = fmt.get('height')
                resolution_display = f"{height}p" if height is not None else fmt.get('resolution', '')

                stream_data = {
                    **stream_entry,
                    'type': 'video_progressive',
                    'resolution': resolution_display,
                    'fps': fmt.get('fps', ''),
                }
                streams_info.append(stream_data)
                
            elif vcodec != 'none':
                # Video only
                height = fmt.get('height')
                resolution_display = f"{height}p" if height is not None else fmt.get('resolution', '')

                stream_data = {
                    **stream_entry,
                    'type': 'video_adaptive',
                    'resolution': resolution_display,
                    'fps': fmt.get('fps', ''),
                }
                streams_info.append(stream_data)
                
            elif acodec != 'none':
                # Audio only
                stream_data = {
                    'itag': fmt['format_id'],
                    'mime_type': fmt.get('ext', ''),
                    'size': size_mb,
                    'url': fmt.get('url')
                }
                stream_data.update({
                    'type': 'audio',
                    'abr': fmt.get('abr', ''),
                })
                streams_info.append(stream_data)
        
        elapsed = time.time() - start_time
        logger.info(f"✅ Video info processed in {elapsed:.2f}s - {len(streams_info)} streams")
        
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
        logger.error(f"❌ Video info error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

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
        
        logger.info(f"📊 Getting formats for: {youtube_url}")
        
        with YoutubeDL(YDL_OPTS_BASE) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
        
        logger.info(f"✅ Successfully fetched formats for: {info.get('title', '')}")
        
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
            
            # Calculate size efficiently
            filesize = fmt.get('filesize') or fmt.get('filesize_approx') or 0
            size_mb = f"{filesize / (1024 * 1024):.1f} MB" if filesize > 0 else 'N/A'

            stream_data = {
                'itag': fmt['format_id'],
                'mime_type': fmt.get('ext', ''),
                'size': size_mb,
                'url': fmt.get('url') # Include the direct URL
            }
            
            if vcodec != 'none':
                # Video stream (progressive or adaptive)
                height = fmt.get('height')
                resolution_display = f"{height}p" if height is not None else fmt.get('resolution', '')

                stream_data.update({
                    'resolution': resolution_display,
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
        
        logger.info("✅ Sending formats data to frontend")
        
        return jsonify({
            'status': 'success',
            'title': info.get('title', ''),
            'formats': formats
        })

    except Exception as e:
        logger.error(f"❌ Formats error: {e}")
        return jsonify({
            'status': 'error',
            'message': f"Error getting formats: {str(e)}"
        }), 500

# Periodic cleanup task
def periodic_cleanup(cleanup_interval_seconds=3600, file_age_seconds=7200):
    logger.info("🧹 Starting periodic cleanup task...")
    while True:
        time.sleep(cleanup_interval_seconds)
        now = time.time()
        cleanup_count = 0
        try:
            for filename in os.listdir(app.config['DOWNLOAD_FOLDER']):
                filepath = os.path.join(app.config['DOWNLOAD_FOLDER'], filename)
                if os.path.isfile(filepath):
                    try:
                        # Get modification time
                        mod_time = os.path.getmtime(filepath)
                        if now - mod_time > file_age_seconds:
                            os.remove(filepath)
                            logger.info(f"🗑️ Cleaned up old file: {filename}")
                            cleanup_count += 1
                    except Exception as e:
                        logger.warning(f"⚠️ Error cleaning up {filename}: {e}")
            if cleanup_count > 0:
                logger.info(f"✅ Periodic cleanup removed {cleanup_count} old files.")
            else:
                logger.info("🧹 Periodic cleanup found no old files to remove.")
        except Exception as e:
            logger.error(f"❌ Error during periodic cleanup scan: {e}")

if __name__ == "__main__":
    logger.info("Starting YouTube Downloader Backend with yt-dlp...")
    logger.info("Make sure ffmpeg is installed for video+audio merging!")
    # Start the periodic cleanup thread
    cleanup_thread = threading.Thread(target=periodic_cleanup, daemon=True)
    cleanup_thread.start()
    app.run(host="0.0.0.0", port=5000, debug=False)