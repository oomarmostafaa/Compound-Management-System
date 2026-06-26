import React from 'react';

const Loader = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin"></div>
          </div>
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase animate-pulse">
            Loading System Hub...
          </span>
        </div>
      </div>
    );
  }

  // Modern pulsing skeleton wireframe matching compound grids & details
  return (
    <div className="space-y-8 animate-pulse w-full">
      {/* Skeleton Header */}
      <div className="space-y-2.5">
        <div className="h-7 w-48 bg-slate-900 rounded-lg"></div>
        <div className="h-4 w-72 bg-slate-900/40 rounded-lg"></div>
      </div>

      {/* Skeleton Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-900/10 border border-slate-900/60 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-16 bg-slate-900/60 rounded-md"></div>
              <div className="h-8 w-8 bg-slate-900/80 rounded-lg"></div>
            </div>
            <div className="h-6 w-12 bg-slate-900 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Skeleton Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-56 bg-slate-900/10 border border-slate-900/60 rounded-2xl p-6 space-y-4">
          <div className="h-4 w-32 bg-slate-900 rounded-md"></div>
          <div className="space-y-3 pt-4">
            <div className="h-3 w-full bg-slate-900/60 rounded-md"></div>
            <div className="h-3 w-5/6 bg-slate-900/40 rounded-md"></div>
            <div className="h-3 w-4/5 bg-slate-900/20 rounded-md"></div>
          </div>
        </div>
        <div className="h-56 bg-slate-900/10 border border-slate-900/60 rounded-2xl p-6 space-y-4">
          <div className="h-4 w-32 bg-slate-900 rounded-md"></div>
          <div className="space-y-3 pt-4">
            <div className="h-3 w-full bg-slate-900/60 rounded-md"></div>
            <div className="h-3 w-5/6 bg-slate-900/40 rounded-md"></div>
            <div className="h-3 w-4/5 bg-slate-900/20 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
