"use client";
import React, { useState } from 'react';
import { useDownload } from '../context/DownloadContext';

const DownloadForm = () => {
    const { youtubeUrl, setYoutubeUrl, getVideoInfo, isLoading } = useDownload();

    const handleSubmit = (e) => {
        e.preventDefault();
        getVideoInfo(youtubeUrl);
    };

    return (
        <section className="mb-12 px-4 pt-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl mb-6 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                       4K YouTube Downloader
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Download high-quality videos and audio from YouTube with ease. Simply paste the URL and choose your preferred format.
                    </p>
                </div>

                {/* Download Form Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 lg:p-12 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-100 to-transparent rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100 to-transparent rounded-full translate-y-24 -translate-x-24 opacity-50"></div>
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
                        Enter YouTube URL
                    </h2>
                    <div className="relative z-10">


                        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-center gap-4 w-full">
                            <div className="relative flex-1 w-full">
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <input
                                    type="text"
                                    id="youtube-url"
                                    name="youtube_url"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    required
                                    className="w-full -mb-[2px] pl-12 pr-4 py-4 text-gray-900 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all duration-200 placeholder-gray-400 text-base"
                                    autoComplete="off"
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                className={`min-w-[140px] w-full lg:w-auto px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 shadow-lg text-base ${isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl'
                                    }`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Processing</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span>Get Info</span>
                                    </div>
                                )}
                            </button>
                        </form>


                        {/* Info text */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                            Support for downloading entire playlists and channels is coming soon!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DownloadForm;