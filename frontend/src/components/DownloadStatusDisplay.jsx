'use client';
import React from 'react';
import { useDownload } from '../context/DownloadContext';

const DownloadStatusDisplay = () => {
    const { downloadStatus, isLoading } = useDownload();

    const getStatusIcon = () => {
        switch (downloadStatus.type) {
            case 'success':
                return (
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            case 'loading':
                return (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                );
            default:
                return null;
        }
    };

    const getStatusColor = () => {
        switch (downloadStatus.type) {
            case 'success':
                return 'text-green-700';
            case 'error':
                return 'text-red-700';
            case 'loading':
                return 'text-blue-700';
            default:
                return 'text-gray-700';
        }
    };

    const getBgColor = () => {
        switch (downloadStatus.type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'loading':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const shouldShow = downloadStatus.type !== 'placeholder' || isLoading;

    return (
        <section className={`mb-8 px-4 transition-all duration-500 ${shouldShow ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <div className="max-w-2xl mx-auto">
                <div className={`rounded-2xl border-2 shadow-lg backdrop-blur-sm p-8 text-center transition-all duration-300 ${getBgColor()}`}>
                    <div className="flex flex-col items-center">
                        {getStatusIcon()}
                        
                        <h3 className={`text-lg font-semibold mb-2 ${getStatusColor()}`}>
                            {downloadStatus.message}
                        </h3>
                        
                        {isLoading && downloadStatus.type === 'loading' && (
                            <div className="w-full max-w-xs mt-4">
                                <div className="bg-white/50 rounded-full h-2 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Files will be saved to your default downloads folder</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DownloadStatusDisplay;