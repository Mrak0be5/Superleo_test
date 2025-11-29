import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-10 h-10 flex items-center justify-center bg-brand-yellow rounded-lg shadow-lg shadow-yellow-500/20">
        <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            className="w-7 h-7 text-zinc-900"
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
          <path d="M12 2l4 7h-8l4-7z" />
          <path d="M12 22l-4-7h8l-4 7z" />
          <path d="M2 12l7-4v8l-7-4z" />
          <path d="M22 12l-7 4V8l7 4z" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-black text-xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 uppercase drop-shadow-sm">
          Multicastgames
        </span>
        <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
          SuperLeo
        </span>
      </div>
    </div>
  );
};