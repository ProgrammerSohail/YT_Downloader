"use client";
import React, { useState } from 'react';
import { useDownload } from '../context/DownloadContext';

const VideoInfoDisplay = () => {
    const { videoInfo, formats, isLoading, downloadVideo, formatNumber, formatDuration, youtubeUrl } = useDownload();
    const [selectedVideoItag, setSelectedVideoItag] = useState('');
    const [selectedAudioItag, setSelectedAudioItag] = useState('');

    if (isLoading && !videoInfo) {
        return (
            <div className="mx-auto flex flex-col items-center justify-center h-48 max-w-md p-8">
            <div className="relative w-16 h-16 mb-6">
                
            </div>
            <div className="text-center">
                <p className="text-gray-800 font-semibold text-xl mb-2">
                Getting video info...
                </p>
                <p className="text-gray-500 text-sm bg-gray-100/50 px-4 py-2 rounded-full inline-block">
                Please wait a moment
                </p>
            </div>
            </div>
        );
    }

    if (!videoInfo) {
        return (
            <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-0 mb-8 opacity-0 h-0 overflow-hidden transition-all duration-500 shadow-lg border border-white/50" id="video-info">
                <div className="p-8">
                    <div className="text-center py-12 text-gray-500">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 text-lg font-medium italic p-5">Paste a YouTube URL above and click "Get Info" to see video details</p>
                    </div>
                </div>
            </section>
        );
    }

    // Filter and group video formats by resolution and type, and audio formats by abr from the flat list
    const videoFormatsMap = new Map();
    const audioFormatsMap = new Map();
    
    formats.forEach(format => {
        const vcodec = format.vcodec || 'none';
        const acodec = format.acodec || 'none';

        if (vcodec !== 'none') {
            // It's a video stream (can be progressive or video-only)
            const key = `${format.resolution || 'Unknown'}-${format.type}`;
            if (!videoFormatsMap.has(key)) {
                videoFormatsMap.set(key, format);
            }
        }
        
        // Check if it's an audio stream (can be audio-only or part of progressive)
        // We'll add it to the audio map if it has an audio codec and is not already added by abr
        if (acodec !== 'none') {
             const key = `${format.abr || format.audio_channels || 'Unknown'}`;
             if (!audioFormatsMap.has(key)) {
                 audioFormatsMap.set(key, format);
             }
        }
    });
    
    const uniqueVideoFormats = Array.from(videoFormatsMap.values());
    const uniqueAudioFormats = Array.from(audioFormatsMap.values());

    const handleDownloadSubmit = (e) => {
        e.preventDefault();
        console.log('handleDownloadSubmit called');
        const urlToDownload = videoInfo?.video_url || youtubeUrl;
        console.log('Passing to downloadVideo: URL -', urlToDownload, 'Video Itag -', selectedVideoItag, 'Audio Itag -', selectedAudioItag);
        downloadVideo(urlToDownload, selectedVideoItag, selectedAudioItag);
    };

    return (
        <section className="mb-8 px-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden" style={{ maxWidth: 900, margin: '0 auto' }}>
                <div className="bg-gradient-to-r from-gray-50 to-white p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        {/* Enhanced Thumbnail */}
                        <div className="flex-shrink-0 relative group">
                            <div className="w-full md:w-72 md:h-44 bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                                <img 
                                    src={videoInfo.thumbnail_url} 
                                    alt="Video Thumbnail" 
                                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" 
                                    style={{ maxHeight: 180 }} 
                                />
                            </div>
                            {/* Play overlay */}
                            <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        {/* Video Info */}
                        <div className="flex-1 flex flex-col gap-4 min-w-0">
                            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 leading-tight">
                                {videoInfo.title}
                            </h3>
                            
                            {/* Enhanced Stats */}
                            <div className="flex flex-wrap gap-3 text-sm">
                                <span className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-blue-800">{videoInfo.author}</span>
                                </span>
                                
                                <span className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-green-800">{formatNumber(videoInfo.views)} views</span>
                                </span>
                                
                                <span className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-purple-800">{formatDuration(videoInfo.length)} min</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Download Options Section */}
                <div className="p-8 bg-gray-50/50">
                    <h4 className="text-xl font-bold text-gray-800 mb-6">Download Options</h4>
                    
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Video Quality Select */}
                            <div className="flex-1">
                                <label htmlFor="video-quality-select" className="block mb-3 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                    Video Quality
                                </label>
                                <div className="relative">
                                    <select
                                        id="video-quality-select"
                                        className="w-full py-4 px-5 pr-12 rounded-2xl bg-white border-2 border-gray-200 text-gray-800 text-base appearance-none cursor-pointer transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 shadow-sm hover:border-gray-300 hover:shadow-md"
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
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Audio Quality Select */}
                            <div className="flex-1">
                                <label htmlFor="audio-quality-select" className="block mb-3 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                    Audio Quality
                                </label>
                                <div className="relative">
                                    <select
                                        id="audio-quality-select"
                                        className="w-full py-4 px-5 pr-12 rounded-2xl bg-white border-2 border-gray-200 text-gray-800 text-base appearance-none cursor-pointer transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 shadow-sm hover:border-gray-300 hover:shadow-md"
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
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Enhanced Download Button */}
                        <form onSubmit={handleDownloadSubmit} className="w-full mt-4">
                            <button 
                                type="submit" 
                                id="download-btn" 
                                className={`w-full py-5 rounded-2xl text-lg font-bold uppercase tracking-wide shadow-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 ${
                                    isLoading 
                                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:shadow-xl focus:ring-emerald-500/50'
                                }`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-gray-600/30 border-t-gray-600 rounded-full animate-spin"></div>
                                        <span>DOWNLOADING...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-3">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>DOWNLOAD</span>
                                    </div>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VideoInfoDisplay;