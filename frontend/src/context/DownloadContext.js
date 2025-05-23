"use client";
import React, { createContext, useState, useEffect, useContext } from 'react';

const DownloadContext = createContext();
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';

export const DownloadProvider = ({ children }) => {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [videoInfo, setVideoInfo] = useState(null);
    const [formats, setFormats] = useState([]);
    const [downloadStatus, setDownloadStatus] = useState({ message: 'Ready to download', type: 'placeholder' });
    const [downloadsHistory, setDownloadsHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load downloads history from localStorage on initial render
    useEffect(() => {
        const storedDownloads = localStorage.getItem('ytDownloads');
        if (storedDownloads) {
            setDownloadsHistory(JSON.parse(storedDownloads));
        }
    }, []);

    // Save downloads history to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('ytDownloads', JSON.stringify(downloadsHistory.slice(0, 10))); // Keep only last 10
    }, [downloadsHistory]);

    // Helper functions
    const isValidYoutubeUrl = (url) => {
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
        return regex.test(url);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat().format(num);
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const showStatus = (message, type) => {
        setDownloadStatus({ message, type });
        if (type !== 'loading') {
            setTimeout(() => {
                setDownloadStatus({ message: 'Ready to download', type: 'placeholder' });
            }, 5000);
        }
    };

    const getVideoInfo = async (url) => {
        if (!url) {
            showStatus('Enter a YouTube URL first!', 'error');
            return;
        }
        if (!isValidYoutubeUrl(url)) {
            showStatus('That doesn\'t look like a valid YouTube URL!', 'error');
            return;
        }

        setIsLoading(true);
        setVideoInfo(null); // Clear previous video info
        setFormats([]); // Clear previous formats
        showStatus('Getting video info...', 'loading');

        try {
            const formData = new FormData();
            formData.append('youtube_url', url);            // First get formats
            const formatsResponse = await fetch(`${BASE_URL}/formats`, {
                method: 'POST',
                body: formData
            });
            const formatsData = await formatsResponse.json();

            if (formatsData.status === 'error') {
                showStatus(formatsData.message, 'error');
                setIsLoading(false);
                return;
            }

            // Then get video info
            const response = await fetch(`${BASE_URL}/video_info`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.status === 'error') {
                showStatus(data.message, 'error');
                setIsLoading(false);
                return;
            }

            setVideoInfo(data);
            setFormats(formatsData.formats);
            // Reset status to a neutral state after successfully getting info
            showStatus('Ready to download', 'placeholder'); // Ensure the status is reset

        } catch (error) {
            showStatus(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadVideo = async (url, selectedVideoItag, selectedAudioItag) => {
        console.log('downloadVideo function called');
        console.log('Received in downloadVideo: URL -', url, 'Video Itag -', selectedVideoItag, 'Audio Itag -', selectedAudioItag);
        if (!url) {
            showStatus('Enter a YouTube URL first!', 'error');
            return;
        }
        if (!isValidYoutubeUrl(url)) {
            showStatus('That doesn\'t look like a valid YouTube URL!', 'error');
            return;
        }
        if (!selectedVideoItag && !selectedAudioItag) {
            showStatus('Select a video or audio quality to download!', 'error');
            return;
        }

        showStatus('Downloading... This might take a minute, be patient!', 'loading');
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('youtube_url', url);
            if (selectedVideoItag) {
                formData.append('video_itag', selectedVideoItag);
            }
            if (selectedAudioItag) {
                formData.append('audio_itag', selectedAudioItag);
            }            // Trigger download by creating a temporary link
            const downloadUrl = `${BASE_URL}/download?youtube_url=${encodeURIComponent(url)}&video_itag=${selectedVideoItag || ''}&audio_itag=${selectedAudioItag || ''}`;
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = ''; // Use server's suggested filename
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // Get metadata for download history
            const metadataResponse = await fetch(`${BASE_URL}/video_metadata`, {
                method: 'POST',
                body: formData
            });
            const metadata = await metadataResponse.json();

            if (metadata.status === 'error') {
                showStatus(metadata.message, 'error');
                setIsLoading(false);
                return;
            }

            showStatus(`Successfully downloaded: ${metadata.title}`, 'success');

            const download = {
                id: Date.now(),
                title: metadata.title,
                author: metadata.author,
                fileSize: metadata.file_size,
                filePath: metadata.file_path, // This might not be directly usable on frontend
                type: (selectedVideoItag && selectedAudioItag) ? 'merged' : (selectedVideoItag ? 'video' : 'audio'),
                timestamp: new Date().toISOString()
            };

            setDownloadsHistory(prev => [download, ...prev]);

        } catch (error) {
            showStatus(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const clearDownloadsHistory = () => {
        if (window.confirm('Are you sure you want to clear your download history?')) {
            setDownloadsHistory([]);
            showStatus('Download history cleared!', 'success');
        }
    };

    const deleteDownloadFromHistory = (id) => {
        setDownloadsHistory(prev => prev.filter(download => download.id !== id));
        showStatus('Download removed from history!', 'success');
    };

    return (
        <DownloadContext.Provider
            value={{
                youtubeUrl,
                setYoutubeUrl,
                videoInfo,
                formats,
                downloadStatus,
                downloadsHistory,
                isLoading,
                getVideoInfo,
                downloadVideo,
                showStatus,
                clearDownloadsHistory,
                deleteDownloadFromHistory,
                isValidYoutubeUrl,
                formatNumber,
                formatDuration,
                formatDate,
            }}
        >
            {children}
        </DownloadContext.Provider>
    );
};

export const useDownload = () => useContext(DownloadContext);
