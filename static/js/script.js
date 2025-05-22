// ORION's YouTube Downloader - Frontend JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const youtubeForm = document.getElementById('youtube-form');
    const youtubeUrl = document.getElementById('youtube-url');
    const infoBtn = document.getElementById('info-btn');
    const downloadBtn = document.getElementById('download-btn');
    const videoInfoSection = document.getElementById('video-info');
    const downloadStatusSection = document.getElementById('download-status');
    const downloadsList = document.getElementById('downloads-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    
    // Templates
    const videoInfoTemplate = document.getElementById('video-info-template');
    const downloadItemTemplate = document.getElementById('download-item-template');
    
    // Event Listeners
    infoBtn.addEventListener('click', getVideoInfo);
    youtubeForm.addEventListener('submit', downloadVideo);
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your download history?')) {
            downloads = [];
            localStorage.setItem('ytDownloads', '[]');
            renderDownloads();
            showStatus('Download history cleared!', 'success');
        }
    });
    
    // Store downloads in session
    let downloads = JSON.parse(localStorage.getItem('ytDownloads') || '[]');
    
    // Display existing downloads
    renderDownloads();
    
    // Get video info
async function getVideoInfo() {
    const url = youtubeUrl.value.trim();
    
    if (!url) {
        showStatus('Enter a fucking YouTube URL first!', 'error');
        return;
    }
    
    if (!isValidYoutubeUrl(url)) {
        showStatus('That doesn\'t look like a valid YouTube URL, dumbass!', 'error');
        return;
    }
    
    // Show loading
    videoInfoSection.innerHTML = '<div class="loading-container"><div class="loading"></div><p>Getting video info...</p></div>';
    videoInfoSection.classList.add('active');
    
    try {
        const formData = new FormData();
        formData.append('youtube_url', url);
        
        // First get formats
        const formatsResponse = await fetch('/formats', {
            method: 'POST',
            body: formData
        });
        
        const formatsData = await formatsResponse.json();
        
        if (formatsData.status === 'error') {
            showStatus(formatsData.message, 'error');
            videoInfoSection.classList.remove('active');
            return;
        }
        
        // Then get video info
        const response = await fetch('/video_info', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status === 'error') {
            showStatus(data.message, 'error');
            videoInfoSection.classList.remove('active');
            return;
        }
        
        // Combine the data
        data.formats = formatsData.formats;
        
        // Clone the template
        const videoInfoClone = videoInfoTemplate.content.cloneNode(true);
        
        // Fill in the data
        videoInfoClone.querySelector('.video-thumbnail img').src = data.thumbnail_url;
        videoInfoClone.querySelector('.video-title').textContent = data.title;
        videoInfoClone.querySelector('.video-author').textContent = `by ${data.author}`;
        videoInfoClone.querySelector('.video-views').textContent = `${formatNumber(data.views)} views`;
        videoInfoClone.querySelector('.video-length').textContent =`${ formatDuration(data.length)} minutes`;
        
        // Clear the video info section completely before adding new content
        videoInfoSection.innerHTML = '';
        videoInfoSection.classList.remove('active'); // Remove active class while empty
        
        // Append the video info template clone first
        videoInfoSection.appendChild(videoInfoClone);
        
        // Add quality selection options
        const qualityContainer = document.createElement('div');
        qualityContainer.className = 'quality-options';
        
        // Filter and group video formats by resolution and type
        const videoFormatsMap = new Map();
        data.formats.video.forEach(format => {
            const key = `${format.resolution || 'Unknown'}-${format.type}`;
            if (!videoFormatsMap.has(key)) {
                videoFormatsMap.set(key, format);
            }
        });
        const uniqueVideoFormats = Array.from(videoFormatsMap.values());
        
        // Filter and group audio formats by abr
        const audioFormatsMap = new Map();
        data.formats.audio.forEach(format => {
            const key = `${format.abr || 'Unknown'}`;
            if (!audioFormatsMap.has(key)) {
                audioFormatsMap.set(key, format);
            }
        });
        const uniqueAudioFormats = Array.from(audioFormatsMap.values());
        
        qualityContainer.innerHTML = `
        <h1 class="video-audio">Select Video/Audio Quality</h1>
                <p class="video-audio-alert">Choose the quality you want to download. You can select both video and audio if you want to merge them.</p>
            <div class="quality-section">
            
                <h3>Video Quality Options</h3>
                <select id="video-quality-select" class="quality-select">
                    <option value="">Select Video Quality</option>
                    ${uniqueVideoFormats.map(format => {
                        const streamType = format.type === 'video_progressive' ? 'Video + Audio' : 'Also Select Audio';
                        return `<option value="${format.itag}">${format.resolution || 'Unknown'} ${format.fps || ''}fps (${streamType}) - ${format.size}</option>`;
                    }).join('')}
                </select>
            </div>
            <div class="quality-section">
                <h3>Audio Quality Options</h3>
                <select id="audio-quality-select" class="quality-select">
                    <option value=""> Quality</option>
                    ${uniqueAudioFormats.map(format => {
                        return `<option value="${format.itag}">${format.abr || 'Unknown'} - ${format.size}</option>`;
                    }).join('')}
                </select>
            </div>
            <form id="download-form" class="download-form">
                <button type="submit" id="download-btn" class="download-button">DOWNLOAD</button>
            </form>
        `;
        
        // Append the quality container after the video info
        videoInfoSection.appendChild(qualityContainer);
        videoInfoSection.classList.add('active'); // Add active class back
        
        // Add event listener to the new download form
        document.getElementById('download-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            await downloadVideo(e);
        });
        
        // Add event listeners to quality selectors
        document.getElementById('video-quality-select').addEventListener('change', function() {
            if (this.value) {
                // Don't clear the audio select - allow selecting both video and audio
                const downloadTypeVideo = document.getElementById('video');
                if (downloadTypeVideo) {
                    downloadTypeVideo.checked = true;
                }
            }
        });
        
        document.getElementById('audio-quality-select').addEventListener('change', function() {
            if (this.value) {
                // Don't clear the video select - allow selecting both video and audio
                const downloadTypeAudio = document.getElementById('audio');
                if (downloadTypeAudio) {
                    downloadTypeAudio.checked = true;
                }
            }
        });
        
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        videoInfoSection.classList.remove('active');
    }
}
    
    // Download video
