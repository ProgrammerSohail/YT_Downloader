import './globals.css'; // Keep global styles for Tailwind and any custom CSS
import ClientLayout from '../components/ClientLayout';
import Footer from '@/components/Footer';

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
      <body>
        <ClientLayout>
          {children}
          <Footer/>
        </ClientLayout>
      </body>
    </html>
  );
}
