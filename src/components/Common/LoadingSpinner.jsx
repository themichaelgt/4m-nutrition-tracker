import React from 'react';

function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-b-2 border-primary-600`}></div>
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
