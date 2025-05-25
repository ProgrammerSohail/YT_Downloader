"use client";
import PropTypes from 'prop-types';

const DownloadButton = ({ isLoading, onClick }) => {
  return (
    <button 
      type="submit" 
      id="download-btn" 
      className={`w-full py-5 rounded-2xl text-lg font-bold uppercase tracking-wide shadow-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 ${
        isLoading 
          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
          : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:shadow-xl focus:ring-emerald-500/50'
      }`}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-600/30 border-t-gray-600 rounded-full animate-spin"></div>
          <span>DOWNLOADING...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>DOWNLOAD</span>
        </div>
      )}
    </button>
  );
};

DownloadButton.propTypes = {
  isLoading: PropTypes.bool.isRequired
};

export default DownloadButton;
