'use client';
import React from 'react';
import { DownloadProvider } from '../context/DownloadContext';
import Notification from './Notification';

export default function ClientLayout({ children }) {
  const [theme, setTheme] = React.useState(
    typeof window !== 'undefined' && localStorage.getItem('theme') || 'light'
  );

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Add enhanced CSS variables
    const root = document.documentElement;
    root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
    root.style.setProperty('--gradient-secondary', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)');
    root.style.setProperty('--gradient-accent', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)');
    root.style.setProperty('--shadow-soft', '0 10px 40px rgba(0, 0, 0, 0.1)');
    root.style.setProperty('--shadow-medium', '0 20px 60px rgba(0, 0, 0, 0.15)');
    root.style.setProperty('--shadow-strong', '0 30px 80px rgba(0, 0, 0, 0.2)');
    root.style.setProperty('--border-radius', '16px');
    root.style.setProperty('--border-radius-lg', '24px');
  }, [theme]);

  return (
    <DownloadProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0  opacity-50"></div>
        <div className="relative z-10">
          {children}
        </div>
        <Notification />
      </div>
    </DownloadProvider>
  );
}