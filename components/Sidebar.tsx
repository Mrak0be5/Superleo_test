
import React from 'react';
import { Logo } from './Logo';

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
    }`}
  >
    <span className={`${active ? 'text-yellow-400' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
      {icon}
    </span>
    <span className="font-medium text-sm">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />}
  </button>
);

interface SidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
  balance: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, navigate, balance }) => {
  return (
    <div className="w-64 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
      <div className="p-6">
        <Logo />
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavItem 
          label="AI Ассистент" 
          active={currentPath === '/chat'} 
          onClick={() => navigate('/chat')}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
              <path d="M9 12h.01" />
              <path d="M15 12h.01" />
            </svg>
          }
        />
        <NavItem 
          label="Генерация" 
          active={currentPath === '/generate'} 
          onClick={() => navigate('/generate')}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              <path d="M12 2v2" />
              <path d="M12 22v-2" />
              <path d="m17 7-1.4 1.4" />
              <path d="m7 17 1.4-1.4" />
              <path d="M2 12h2" />
              <path d="M22 12h-2" />
            </svg>
          }
        />
        <NavItem 
          label="Библиотека" 
          active={currentPath === '/library'} 
          onClick={() => navigate('/library')}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
          }
        />
        <NavItem 
          label="Закупка трафика" 
          active={currentPath === '/traffic'} 
          onClick={() => navigate('/traffic')}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20v-6" />
              <path d="M6 20V10" />
              <path d="M18 20V4" />
            </svg>
          }
        />
        <NavItem 
          label="Инфо о приложениях" 
          active={currentPath === '/apps'} 
          onClick={() => navigate('/apps')}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="bg-zinc-800/50 rounded-lg p-3 flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-zinc-900 font-bold text-xs">
                    SL
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-zinc-200 truncate">Пользователь</span>
                    <span className="text-xs text-zinc-500 truncate">user@multicast.com</span>
                </div>
            </div>
        </div>
        <div className="flex items-center justify-between bg-zinc-950 rounded-lg px-3 py-2 border border-zinc-800">
             <span className="text-xs text-zinc-500">Баланс:</span>
             <span className="text-sm font-bold text-green-400">${balance.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
