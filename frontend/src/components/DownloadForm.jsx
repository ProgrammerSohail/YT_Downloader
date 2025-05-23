"use client";
import React, { useState } from 'react';
import { useDownload } from '../context/DownloadContext';

const DownloadForm = () => {
    const { youtubeUrl, setYoutubeUrl, getVideoInfo, isLoading } = useDownload();
 const Name = process.env.NEXT_PUBLIC_NAME || '8K Blitz';
    const handleSubmit = (e) => {
        e.preventDefault();
        getVideoInfo(youtubeUrl);
    };

    return (
        <section className="mb-12 px-4 pt-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">

                    <h1 className="text-5xl items-center flex justify-center gap-4 font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                        <div className="inline-flex items-center justify-center w-20 rounded-2xl shadow-lg">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.5" d="M21.9998 12.6978C21.9983 14.1674 21.9871 15.4165 21.9036 16.4414C21.8067 17.6308 21.6081 18.6246 21.1636 19.45C20.9676 19.814 20.7267 20.1401 20.4334 20.4334C19.601 21.2657 18.5405 21.6428 17.1966 21.8235C15.8835 22 14.2007 22 12.0534 22H11.9466C9.79929 22 8.11646 22 6.80345 21.8235C5.45951 21.6428 4.39902 21.2657 3.56664 20.4334C2.82871 19.6954 2.44763 18.777 2.24498 17.6376C2.04591 16.5184 2.00949 15.1259 2.00192 13.3967C2 12.9569 2 12.4917 2 12.0009V11.9466C1.99999 9.79929 1.99998 8.11646 2.17651 6.80345C2.3572 5.45951 2.73426 4.39902 3.56664 3.56664C4.39902 2.73426 5.45951 2.3572 6.80345 2.17651C7.97111 2.01952 9.47346 2.00215 11.302 2.00024C11.6873 1.99983 12 2.31236 12 2.69767C12 3.08299 11.6872 3.3952 11.3019 3.39561C9.44749 3.39757 8.06751 3.41446 6.98937 3.55941C5.80016 3.7193 5.08321 4.02339 4.5533 4.5533C4.02339 5.08321 3.7193 5.80016 3.55941 6.98937C3.39683 8.19866 3.39535 9.7877 3.39535 12C3.39535 12.2702 3.39535 12.5314 3.39567 12.7844L4.32696 11.9696C5.17465 11.2278 6.45225 11.2704 7.24872 12.0668L11.2392 16.0573C11.8785 16.6966 12.8848 16.7837 13.6245 16.2639L13.9019 16.0689C14.9663 15.3209 16.4064 15.4076 17.3734 16.2779L20.0064 18.6476C20.2714 18.091 20.4288 17.3597 20.5128 16.3281C20.592 15.3561 20.6029 14.1755 20.6044 12.6979C20.6048 12.3126 20.917 12 21.3023 12C21.6876 12 22.0002 12.3125 21.9998 12.6978Z" fill="#1C274C"></path> <path fillRule="evenodd" clipRule="evenodd" d="M17.5 2C15.3787 2 14.318 2 13.659 2.65901C13 3.31802 13 4.37868 13 6.5C13 8.62132 13 9.68198 13.659 10.341C14.318 11 15.3787 11 17.5 11C19.6213 11 20.682 11 21.341 10.341C22 9.68198 22 8.62132 22 6.5C22 4.37868 22 3.31802 21.341 2.65901C20.682 2 19.6213 2 17.5 2ZM19.5303 7.53033L18.0303 9.03033C17.7374 9.32322 17.2626 9.32322 16.9697 9.03033L15.4697 7.53033C15.1768 7.23744 15.1768 6.76256 15.4697 6.46967C15.7626 6.17678 16.2374 6.17678 16.5303 6.46967L16.75 6.68934V4.5C16.75 4.08579 17.0858 3.75 17.5 3.75C17.9142 3.75 18.25 4.08579 18.25 4.5V6.68934L18.4697 6.46967C18.7626 6.17678 19.2374 6.17678 19.5303 6.46967C19.8232 6.76256 19.8232 7.23744 19.5303 7.53033Z" fill="#1C274C"></path> </g></svg>
                        </div>  {Name} - YouTube Downloader
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