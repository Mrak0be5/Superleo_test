
import React, { useState, useMemo } from 'react';
import { MediaItem, MediaType, APP_NAMES, AppName, GAMES_DATA } from '../types';
import { CustomSelect, SelectOption } from '../components/CustomSelect';
import { GameIcon } from '../components/GameIcon';

interface LibraryPageProps {
  items: MediaItem[];
  onDeleteItem: (id: string) => void;
  onAddToLibrary: (item: MediaItem) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({ items, onDeleteItem, onAddToLibrary }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | MediaType>('ALL');
  const [filterApp, setFilterApp] = useState<'ALL' | AppName>('ALL');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'ALL' || item.type === filterType;
      const matchesApp = filterApp === 'ALL' || item.appName === filterApp;
      return matchesSearch && matchesType && matchesApp;
    });
  }, [items, searchTerm, filterType, filterApp]);

  const selectedMediaItems = useMemo(() => 
    items.filter(item => selectedItems.has(item.id)), 
  [items, selectedItems]);

  const canGlue = selectedMediaItems.length > 1;
  const canExtend = selectedMediaItems.length === 1 && selectedMediaItems[0].type === MediaType.VIDEO;
  const canRemoveBg = selectedMediaItems.length > 0 && selectedMediaItems.every(i => i.type === MediaType.IMAGE);
  const hasSelection = selectedItems.size > 0;

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItems(newSet);
  };

  const handleDelete = () => {
    if (confirm(`Вы уверены, что хотите удалить ${selectedItems.size} элементов?`)) {
        selectedItems.forEach(id => onDeleteItem(id));
        setSelectedItems(new Set());
    }
  };

  const handleMerge = () => {
    if (!canGlue) return;
    setIsProcessing(true);
    setTimeout(() => {
        const newItem: MediaItem = {
            id: Date.now().toString(),
            type: MediaType.VIDEO,
            url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            title: `Склейка (${selectedItems.size} клипов)`,
            createdAt: Date.now(),
            appName: selectedMediaItems[0].appName,
            tags: ['merged', 'video'],
            thumbnail: 'https://picsum.photos/320/180?random=merge',
            cpiMetrics: {
                ww: Number((Math.random() * 0.5 + 0.1).toFixed(2)),
                usa: Number((Math.random() * 2.0 + 0.5).toFixed(2))
            }
        };
        onAddToLibrary(newItem);
        setIsProcessing(false);
        setSelectedItems(new Set());
        alert("Видео успешно склеены!");
    }, 2000);
  };

  const handleExtend = () => {
      if (!canExtend) return;
      setIsProcessing(true);
      setTimeout(() => {
          const original = selectedMediaItems[0];
          const newItem: MediaItem = {
              id: Date.now().toString(),
              type: MediaType.VIDEO,
              url: original.url, // In real app, this would be new URL
              title: `${original.title} (Extended)`,
              createdAt: Date.now(),
              appName: original.appName,
              tags: [...original.tags, 'extended'],
              thumbnail: original.thumbnail,
              cpiMetrics: original.cpiMetrics // Inherit metrics for simplicity or generate new
          };
          onAddToLibrary(newItem);
          setIsProcessing(false);
          setSelectedItems(new Set());
          alert("Видео успешно продолжено!");
      }, 2000);
  };

  const handleRemoveBg = () => {
      if (!canRemoveBg) return;
      setIsProcessing(true);
      setTimeout(() => {
          selectedMediaItems.forEach((item, index) => {
              const newItem: MediaItem = {
                  id: (Date.now() + index).toString(),
                  type: MediaType.IMAGE,
                  url: item.url, // In real app, this would be processed image
                  title: `${item.title} (No BG)`,
                  createdAt: Date.now(),
                  appName: item.appName,
                  tags: [...item.tags, 'no-bg'],
                  thumbnail: item.thumbnail
              };
              onAddToLibrary(newItem);
          });
          setIsProcessing(false);
          setSelectedItems(new Set());
          alert("Фон успешно удален!");
      }, 1500);
  };

  // Options configuration
  const typeOptions: SelectOption[] = [
    { 
      value: 'ALL', 
      label: 'Все типы', 
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
    },
    { 
      value: MediaType.VIDEO, 
      label: 'Видео', 
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
    },
    { 
      value: MediaType.IMAGE, 
      label: 'Изображения', 
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
    },
    { 
      value: MediaType.PLAYABLE_AD, 
      label: 'Playable Ads', 
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect height="12" rx="2" width="20" x="2" y="6"/></svg>
    }
  ];

  const appOptions: SelectOption[] = [
    { 
      value: 'ALL', 
      label: 'Все приложения', 
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> 
    },
    ...APP_NAMES.map(app => ({
      value: app,
      label: app,
      icon: <GameIcon app={app} className="w-4 h-4" />
    }))
  ];

  return (
    <div className="h-full flex flex-col p-6 lg:p-10 w-full overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Библиотека</h1>
          <p className="text-zinc-400 text-sm mt-1">Управление медиа-файлами и проектами</p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
            <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-zinc-700 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                Загрузить
            </button>
            
            {/* SEPARATOR */}
            <div className="w-px h-6 bg-zinc-800 mx-1"></div>

            {/* MERGE BUTTON */}
            <button 
                onClick={handleMerge}
                disabled={!canGlue}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${
                    canGlue && !isProcessing
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-yellow-400 border-zinc-700' 
                        : 'bg-zinc-900 text-zinc-600 border-zinc-800 opacity-50 cursor-not-allowed'
                }`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                Склеить {selectedItems.size > 1 ? `(${selectedItems.size})` : ''}
            </button>

            {/* EXTEND VIDEO BUTTON */}
            <button 
                onClick={handleExtend}
                disabled={!canExtend}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${
                    canExtend && !isProcessing
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-blue-400 border-zinc-700'
                        : 'bg-zinc-900 text-zinc-600 border-zinc-800 opacity-50 cursor-not-allowed'
                }`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Продолжить
            </button>

            {/* REMOVE BACKGROUND BUTTON */}
            <button 
                onClick={handleRemoveBg}
                disabled={!canRemoveBg}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${
                    canRemoveBg && !isProcessing
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-purple-400 border-zinc-700'
                        : 'bg-zinc-900 text-zinc-600 border-zinc-800 opacity-50 cursor-not-allowed'
                }`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                Удалить фон
            </button>

            {/* DELETE BUTTON */}
            {hasSelection && (
                <button 
                    onClick={handleDelete}
                    disabled={isProcessing}
                    className="ml-auto bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm font-medium border border-red-500/20 transition-colors flex items-center gap-2 animate-fadeIn"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Удалить
                </button>
            )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 z-20 relative">
        <div className="relative flex-1 min-w-[200px] max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
                type="text" 
                placeholder="Поиск по тегам или названию..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 h-[42px]"
            />
        </div>
        
        {/* Type Filter */}
        <div className="w-48">
          <CustomSelect 
            value={filterType}
            options={typeOptions}
            onChange={(val) => setFilterType(val as any)}
          />
        </div>

        {/* App Name Filter */}
        <div className="w-56">
          <CustomSelect 
            value={filterApp}
            options={appOptions}
            onChange={(val) => setFilterApp(val as any)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 z-10 relative">
        {isProcessing && (
            <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-yellow-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-white font-medium">Обработка...</span>
                </div>
            </div>
        )}

        {filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl">
                <p>Библиотека пуста или ничего не найдено</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map(item => (
                <div 
                    key={item.id}
                    onClick={() => toggleSelection(item.id)}
                    className={`group relative aspect-square bg-zinc-900 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                        selectedItems.has(item.id) 
                            ? 'border-yellow-500 ring-2 ring-yellow-500/20' 
                            : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                >
                    {item.type === MediaType.VIDEO && (
                         <div className="w-full h-full relative">
                            <img src={item.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={item.title} />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                            </div>
                         </div>
                    )}
                    {item.type === MediaType.IMAGE && (
                        <img src={item.url} className="w-full h-full object-cover" alt={item.title} />
                    )}
                    {item.type === MediaType.PLAYABLE_AD && (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800">
                             <span className="text-4xl">🎮</span>
                             <span className="text-xs text-zinc-400 mt-2">Playable Ad</span>
                        </div>
                    )}
                    
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end">
                        <p className="text-white text-xs font-medium truncate">{item.title}</p>
                        
                        {/* CPI Metrics Display */}
                        {item.type === MediaType.VIDEO && item.cpiMetrics && (
                            <div className="flex gap-1.5 mt-1.5 mb-1.5">
                                <div className="bg-zinc-800/80 rounded px-1.5 py-0.5 text-[9px] text-zinc-400 border border-zinc-700/50 backdrop-blur-sm">
                                    WW: <span className="text-green-400 font-bold">${item.cpiMetrics.ww}</span>
                                </div>
                                <div className="bg-zinc-800/80 rounded px-1.5 py-0.5 text-[9px] text-zinc-400 border border-zinc-700/50 backdrop-blur-sm">
                                    US: <span className="text-green-400 font-bold">${item.cpiMetrics.usa}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center mt-auto">
                             <p className="text-zinc-400 text-[10px] uppercase">{item.type}</p>
                             {item.appName && (
                                <div className="flex items-center gap-1">
                                    <GameIcon app={item.appName} className="w-3 h-3" />
                                    <p className="text-yellow-500 text-[10px]">{item.appName}</p>
                                </div>
                             )}
                        </div>
                    </div>

                    {selectedItems.has(item.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                            <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                        </div>
                    )}
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};
