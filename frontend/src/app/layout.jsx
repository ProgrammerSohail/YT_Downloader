import './globals.css'; // Keep global styles for Tailwind and any custom CSS
import ClientLayout from '../components/ClientLayout';
import Footer from '@/components/Footer';
import BuyMeCoffee from '@/components/BuyMeCoffie';
import LinkedIn from '@/components/Linkedin';
 const Name = process.env.NEXT_PUBLIC_NAME || '8K Blitz';
export const metadata = {
  title: `${Name} - Free and OpenSource Fastest YouTube Video Downloader`,
  metadataBase: new URL('https://ytvideomax.com'),
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: '8K Blitz - Free Downloader - Free and OpenSource Fastest YouTube Video Downloader',
    description: 'Download YouTube videos quickly and easily with YTVideoMax',
    url: 'https://4kblitz.com',
    siteName: 'YTVideoMax',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '8K Blitz - Free Downloader - Free and OpenSource Fastest YouTube Video Downloader',
      },
    ],
  },
  description: 'Download YouTube videos quickly and easily with 4KVideoMax',
  keywords: [
    'YouTube downloader',
    'Free YouTube downloader',
    'Download YouTube videos',
    'YouTube video downloader',
    '4K video downloader',
    'Online YouTube downloader',
    'Fast YouTube downloader',
    'Open-source YouTube downloader',
    'YouTube to MP4 converter',
    'YouTube to MP3 converter',
    'yt1s',
    'youtube hd free downloader',
    'youtube downloader',
    'youtube video downloader',
    'youtube video downloader online',
    'youtube video downloader free',
    'youtube video downloader mp4',
  ],
};

export const viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Font Awesome for icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </head>
      <body>
        <ClientLayout>
          <LinkedIn />
           {/* <BuyMeCoffee /> */}
          {children}
          <Footer/>
        </ClientLayout>
      </body>
    </html>
  );
}
