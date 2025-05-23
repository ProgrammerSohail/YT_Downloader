"use client";
import React, { useState } from 'react';
import { useDownload } from '../context/DownloadContext';

const VideoInfoDisplay = () => {
    const { videoInfo, formats, isLoading, downloadVideo, formatNumber, formatDuration, youtubeUrl } = useDownload();
    const [selectedVideoItag, setSelectedVideoItag] = useState('');
    const [selectedAudioItag, setSelectedAudioItag] = useState('');

    if (isLoading && !videoInfo) {
        return (
            <section className="bg-white rounded-lg p-0 mb-8 opacity-100 h-auto overflow-hidden transition-all duration-normal shadow-card" id="video-info">
                <div className="p-8">
                    <div className="text-center py-8 text-gray-500">
                        <div className="loading-container">
                            <div className="progress-ring"></div>
                            <p>Getting video info...</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!videoInfo) {
        return (
            <section className="bg-white rounded-lg p-0 mb-8 opacity-0 h-0 overflow-hidden transition-all duration-normal shadow-card" id="video-info">
                <div className="p-8">
                    <div className="text-center py-8 text-gray-500">
                        <i className="far fa-file-video text-5xl text-primary mb-4 opacity-50"></i>
                        <p className="text-center text-text italic p-5">Paste a YouTube URL above and click "Get Info" to see video details</p>
                    </div>
                </div>
            </section>
        );
    }

    // Filter and group video formats by resolution and type
    const videoFormatsMap = new Map();
    formats.video.forEach(format => {
        const key = `${format.resolution || 'Unknown'}-${format.type}`;
        if (!videoFormatsMap.has(key)) {
            videoFormatsMap.set(key, format);
        }
    });
    const uniqueVideoFormats = Array.from(videoFormatsMap.values());

    // Filter and group audio formats by abr
    const audioFormatsMap = new Map();
    formats.audio.forEach(format => {
        const key = `${format.abr || 'Unknown'}`;
        if (!audioFormatsMap.has(key)) {
            audioFormatsMap.set(key, format);
        }
    });
    const uniqueAudioFormats = Array.from(audioFormatsMap.values());

    const handleDownloadSubmit = (e) => {
        e.preventDefault();
        console.log('handleDownloadSubmit called');
        const urlToDownload = videoInfo?.video_url || youtubeUrl;
        console.log('Passing to downloadVideo: URL -', urlToDownload, 'Video Itag -', selectedVideoItag, 'Audio Itag -', selectedAudioItag);
        downloadVideo(urlToDownload, selectedVideoItag, selectedAudioItag);
    };

    return (
        <section className="mb-8">
            <div className="card gradient-bg" style={{ maxWidth: 800, margin: '0 auto', boxShadow: 'var(--shadow)' }}>
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="video-thumbnail flex-shrink-0 rounded-2xl overflow-hidden shadow-md w-full md:w-64 md:h-40 bg-white flex items-center justify-center">
                        <img src={videoInfo.thumbnail_url} alt="Video Thumbnail" className="w-full h-auto object-cover" style={{ maxHeight: 180 }} />
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                        <h3 className="text-2xl font-bold text-primary mb-1">{videoInfo.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <span className="flex items-center gap-1 bg-white/70 dark:bg-black/30 px-3 py-1 rounded-full shadow-sm"><i className="fas fa-user text-primary"></i> {videoInfo.author}</span>
                            <span className="flex items-center gap-1 bg-white/70 dark:bg-black/30 px-3 py-1 rounded-full shadow-sm"><i className="fas fa-eye text-primary"></i> {formatNumber(videoInfo.views)} views</span>
                            <span className="flex items-center gap-1 bg-white/70 dark:bg-black/30 px-3 py-1 rounded-full shadow-sm"><i className="fas fa-clock text-primary"></i> {formatDuration(videoInfo.length)} min</span>
                        </div>
                        <div className="flex flex-col gap-4 mt-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label htmlFor="video-quality-select" className="block mb-2 font-semibold text-text">Video Quality</label>
                                    <select
                                        id="video-quality-select"
                                        className="w-full py-3 px-4 rounded-full bg-white border-2 border-gray-200 text-text text-base appearance-none cursor-pointer transition-all duration-200 focus:border-primary focus:shadow-outline-primary"
                                        value={selectedVideoItag}
                                        onChange={(e) => setSelectedVideoItag(e.target.value)}
                                    >
                                        <option value="">Select Video Quality</option>
                                        {uniqueVideoFormats.map(format => (
                                            <option key={format.itag} value={format.itag}>
                                                {format.resolution || 'Unknown'} {format.fps || ''}fps ({format.type === 'video_progressive' ? 'Video + Audio' : 'Also Select Audio'}) - {format.size}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="audio-quality-select" className="block mb-2 font-semibold text-text">Audio Quality</label>
                                    <select
                                        id="audio-quality-select"
                                        className="w-full py-3 px-4 rounded-full bg-white border-2 border-gray-200 text-text text-base appearance-none cursor-pointer transition-all duration-200 focus:border-primary focus:shadow-outline-primary"
                                        value={selectedAudioItag}
                                        onChange={(e) => setSelectedAudioItag(e.target.value)}
                                    >
                                        <option value="">Select Audio Quality</option>
                                        {uniqueAudioFormats.map(format => (
                                            <option key={format.itag} value={format.itag}>
                                                {format.abr || 'Unknown'} - {format.size}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <form onSubmit={handleDownloadSubmit} className="w-full mt-2">
                                <button type="submit" id="download-btn" className="button w-full py-4 rounded-full text-lg font-bold uppercase tracking-wide shadow-md transition-all duration-200" disabled={isLoading}>
                                    DOWNLOAD
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VideoInfoDisplay;
