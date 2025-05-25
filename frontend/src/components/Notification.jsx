"use client";
import React, { useEffect, useState } from 'react';
import { useDownload } from '../context/DownloadContext';

const Notification = () => {
    const { downloadStatus, showStatus } = useDownload();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (downloadStatus.type !== 'placeholder' && downloadStatus.message !== 'Ready to download') {
            setIsVisible(true);
            if (downloadStatus.type !== 'loading') {
                const timer = setTimeout(() => {
                    setIsVisible(false);
                    // Reset status after hiding notification
                    setTimeout(() => showStatus('Ready to download', 'placeholder'), 300);
                }, 5000); // Matches original 5-second timeout
                return () => clearTimeout(timer);
            }
        } else {
            setIsVisible(false);
        }
    }, [downloadStatus, showStatus]);

    const notificationClass = `notification ${downloadStatus.type} ${isVisible ? 'show' : ''}`;

    // Only render if there's an active message or it's loading
    if (downloadStatus.type === 'placeholder' && !isVisible) {
        return null;
    }

    return (
        <div className={`${notificationClass} animate-pulse `} >
            {downloadStatus.message}
        </div>
    );
};

export default Notification;
