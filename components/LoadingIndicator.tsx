import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="w-full bg-slate-600 rounded-full h-1.5 overflow-hidden" role="progressbar" aria-busy="true">
      <div className="bg-cyan-400 h-1.5 w-2/5 rounded-full animate-indeterminate-progress"></div>
    </div>
  );
};

export default LoadingIndicator;
