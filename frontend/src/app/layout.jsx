import './globals.css'; // Keep global styles for Tailwind and any custom CSS
import ClientLayout from '../components/ClientLayout';

export const metadata = {
  title: 'YTVideoMax - Modern YouTube Downloader',
  description: 'Download YouTube videos quickly and easily with YTVideoMax',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Font Awesome for icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </head>
      <body className="font-inter bg-[linear-gradient(145deg,rgba(241,241,241,0.9),rgb(255,215,215))] text-text leading-relaxed min-h-screen">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