async function downloadVideo(e) {
    if (e) e.preventDefault();
    
    const url = youtubeUrl.value.trim();
    
    // Get selected video and audio itags
    const videoSelect = document.getElementById('video-quality-select');
    const audioSelect = document.getElementById('audio-quality-select');
    
    if (!videoSelect && !audioSelect) {
        showStatus('No quality options available. Get video info first!', 'error');
        return;
    }
    
    const selectedVideoItag = videoSelect ? videoSelect.value : '';
    const selectedAudioItag = audioSelect ? audioSelect.value : '';
    
    // Determine download type based on selection
    let downloadType = '';
    if (selectedVideoItag && selectedAudioItag) {
        downloadType = 'merged'; // Custom type for merging
    } else if (selectedVideoItag) {
        downloadType = 'video';
    } else if (selectedAudioItag) {
        downloadType = 'audio';
    } else {
        // No quality selected, maybe use the default radio button selection as a fallback?
        // For now, let's require a quality selection if the dropdowns are present
        showStatus('Select a video or audio quality to download, you incompetent buffoon!', 'error');
        return;
    }
    
    if (!url) {
        showStatus('Enter a fucking YouTube URL first!', 'error');
        return;
    }
    
    if (!isValidYoutubeUrl(url)) {
        showStatus('That doesn\'t look like a valid YouTube URL, dumbass!', 'error');
        return;
    }
    
    // Construct the download URL with parameters
    let downloadUrl = `/download?youtube_url=${encodeURIComponent(url)}`;
    if (selectedVideoItag) {
        downloadUrl += `&video_itag=${selectedVideoItag}`;
    }
    if (selectedAudioItag) {
        downloadUrl += `&audio_itag=${selectedAudioItag}`;
    }

    // Create a temporary link and trigger the download
    const link = document.createElement('a');
    link.href = downloadUrl;
    // The backend sets the Content-Disposition header, but adding download attribute is good practice
    // link.download = \`\${document.querySelector(\'.video-title\').textContent || \'video\'}.\${downloadType === \'audio\' ? \'mp3\' : \'mp4\'}\`; // Optional: suggest filename
    
    // Show a status message indicating download is starting (browser handles progress)
    showStatus('Your download is starting... Check your browser\'s downloads section.', 'loading');

    // Append to body and click
    document.body.appendChild(link);
    link.click();

    // Clean up the temporary link
    document.body.removeChild(link);

    // We no longer need to process the response or manually add to history for automatic downloads
    // The history logic below is likely for a different flow or should be adjusted.

    // Keep the existing download history update logic for now, but understand it won't track progress
    // or re-downloads for merged files with this automatic download method.
    // You may want to rethink the download history UI/logic based on this change.

    // Example of how you might still add to history (without the green download button for merged):
    // if (downloadType === 'merged' || downloadType === 'video' || downloadType === 'audio') {
    //     addToDownloadHistory(\`\${document.querySelector(\'.video-title\').textContent || \'Video\'} (\${downloadType})\`);\n    // }\n

    // The current addToDownloadHistory function seems to expect a filename to create a link.
    // We should probably modify or bypass it for the streaming download.
    
    // Temporarily disable or comment out the existing fetch logic and subsequent response handling:
    /*
    try {
        const formData = new FormData();
        formData.append('youtube_url', url);
        
        // Add selected itags to form data
        if (selectedVideoItag) {
            formData.append('video_itag', selectedVideoItag);
        }
        if (selectedAudioItag) {
            formData.append('audio_itag', selectedAudioItag);
        }

        const response = await fetch('/download', {
            method: 'GET', 
            body: formData // This is incorrect for GET, params should be in URL
        });
        
        // --- The following response processing is for a non-streaming JSON response ---\n        // For streaming download, the browser handles the response directly.\n

        const data = await response.json();
        
        if (data.status === 'success') {
            showStatus(`Successfully downloaded: ${data.title}`, 'success');
            // addToDownloadHistory(data); // This needs adjustment
        } else {
            showStatus(`Download failed: ${data.message}`, 'error');
        }
        
    } catch (error) {
        showStatus(`Error during download: ${error.message}`, 'error');
    }
    */
}
    
    // Render downloads list
    function renderDownloads() {
        downloadsList.innerHTML = '';
        
        if (downloads.length === 0) {
            downloadsList.innerHTML = '<p class="no-downloads">No downloads yet. Get downloading, you lazy fuck!</p>';
            return;
        }
        
        downloads.forEach(download => {
            const downloadItemClone = downloadItemTemplate.content.cloneNode(true);
            
            downloadItemClone.querySelector('.download-title').textContent = download.title;
            downloadItemClone.querySelector('.download-meta').textContent = 
                `${download.author} • ${download.fileSize} • ${download.type === 'audio' ? 'Audio' : 'Video'} • ${formatDate(download.timestamp)}`;
            
            const downloadLink = downloadItemClone.querySelector('.download-link');
            if (downloadLink && download.filePath) {
               
                downloadLink.textContent = download.type === 'audio' ? 'Downloaded Audio Successfully' : 'Downloaded Video Successfully';
            }
            
            const deleteBtn = downloadItemClone.querySelector('.delete-download');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    const index = downloads.findIndex(d => d.id === download.id);
                    if (index !== -1) {
                        downloads.splice(index, 1);
                        localStorage.setItem('ytDownloads', JSON.stringify(downloads));
                        renderDownloads();
                        showStatus('Download removed from history!', 'success');
                    }
                });
            }
            
            downloadsList.appendChild(downloadItemClone);
        });
    }
    
    function deleteDownload(index) {
        downloads.splice(index, 1);
        localStorage.setItem('ytDownloads', JSON.stringify(downloads));
        renderDownloads();
        showStatus('Download removed from history!', 'success');
    }
    
    // Show status message
    function showStatus(message, type) {
        downloadStatusSection.innerHTML = `<p class="status-${type}">${message}</p>`;
        downloadStatusSection.classList.add('active');
        
        if (type !== 'loading') {
            setTimeout(() => {
                downloadStatusSection.classList.remove('active');
            }, 5000);
        }
    }
    
    // Helper functions
    function isValidYoutubeUrl(url) {
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
        return regex.test(url);
    }
    
    function formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }
    
    function formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
});

