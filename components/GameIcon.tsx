
import React from 'react';
import { AppName, GAMES_DATA } from '../types';

interface GameIconProps {
  app: AppName;
  className?: string;
}

export const GameIcon: React.FC<GameIconProps> = ({ app, className = "w-6 h-6" }) => {
  const data = GAMES_DATA[app];
  
  if (!data) return null;

  return (
    <div className={`flex items-center justify-center rounded-lg ${data.bg} p-1 ${className}`}>
        <svg 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className={`w-full h-full ${data.color}`}
        >
            <path d={data.iconPath} />
        </svg>
    </div>
  );
};
