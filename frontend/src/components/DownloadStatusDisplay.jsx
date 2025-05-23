'use client';
import React from 'react';
import { useDownload } from '../context/DownloadContext';

const DownloadStatusDisplay = () => {
    const { downloadStatus, isLoading } = useDownload();

    const statusClass = `status-${downloadStatus.type}`;
    const sectionClass = `bg-white p-0 rounded-lg mb-8 transition-all duration-normal text-center shadow-card ${
        downloadStatus.type !== 'placeholder' || isLoading ? 'opacity-100 h-auto' : 'opacity-0 h-0'
    }`;

    return (
        <section className="mb-8">
            <div className={`card gradient-bg text-center`} style={{ maxWidth: 500, margin: '0 auto', boxShadow: 'var(--shadow)' }} id="download-status">
                <div className="p-6 sm:p-8">
                    {isLoading && downloadStatus.type === 'loading' ? (
                        <div className="loading-container mb-4">
                            <div className="progress-ring"></div>
                            <p className="text-text italic text-lg font-medium">{downloadStatus.message}</p>
                        </div>
                    ) : (
                        <p className={`text-lg font-semibold mb-2 ${statusClass}`}>{downloadStatus.message}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Files will be saved to your default downloads folder</p>
                </div>
            </div>
        </section>
    );
};

export default DownloadStatusDisplay;
