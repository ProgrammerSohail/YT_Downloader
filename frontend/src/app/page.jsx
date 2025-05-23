import DownloadForm from '../components/DownloadForm';
import VideoInfoDisplay from '../components/VideoInfoDisplay';
import DownloadStatusDisplay from '../components/DownloadStatusDisplay'; // New import

export default function Home() {
  return (
    <body className='bg-white dark:bg-black'>
      <header className="text-center mb-0 py-8 relative">
        <div className="w-20 h-20 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center shadow-button">
          <i className="fab fa-youtube text-4xl text-white"></i>
        </div>
        <h1 className="text-4xl mb-2.5 text-primary font-bold flex items-center justify-center gap-2.5">YTVideoMax</h1>
        <p className="text-lg text-text font-normal tracking-wider">Download YouTube Videos in High Quality</p>
        <p className="app-description">Fast • Simple • Free</p>
      </header>
      <main className="mb-12">
        <DownloadForm /> {/* Use the new DownloadForm component */}
        <VideoInfoDisplay /> {/* Use the new VideoInfoDisplay component */}
        <DownloadStatusDisplay /> {/* Use the new DownloadStatusDisplay component */}
      </main>
      <footer className="mt-auto bg-gradient-to-r from-gray-800/[.98] to-gray-900/[.98] text-white border-t border-white/[.1]">
        <div className="max-w-screen-xl mx-auto px-8 text-center">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="developer-section">
              <p className="text-lg font-medium m-0 text-white">Crafted with <i className="fas fa-heart"></i> by Sohail Khan</p>
              <div className="social-links gap-4">
                <a href="https://github.com/ProgrammerSohail" className="text-white text-2xl transition-all duration-normal opacity-80 hover:opacity-100 hover:-translate-y-0.5 hover:text-primary" title="GitHub">
                  <i className="fab fa-github"></i>
                </a>
                <a href="https://www.linkedin.com/in/dev-sohail-khan-15605a345/" className="text-white text-2xl transition-all duration-normal opacity-80 hover:opacity-100 hover:-translate-y-0.5 hover:text-primary" title="LinkedIn">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="https://devsohail.netlify.app/" className="text-white text-2xl transition-all duration-normal opacity-80 hover:opacity-100 hover:-translate-y-0.5 hover:text-primary" title="Portfolio">
                  <i className="fas fa-globe"></i>
                </a>
              </div>
            </div>
            <div className="footer-disclaimer">
              <p className="text-sm text-white/[.7] m-0">For educational purposes only. Please respect YouTube's Terms of Service.</p>
              <p className="version">Version 2.0</p>
            </div>
          </div>
        </div>
      </footer>
    </body>
  );
}