async function downloadStream(url, filename) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength, 10);
        let loaded = 0;
        
        // Create a ReadableStream to track progress
        const reader = response.body.getReader();
        const stream = new ReadableStream({
            async start(controller) {
                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;
                    
                    loaded += value.length;
                    const progress = (loaded / total) * 100;
                    updateDownloadProgress(progress.toFixed(2));
                    
                    controller.enqueue(value);
                }
                controller.close();
            }
        });
        
        // Create response with the stream
        const newResponse = new Response(stream);
        const blob = await newResponse.blob();
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        a.remove();
        
        updateDownloadStatus('success', 'Download completed successfully!');
        addToDownloadHistory(filename);
    } catch (error) {
        console.error('Download failed:', error);
        updateDownloadStatus('error', `Download failed: ${error.message}`);
        throw error;
    }
}

function updateDownloadProgress(progress) {
    const statusElement = document.querySelector('.status-placeholder');
    const progressRing = document.querySelector('.progress-ring');
    
    if (statusElement && progressRing) {
        statusElement.textContent = `Downloading: ${progress}%`;
        // Update progress ring animation
        progressRing.style.background = `conic-gradient(var(--primary-color) ${progress * 3.6}deg, var(--bg-secondary) 0deg)`;
    }
}

function updateDownloadStatus(type, message) {
    const statusElement = document.querySelector('.status-placeholder');
    const progressRing = document.querySelector('.progress-ring');
    
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status-placeholder ${type}`;
        
        if (type === 'success') {
            progressRing.style.background = 'var(--success-color)';
        } else if (type === 'error') {
            progressRing.style.background = 'var(--error-color)';
        }
    }
}

function addToDownloadHistory(filename) {
    const downloadsList = document.getElementById('downloads-list');
    const placeholder = downloadsList.querySelector('.placeholder-content');
    
    if (placeholder) {
        placeholder.style.display = 'none';
    }
    
    const downloadItem = document.createElement('div');
    downloadItem.className = 'download-item';
    downloadItem.innerHTML = `
        <i class="fas fa-file-video"></i>
        <span class="download-name">${filename}</span>
        <span class="download-time">${new Date().toLocaleTimeString()}</span>
    `;
    
    downloadsList.insertBefore(downloadItem, downloadsList.firstChild);
}

function handleDownloadButtonClick(event) {
    event.preventDefault();
    const button = event.target;
    const originalText = button.textContent;
    
    button.disabled = true;
    button.textContent = 'Processing...';
    button.style.opacity = '0.7';

    // Get selected quality
    const qualitySelect = document.querySelector('.quality-select');
    const selectedQuality = qualitySelect.value;

    if (!selectedQuality) {
        showNotification('Please select a video quality', 'error');
        button.disabled = false;
        button.textContent = originalText;
        button.style.opacity = '1';
        return;
    }

    // Get video URL from the input field
    const videoUrl = document.getElementById('video-url').value;

    if (!videoUrl) {
        showNotification('Please enter a video URL', 'error');
        button.disabled = false;
        button.textContent = originalText;
        button.style.opacity = '1';
        return;
    }

    // Add to download history
    addToDownloadHistory(videoUrl, selectedQuality);

    // Simulate download process (replace with actual download logic)
    downloadVideo(videoUrl, selectedQuality)
        .then(() => {
            showNotification('Download started successfully!', 'success');
            button.textContent = 'Downloaded!';
            setTimeout(() => {
                button.disabled = false;
                button.textContent = originalText;
                button.style.opacity = '1';
            }, 2000);
        })
        .catch(error => {
            showNotification('Download failed: ' + error.message, 'error');
            button.disabled = false;
            button.textContent = originalText;
            button.style.opacity = '1';
        });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add event listener to download button
document.querySelector('.download-button').addEventListener('click', handleDownloadButtonClick);

// Initialize quality options with animation
document.addEventListener('DOMContentLoaded', () => {
    const qualityOptions = document.querySelector('.quality-options');
    if (qualityOptions) {
        qualityOptions.style.display = 'flex';
    }
});