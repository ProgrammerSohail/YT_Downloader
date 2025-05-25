"use client";
import PropTypes from 'prop-types';

const VideoThumbnail = ({ thumbnailUrl, title }) => {
  return (
    <div className="flex-shrink-0 relative group">
      <div className="w-full md:w-72 md:h-44 bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
        <img 
          src={thumbnailUrl} 
          alt={title} 
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" 
          style={{ maxHeight: 180 }} 
        />
      </div>
      <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

VideoThumbnail.propTypes = {
  thumbnailUrl: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

export default VideoThumbnail;
