
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { GenerationPage } from './pages/GenerationPage';
import { LibraryPage } from './pages/LibraryPage';
import { TrafficPage } from './pages/TrafficPage';
import { ChatPage } from './pages/ChatPage';
import { AppsInfoPage } from './pages/AppsInfoPage';
import { MediaItem } from './types';

// Wrapper component to handle layout logic that depends on routing
const AppLayout: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/generate');
  const [balance, setBalance] = useState(1250.00); // Initial balance in USD
  const [libraryItems, setLibraryItems] = useState<MediaItem[]>([
    {
      id: 'demo-1',
      type: 'IMAGE' as any,
      url: 'https://picsum.photos/800/800?random=1',
      title: 'Киберпанк город',
      createdAt: Date.now(),
      appName: 'Grand Theft Auto',
      tags: ['demo', 'cyberpunk'],
      thumbnail: 'https://picsum.photos/800/800?random=1'
    },
    {
      id: 'demo-2',
      type: 'VIDEO' as any,
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      title: 'Мечта слона',
      createdAt: Date.now() - 100000,
      appName: 'Fish Idle',
      tags: ['demo', 'animation'],
      thumbnail: 'https://picsum.photos/320/180?random=2',
      cpiMetrics: {
        ww: 0.35,
        usa: 1.50
      }
    },
    {
      id: 'demo-icon-1',
      type: 'IMAGE' as any,
      url: 'https://picsum.photos/200/200?random=10',
      title: 'Fish Icon Variant 1',
      createdAt: Date.now(),
      appName: 'Fish Idle',
      tags: ['icon'],
      thumbnail: 'https://picsum.photos/200/200?random=10'
    },
    {
      id: 'demo-icon-2',
      type: 'IMAGE' as any,
      url: 'https://picsum.photos/200/200?random=11',
      title: 'Fish Icon Variant 2',
      createdAt: Date.now(),
      appName: 'Fish Idle',
      tags: ['icon'],
      thumbnail: 'https://picsum.photos/200/200?random=11'
    },
    {
      id: 'demo-icon-3',
      type: 'IMAGE' as any,
      url: 'https://picsum.photos/200/200?random=12',
      title: 'Fish Icon Variant 3',
      createdAt: Date.now(),
      appName: 'Fish Idle',
      tags: ['icon'],
      thumbnail: 'https://picsum.photos/200/200?random=12'
    }
  ]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.location.hash = path;
  };

  // Sync state on hash change (basic implementation)
  React.useEffect(() => {
    const handleHashChange = () => setCurrentPath(window.location.hash.slice(1) || '/generate');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const addToLibrary = (item: MediaItem) => {
    setLibraryItems(prev => [item, ...prev]);
  };

  const deleteFromLibrary = (id: string) => {
    setLibraryItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSpendBalance = (amount: number) => {
    setBalance(prev => Math.max(0, prev - amount));
  };

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-white overflow-hidden font-sans selection:bg-yellow-500/30">
      <Sidebar currentPath={currentPath} navigate={handleNavigate} balance={balance} />
      <main className="flex-1 relative overflow-hidden bg-black/20">
        {/* Subtle background gradient mesh */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-20">
           <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-yellow-600/20 rounded-full blur-3xl" />
           <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-3xl" />
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/generate" replace />} />
          <Route 
            path="/generate" 
            element={
              <GenerationPage 
                onAddToLibrary={addToLibrary} 
                userBalance={balance}
                onSpendBalance={handleSpendBalance}
              />
            } 
          />
          <Route 
            path="/library" 
            element={
              <LibraryPage 
                items={libraryItems} 
                onDeleteItem={deleteFromLibrary} 
                onAddToLibrary={addToLibrary}
              />
            } 
          />
          <Route 
            path="/traffic" 
            element={<TrafficPage libraryItems={libraryItems} />} 
          />
          <Route 
            path="/chat" 
            element={<ChatPage onAddToLibrary={addToLibrary} />} 
          />
          <Route 
            path="/apps" 
            element={<AppsInfoPage libraryItems={libraryItems} />} 
          />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
};

export default App;
