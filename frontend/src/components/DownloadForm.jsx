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
        <section className="mb-8">
            <div className="card gradient-bg" style={{ maxWidth: 600, margin: '0 auto', boxShadow: 'var(--shadow)' }}>
                <form onSubmit={handleSubmit} className="download-form flex flex-col sm:flex-row gap-4 items-center">
                    <input
                        type="text"
                        id="youtube-url"
                        name="youtube_url"
                        placeholder="Paste YouTube URL here..."
                        required
                        className="flex-1 py-4 px-6 border-none bg-white text-text text-base transition-all duration-normal border-2 border-gray-200 rounded-full focus:outline-none focus:border-primary focus:shadow-outline-primary shadow-sm"
                        autoComplete="off"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        disabled={isLoading}
                        style={{ minWidth: 0 }}
                    />
                    <button
                        type="submit"
                        id="info-btn"
                        className="button flex items-center gap-2 px-8 py-4 rounded-full shadow-md text-base font-bold uppercase tracking-wide transition-all duration-200"
                        disabled={isLoading}
                    >
                        <i className="fas fa-search"></i>
                        {isLoading ? 'Getting Info...' : 'Get Info'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default DownloadForm;
