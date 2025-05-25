"use client";
import PropTypes from 'prop-types';

const VideoStats = ({ author, views, duration, formatNumber, formatDuration }) => {
  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <span className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <span className="font-medium text-blue-800">{author}</span>
      </span>
      
      <span className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <span className="font-medium text-green-800">{formatNumber(views)} views</span>
      </span>
      
      <span className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
        <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="font-medium text-purple-800">{formatDuration(duration)} min</span>
      </span>
    </div>
  );
};

VideoStats.propTypes = {
  author: PropTypes.string.isRequired,
  views: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  formatNumber: PropTypes.func.isRequired,
  formatDuration: PropTypes.func.isRequired
};

export default VideoStats;
