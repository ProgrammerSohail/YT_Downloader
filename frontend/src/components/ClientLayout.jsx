'use client';
import React from 'react';
import { DownloadProvider } from '../context/DownloadContext';
import Notification from './Notification';
import ThemeSwitcher from './ThemeSwitcher';

export default function ClientLayout({ children }) {
  const [theme, setTheme] = React.useState(
    typeof window !== 'undefined' && localStorage.getItem('theme') || 'light'
  );

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="max-w-screen-xl mx-auto p-8">
      <DownloadProvider>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <ThemeSwitcher theme={theme} setTheme={setTheme} />
        </div>
        {children}
        <Notification />
      </DownloadProvider>
    </div>
  );
} 