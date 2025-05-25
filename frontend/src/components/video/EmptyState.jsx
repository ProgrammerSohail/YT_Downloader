"use client";

const EmptyState = () => {
  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-0 mb-8 opacity-0 h-0 overflow-hidden transition-all duration-500 shadow-lg border border-white/50" id="video-info">
      <div className="p-8">
        <div className="text-center py-12 text-gray-500">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg font-medium italic p-5">
            Paste a YouTube URL above and click "Get Info" to see video details
          </p>
        </div>
      </div>
    </section>
  );
};

export default EmptyState;
