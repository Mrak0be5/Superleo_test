
import React, { useState } from 'react';
import { APP_NAMES, AppDetails, GAMES_DATA, MediaItem, MediaType, ABTest } from '../types';
import { GameIcon } from '../components/GameIcon';

interface AppsInfoPageProps {
    libraryItems: MediaItem[];
}

const INITIAL_APPS_DETAILS: AppDetails[] = [
    {
        name: 'Grand Theft Auto',
        bundleId: 'com.multicast.gta.mobile',
        storeId: 'id1234567890',
        description: 'Action-adventure open world game.',
        approvalStatus: {
            google: 'approved',
            facebook: 'pending',
            tiktok: 'rejected'
        },
        adIds: {
            rewarded: 'ca-app-pub-3940256099942544/5224354917',
            interstitial: 'ca-app-pub-3940256099942544/1033173712',
            banner: 'ca-app-pub-3940256099942544/6300978111'
        }
    },
    {
        name: 'Fish Idle',
        bundleId: 'com.multicast.fishidle.pro',
        storeId: 'id0987654321',
        description: 'Casual fishing arcade tycoon.',
        approvalStatus: {
            google: 'approved',
            facebook: 'approved',
            tiktok: 'approved'
        },
        adIds: {
            rewarded: 'ca-app-pub-1234567890/reward_fish',
            interstitial: 'ca-app-pub-1234567890/inter_fish',
            banner: 'ca-app-pub-1234567890/banner_fish'
        },
        // MOCK ACTIVE A/B TEST
        activeAbTest: {
            id: 'ab-fish-001',
            status: 'active',
            startDate: Date.now() - 259200000, // 3 days ago
            variants: [
                { id: 'v1', imageUrl: 'https://picsum.photos/200/200?random=101', isControl: true, performanceCtx: 0, impressions: 5400, conversions: 210 },
                { id: 'v2', imageUrl: 'https://picsum.photos/200/200?random=102', isControl: false, performanceCtx: 15.4, impressions: 5350, conversions: 242 },
                { id: 'v3', imageUrl: 'https://picsum.photos/200/200?random=103', isControl: false, performanceCtx: -8.2, impressions: 5500, conversions: 193 },
                { id: 'v4', imageUrl: 'https://picsum.photos/200/200?random=104', isControl: false, performanceCtx: 2.1, impressions: 5420, conversions: 214 },
            ]
        }
    },
    {
        name: 'Evolution',
        bundleId: 'com.multicast.evolution.dna',
        storeId: 'id1122334455',
        description: 'Scientific strategy and simulation.',
        approvalStatus: {
            google: 'pending',
            facebook: 'not_submitted',
            tiktok: 'pending'
        },
        adIds: {
            rewarded: 'ca-app-pub-987654321/reward_evo',
            interstitial: 'ca-app-pub-987654321/inter_evo',
            banner: 'ca-app-pub-987654321/banner_evo'
        }
    }
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colors: Record<string, string> = {
        approved: 'bg-green-500/10 text-green-500 border-green-500/20',
        pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
        not_submitted: 'bg-zinc-700/50 text-zinc-500 border-zinc-700/50'
    };
    
    const labels: Record<string, string> = {
        approved: 'Одобрено',
        pending: 'На проверке',
        rejected: 'Отклонено',
        not_submitted: 'Не подано'
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colors[status] || colors.not_submitted}`}>
            {labels[status] || status}
        </span>
    );
};

export const AppsInfoPage: React.FC<AppsInfoPageProps> = ({ libraryItems }) => {
    const [apps, setApps] = useState(INITIAL_APPS_DETAILS);
    const [selectedForTest, setSelectedForTest] = useState<string | null>(null); // App Name
    const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);

    const handleCreateTest = (appName: string) => {
        setSelectedForTest(appName);
        setSelectedImages([]);
    };

    const toggleImageSelection = (item: MediaItem) => {
        if (selectedImages.find(i => i.id === item.id)) {
            setSelectedImages(prev => prev.filter(i => i.id !== item.id));
        } else {
            if (selectedImages.length >= 3) return; // Limit to 3 challengers
            setSelectedImages(prev => [...prev, item]);
        }
    };

    const launchTest = () => {
        if (!selectedForTest || selectedImages.length === 0) return;

        setApps(prevApps => prevApps.map(app => {
            if (app.name === selectedForTest) {
                // Generate a control variant mockup
                const controlVariant = {
                    id: 'control-' + Date.now(),
                    imageUrl: 'https://picsum.photos/200/200?random=999',
                    isControl: true,
                    performanceCtx: 0,
                    impressions: 0,
                    conversions: 0
                };
                
                // Map selected images to variants
                const challengerVariants = selectedImages.map((img, idx) => ({
                    id: `v-${idx}-${Date.now()}`,
                    imageUrl: img.url,
                    isControl: false,
                    performanceCtx: 0, // Starts at 0
                    impressions: 0,
                    conversions: 0
                }));

                return {
                    ...app,
                    activeAbTest: {
                        id: 'new-test-' + Date.now(),
                        status: 'active',
                        startDate: Date.now(),
                        variants: [controlVariant, ...challengerVariants]
                    }
                };
            }
            return app;
        }));

        setSelectedForTest(null);
        setSelectedImages([]);
    };

    // Filter library items for the selector (images only, maybe match app name in future)
    const availableImages = libraryItems.filter(item => item.type === MediaType.IMAGE);

    return (
        <div className="h-full flex flex-col p-6 lg:p-10 w-full overflow-y-auto max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white">Информация о приложениях</h1>
                <p className="text-zinc-400 mt-1">Технические данные, статусы модерации и A/B тесты</p>
            </header>

            <div className="grid grid-cols-1 gap-6 pb-20">
                {apps.map((app) => (
                    <div key={app.name} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-zinc-700 transition-all">
                        <div className="flex flex-col xl:flex-row gap-6">
                            {/* App Header Info */}
                            <div className="flex items-start gap-4 min-w-[250px]">
                                <GameIcon app={app.name} className="w-16 h-16 shrink-0" />
                                <div>
                                    <h2 className="text-xl font-bold text-white">{app.name}</h2>
                                    <p className="text-sm text-zinc-400 mt-1">{app.description}</p>
                                    <div className="flex gap-2 mt-3">
                                        <div className="px-2 py-1 bg-zinc-950 rounded text-xs font-mono text-zinc-500 border border-zinc-800">
                                            iOS: {app.storeId}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tech Details */}
                            <div className="flex-1 space-y-3 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1">Bundle ID</label>
                                    <div className="flex items-center gap-2">
                                        <code className="text-sm text-yellow-500 bg-yellow-500/5 px-2 py-1 rounded select-all">
                                            {app.bundleId}
                                        </code>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-xs font-medium text-zinc-500 mb-1">Adjust Token</label>
                                        <code className="text-xs text-zinc-300 select-all">x7z89asfd8</code>
                                     </div>
                                     <div>
                                        <label className="block text-xs font-medium text-zinc-500 mb-1">AppsFlyer ID</label>
                                        <code className="text-xs text-zinc-300 select-all">af_id_998877</code>
                                     </div>
                                </div>
                            </div>

                            {/* Approval Status Table */}
                            <div className="flex-1 min-w-[300px]">
                                <h3 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    Статус модерации
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <span className="text-sm text-zinc-300">Google Ads</span>
                                        </div>
                                        <StatusBadge status={app.approvalStatus.google} />
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg group">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                            <span className="text-sm text-zinc-300">Facebook</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={app.approvalStatus.facebook} />
                                            <button 
                                                onClick={() => alert(`Симуляция: Создание приложения ${app.name} в Facebook Ads Manager...`)}
                                                className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] rounded border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center gap-1 opacity-60 hover:opacity-100"
                                            >
                                                Создать
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                            <span className="text-sm text-zinc-300">TikTok</span>
                                        </div>
                                        <StatusBadge status={app.approvalStatus.tiktok} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* A/B Testing Section */}
                        <div className="mt-6 pt-6 border-t border-zinc-800/50">
                             <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                                    A/B Тестирование Иконок (Google Play)
                                </h4>
                                {app.activeAbTest ? (
                                    <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded animate-pulse">
                                        Тест активен ({Math.floor((Date.now() - app.activeAbTest.startDate) / 86400000)} д.)
                                    </span>
                                ) : (
                                    <button 
                                        onClick={() => handleCreateTest(app.name)}
                                        className="text-[10px] bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded font-bold transition-colors"
                                    >
                                        + Начать тест
                                    </button>
                                )}
                             </div>

                             {app.activeAbTest ? (
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {app.activeAbTest.variants.map((variant) => (
                                        <div key={variant.id} className={`p-3 rounded-xl border ${
                                            variant.isControl 
                                                ? 'bg-zinc-950/80 border-zinc-700' 
                                                : variant.performanceCtx && variant.performanceCtx > 0 
                                                    ? 'bg-green-500/5 border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.05)]' 
                                                    : 'bg-zinc-950/80 border-zinc-800'
                                        }`}>
                                            <div className="mb-3 relative">
                                                <img 
                                                    src={variant.imageUrl} 
                                                    alt="Variant" 
                                                    className="w-full aspect-square rounded-lg object-cover border border-zinc-800"
                                                />
                                                <span className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold border backdrop-blur-md ${
                                                    variant.isControl ? 'bg-zinc-800/80 border-zinc-600 text-zinc-300' : 'bg-black/60 border-white/20 text-white'
                                                }`}>
                                                    {variant.isControl ? 'CONTROL' : 'VARIANT'}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] text-zinc-500">Прирост (Установки)</span>
                                                    <span className={`text-sm font-bold ${
                                                        !variant.performanceCtx ? 'text-zinc-400' :
                                                        variant.performanceCtx > 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                        {variant.performanceCtx ? (variant.performanceCtx > 0 ? '+' : '') + variant.performanceCtx + '%' : '0%'}
                                                    </span>
                                                </div>
                                                {/* Progress Bar Mockup */}
                                                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${
                                                            !variant.performanceCtx ? 'bg-zinc-600' :
                                                            variant.performanceCtx > 0 ? 'bg-green-500' : 'bg-red-500'
                                                        }`} 
                                                        style={{ width: `${50 + (variant.performanceCtx || 0)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between text-[9px] text-zinc-600">
                                                     <span>Imp: {variant.impressions?.toLocaleString()}</span>
                                                     <span>Conv: {variant.conversions}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                 </div>
                             ) : (
                                <div className="h-24 bg-zinc-950 border border-zinc-800 border-dashed rounded-xl flex flex-col items-center justify-center text-zinc-500">
                                    <span>Нет активных A/B тестов</span>
                                </div>
                             )}
                        </div>

                        {/* Ad IDs Section */}
                        <div className="mt-6 pt-6 border-t border-zinc-800/50">
                             <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                Рекламные идентификаторы (Ad Units)
                             </h4>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[10px] font-bold text-green-400 uppercase">Rewarded</span>
                                        <span className="text-[10px] text-zinc-600">ID</span>
                                    </div>
                                    <code className="block w-full text-xs text-zinc-300 font-mono break-all select-all cursor-text">
                                        {app.adIds.rewarded}
                                    </code>
                                </div>
                                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[10px] font-bold text-blue-400 uppercase">Interstitial</span>
                                        <span className="text-[10px] text-zinc-600">ID</span>
                                    </div>
                                    <code className="block w-full text-xs text-zinc-300 font-mono break-all select-all cursor-text">
                                        {app.adIds.interstitial}
                                    </code>
                                </div>
                                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[10px] font-bold text-yellow-400 uppercase">Banner</span>
                                        <span className="text-[10px] text-zinc-600">ID</span>
                                    </div>
                                    <code className="block w-full text-xs text-zinc-300 font-mono break-all select-all cursor-text">
                                        {app.adIds.banner}
                                    </code>
                                </div>
                             </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Selecting Icons */}
            {selectedForTest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-white">Новый A/B тест иконки</h2>
                                <p className="text-sm text-zinc-400">Выберите до 3 вариантов из библиотеки</p>
                            </div>
                            <button onClick={() => setSelectedForTest(null)} className="text-zinc-500 hover:text-white">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {availableImages.length === 0 ? (
                                <div className="col-span-full text-center text-zinc-500 py-10">
                                    В библиотеке нет изображений. Сначала сгенерируйте иконки.
                                </div>
                            ) : (
                                availableImages.map(item => {
                                    const isSelected = !!selectedImages.find(i => i.id === item.id);
                                    return (
                                        <div 
                                            key={item.id}
                                            onClick={() => toggleImageSelection(item)}
                                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                                                isSelected ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-zinc-800 hover:border-zinc-600'
                                            }`}
                                        >
                                            <img src={item.url} className="w-full h-full object-cover" alt={item.title} />
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
                                                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        <div className="p-6 border-t border-zinc-800 bg-zinc-900 shrink-0 flex justify-end gap-3">
                            <button 
                                onClick={() => setSelectedForTest(null)}
                                className="px-5 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                                Отмена
                            </button>
                            <button 
                                onClick={launchTest}
                                disabled={selectedImages.length === 0}
                                className="px-5 py-2.5 rounded-xl font-bold bg-yellow-500 text-zinc-900 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20"
                            >
                                Запустить тест ({selectedImages.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
