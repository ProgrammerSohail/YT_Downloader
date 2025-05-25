"use client";

const LoadingState = () => {
  return (
    <div className="mx-auto flex flex-col items-center justify-center h-48 max-w-md p-8">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0">
          
        </div>
      </div>
      <div className="text-center">
        <p className="text-gray-800 font-semibold animate-pulse text-xl mb-2">
          Getting video info... 
        </p>
        <p className="text-gray-500 text-sm bg-gray-100/50 px-4 py-2 rounded-full inline-block">
          Please wait a moment
        </p>
      </div>
    </div>
  );
};

export default LoadingState;
