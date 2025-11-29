
import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Campaign, APP_NAMES, AppName, GAMES_DATA, MediaItem, MediaType } from '../types';
import { CustomSelect, SelectOption } from '../components/CustomSelect';
import { GameIcon } from '../components/GameIcon';

interface TrafficPageProps {
  libraryItems: MediaItem[];
}

const mockProfitData = [
  { name: 'Пн', profit: 1200, revenue: 5000, spend: 3800 },
  { name: 'Вт', profit: 1500, revenue: 4200, spend: 2700 },
  { name: 'Ср', profit: 900, revenue: 3800, spend: 2900 },
  { name: 'Чт', profit: 2100, revenue: 6400, spend: 4300 },
  { name: 'Пт', profit: 1800, revenue: 5900, spend: 4100 },
  { name: 'Сб', profit: 2400, revenue: 7200, spend: 4800 },
  { name: 'Вс', profit: 2200, revenue: 6800, spend: 4600 },
];

const PRESETS = [
    { 
        id: 'ww-cpi', 
        label: 'WW CPI', 
        desc: 'Охват мира, оплата за установку',
        config: { geo: 'WW', budget: '5000', platform: 'google', suffix: 'WW CPI' } 
    },
    { 
        id: 'ww-cpa-ab', 
        label: 'WW CPA AB', 
        desc: 'Мир, оптимизация действий (A/B)',
        config: { geo: 'WW', budget: '10000', platform: 'facebook', suffix: 'WW CPA AB' } 
    },
    { 
        id: 'ww-usa-ab', 
        label: 'WW USA AB', 
        desc: 'США, A/B тест креативов',
        config: { geo: 'US', budget: '15000', platform: 'tiktok', suffix: 'USA AB' } 
    },
] as const;

interface Alert {
    id: number;
    type: 'critical' | 'warning' | 'success';
    platform: 'google' | 'facebook' | 'tiktok' | 'mintegral';
    message: string;
    action: string;
    appName?: AppName;
}

const MOCK_ALERTS: Alert[] = [
    {
        id: 1,
        type: 'critical',
        platform: 'facebook',
        message: 'ROAS D0 упал ниже целевых 50% (Текущий: 32%)',
        action: 'Оптимизировать',
        appName: 'Evolution'
    },
    {
        id: 2,
        type: 'warning',
        platform: 'google',
        message: 'Текстовые креативы "Summer Sale" выгорели (CTR < 0.5%). Требуется замена.',
        action: 'Заменить',
        appName: 'Fish Idle'
    },
    {
        id: 3,
        type: 'success',
        platform: 'mintegral',
        message: 'Приложение Grand Theft Auto (iOS) успешно прошло модерацию и готово к запуску.',
        action: 'Запустить',
        appName: 'Grand Theft Auto'
    }
];

export const TrafficPage: React.FC<TrafficPageProps> = ({ libraryItems }) => {
  const [filterApp, setFilterApp] = useState<'ALL' | AppName>('ALL');
  const [filterPlatform, setFilterPlatform] = useState<'ALL' | 'google' | 'facebook' | 'tiktok'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  // New Campaign State
  const [newCampaign, setNewCampaign] = useState<{
    name: string;
    appName: AppName;
    budget: string;
    platform: 'google' | 'facebook' | 'tiktok';
    geo: string;
    age: string;
    gender: 'all' | 'male' | 'female';
    creativeIds: string[];
  }>({
    name: '',
    appName: APP_NAMES[0],
    budget: '5000',
    platform: 'google',
    geo: 'WW',
    age: '18-45',
    gender: 'all',
    creativeIds: []
  });

  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([
    { id: '1', name: 'Летняя Распродажа', appName: 'Grand Theft Auto', status: 'active', budget: 5000, spent: 1200, clicks: 450, impressions: 12000, platform: 'google', createdAt: Date.now(), targeting: { geo: 'US', age: '18+', gender: 'all' }, creativeIds: [] },
    { id: '2', name: 'Промо Видео', appName: 'Fish Idle', status: 'paused', budget: 3000, spent: 2900, clicks: 800, impressions: 25000, platform: 'tiktok', createdAt: Date.now(), targeting: { geo: 'WW', age: '13-24', gender: 'all' }, creativeIds: [] },
    { id: '3', name: 'Новый Уровень', appName: 'Evolution', status: 'active', budget: 7000, spent: 4500, clicks: 1200, impressions: 50000, platform: 'facebook', createdAt: Date.now(), targeting: { geo: 'EU', age: '25-45', gender: 'male' }, creativeIds: [] }
  ]);

  const filteredCampaigns = useMemo(() => {
    return activeCampaigns.filter(c => {
        const matchesApp = filterApp === 'ALL' || c.appName === filterApp;
        const matchesPlatform = filterPlatform === 'ALL' || c.platform === filterPlatform;
        return matchesApp && matchesPlatform;
    });
  }, [activeCampaigns, filterApp, filterPlatform]);

  // Filter available creatives for the selected app in modal
  const availableCreatives = useMemo(() => {
      return libraryItems.filter(item => 
          item.appName === newCampaign.appName || !item.appName
      );
  }, [libraryItems, newCampaign.appName]);

  const activeAlerts = useMemo(() => MOCK_ALERTS.filter(a => !dismissedAlerts.includes(a.id)), [dismissedAlerts]);

  const handleApplyPreset = (preset: typeof PRESETS[number]) => {
      setNewCampaign(prev => ({
          ...prev,
          name: `${prev.appName} ${preset.config.suffix} ${new Date().toLocaleDateString()}`,
          geo: preset.config.geo,
          budget: preset.config.budget,
          platform: preset.config.platform as any
      }));
  };

  const toggleCreative = (id: string) => {
      setNewCampaign(prev => {
          if (prev.creativeIds.includes(id)) {
              return { ...prev, creativeIds: prev.creativeIds.filter(cid => cid !== id) };
          } else {
              return { ...prev, creativeIds: [...prev.creativeIds, id] };
          }
      });
  };

  const handleCreateCampaign = () => {
    if (newCampaign.creativeIds.length === 0) {
        alert("Пожалуйста, выберите хотя бы один креатив (видео или изображение) для кампании.");
        return;
    }

    const campaign: Campaign = {
        id: Date.now().toString(),
        name: newCampaign.name || `Кампания ${newCampaign.appName}`,
        appName: newCampaign.appName,
        status: 'active',
        budget: Number(newCampaign.budget),
        spent: 0,
        clicks: 0,
        impressions: 0,
        platform: newCampaign.platform,
        createdAt: Date.now(),
        creativeIds: newCampaign.creativeIds,
        targeting: {
            geo: newCampaign.geo,
            age: newCampaign.age,
            gender: newCampaign.gender
        }
    };

    setActiveCampaigns([campaign, ...activeCampaigns]);
    setIsModalOpen(false);
    // Reset form
    setNewCampaign({
        name: '',
        appName: APP_NAMES[0],
        budget: '5000',
        platform: 'google',
        geo: 'WW',
        age: '18-45',
        gender: 'all',
        creativeIds: []
    });
  };

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

  const platformOptions: SelectOption[] = [
    { value: 'ALL', label: 'Все сети', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
    { value: 'google', label: 'Google Ads' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'tiktok', label: 'TikTok' },
  ];

  const getAlertStyle = (type: Alert['type']) => {
      switch (type) {
          case 'critical': return 'bg-red-500/10 border-red-500/20 text-red-400';
          case 'warning': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
          case 'success': return 'bg-green-500/10 border-green-500/20 text-green-400';
      }
  };

  const getAlertIcon = (type: Alert['type']) => {
      switch (type) {
          case 'critical': return (
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          );
          case 'warning': return (
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          );
          case 'success': return (
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          );
      }
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-10 w-full overflow-y-auto relative">
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">Закупка трафика</h1>
            <p className="text-zinc-400 mt-1">Управление рекламными кампаниями и аналитика</p>
        </div>
        
        <div className="flex gap-4 z-20">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-yellow-500 hover:bg-yellow-400 text-zinc-900 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Создать кампанию
            </button>
        </div>
      </header>

      {/* ALERTS SECTION */}
      {activeAlerts.length > 0 && (
          <div className="mb-8 space-y-3">
              <h3 className="font-bold text-white flex items-center gap-2 mb-2">
                 <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                 Важные события
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeAlerts.map(alert => (
                    <div key={alert.id} className={`p-4 rounded-xl border flex flex-col gap-3 relative ${getAlertStyle(alert.type)}`}>
                         <button 
                            onClick={() => setDismissedAlerts(prev => [...prev, alert.id])}
                            className="absolute top-2 right-2 opacity-50 hover:opacity-100"
                         >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                         </button>
                         <div className="flex items-start gap-3">
                            {getAlertIcon(alert.type)}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold uppercase tracking-wide opacity-80">{alert.platform}</span>
                                    {alert.appName && (
                                        <div className="flex items-center gap-1 opacity-60">
                                            <span>•</span>
                                            <span className="text-xs">{alert.appName}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-medium leading-snug">{alert.message}</p>
                            </div>
                         </div>
                         <button 
                            onClick={() => alert.type === 'success' ? setIsModalOpen(true) : alert(`Переход к ${alert.platform} для действия: ${alert.action}`)}
                            className="text-xs font-bold underline underline-offset-2 opacity-80 hover:opacity-100 self-start mt-auto"
                         >
                            {alert.action} &rarr;
                         </button>
                    </div>
                ))}
              </div>
          </div>
      )}

      {/* Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-green-400">Прибыль</span> и Эффективность
            </h3>
            <div className="w-56">
                <CustomSelect 
                    value={filterApp}
                    options={appOptions}
                    onChange={(val) => setFilterApp(val as any)}
                />
            </div>
        </div>
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockProfitData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="profit" name="Прибыль" stroke="#4ade80" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                <Area type="monotone" dataKey="spend" name="Расход" stroke="#f87171" strokeWidth={2} fillOpacity={0} strokeDasharray="5 5" />
            </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-20 flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-white">Список кампаний</h3>
            <div className="flex gap-4 w-full md:w-auto z-10">
                <div className="w-48">
                    <CustomSelect 
                        value={filterPlatform}
                        options={platformOptions}
                        onChange={(val) => setFilterPlatform(val as any)}
                    />
                </div>
            </div>
        </div>
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-zinc-800">
                    <tr>
                        <th className="px-6 py-3">Название</th>
                        <th className="px-6 py-3">Приложение</th>
                        <th className="px-6 py-3">Платформа</th>
                        <th className="px-6 py-3">Таргетинг</th>
                        <th className="px-6 py-3">Креативы</th>
                        <th className="px-6 py-3">Статус</th>
                        <th className="px-6 py-3">Бюджет</th>
                        <th className="px-6 py-3">Расход</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                    {filteredCampaigns.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="px-6 py-8 text-center text-zinc-500">
                                Нет активных кампаний для выбранных фильтров
                            </td>
                        </tr>
                    ) : (
                        filteredCampaigns.map((camp) => (
                        <tr key={camp.id} className="hover:bg-zinc-800/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">{camp.name}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    {camp.appName && (
                                        <GameIcon app={camp.appName} className="w-6 h-6" />
                                    )}
                                    <span className="text-zinc-400">{camp.appName || '-'}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 capitalize text-zinc-300">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs border ${
                                    camp.platform === 'google' ? 'border-blue-500/20 bg-blue-500/10 text-blue-400' :
                                    camp.platform === 'facebook' ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400' :
                                    'border-pink-500/20 bg-pink-500/10 text-pink-400'
                                }`}>
                                    {camp.platform}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-zinc-400">
                                {camp.targeting ? (
                                    <div className="flex flex-col">
                                        <span>Geo: {camp.targeting.geo}</span>
                                        <span>Age: {camp.targeting.age}</span>
                                    </div>
                                ) : '-'}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex -space-x-2">
                                    {camp.creativeIds?.slice(0, 3).map(cid => {
                                        const item = libraryItems.find(i => i.id === cid);
                                        if (!item) return null;
                                        return (
                                            <img key={cid} src={item.thumbnail || item.url} className="w-8 h-8 rounded-full border border-zinc-800 object-cover bg-zinc-700" alt="creative"/>
                                        )
                                    })}
                                    {(camp.creativeIds?.length || 0) > 3 && (
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400">
                                            +{ (camp.creativeIds?.length || 0) - 3 }
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    camp.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                }`}>
                                    {camp.status === 'active' ? 'Активна' : 'Пауза'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-white">{camp.budget.toLocaleString()} ₽</td>
                            <td className="px-6 py-4 text-zinc-400">{camp.spent.toLocaleString()} ₽</td>
                        </tr>
                    )))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-white">Новая рекламная кампания</h2>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="text-zinc-500 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT COLUMN: Configuration */}
                        <div className="space-y-6">
                             {/* Game Select */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">1. Выберите игру</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {APP_NAMES.map(app => (
                                        <button
                                            key={app}
                                            onClick={() => setNewCampaign({...newCampaign, appName: app, creativeIds: []})} // Reset creatives on app change
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                                newCampaign.appName === app
                                                    ? 'bg-zinc-800 border-yellow-500 ring-1 ring-yellow-500/50'
                                                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'
                                            }`}
                                        >
                                            <GameIcon app={app} className="w-10 h-10 mb-2" />
                                            <span className="text-xs font-medium text-center">{app}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Presets */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">2. Быстрый старт (Пресеты)</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {PRESETS.map(preset => (
                                        <button
                                            key={preset.id}
                                            onClick={() => handleApplyPreset(preset)}
                                            className="text-left p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-yellow-500 hover:bg-zinc-900 transition-all group flex items-center justify-between"
                                        >
                                            <div>
                                                <div className="font-bold text-white text-sm group-hover:text-yellow-400">{preset.label}</div>
                                                <div className="text-[10px] text-zinc-500 leading-tight">{preset.desc}</div>
                                            </div>
                                            <div className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-300">Apply</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Название</label>
                                    <input 
                                        type="text"
                                        value={newCampaign.name}
                                        onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                                        placeholder="Название..."
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Бюджет (₽)</label>
                                    <input 
                                        type="number"
                                        value={newCampaign.budget}
                                        onChange={(e) => setNewCampaign({...newCampaign, budget: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-500"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                                <label className="block text-sm font-medium text-yellow-500 mb-3">Таргетинг</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">География</label>
                                        <select 
                                            value={newCampaign.geo}
                                            onChange={(e) => setNewCampaign({...newCampaign, geo: e.target.value})}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white"
                                        >
                                            <option value="WW">Весь мир</option>
                                            <option value="US">США</option>
                                            <option value="EU">Европа</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Платформа</label>
                                        <select 
                                            value={newCampaign.platform}
                                            onChange={(e) => setNewCampaign({...newCampaign, platform: e.target.value as any})}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white capitalize"
                                        >
                                            <option value="google">Google</option>
                                            <option value="facebook">Facebook</option>
                                            <option value="tiktok">TikTok</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Возраст</label>
                                        <select 
                                            value={newCampaign.age}
                                            onChange={(e) => setNewCampaign({...newCampaign, age: e.target.value})}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white"
                                        >
                                            <option value="18-65+">18+</option>
                                            <option value="13-24">13-24</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Creative Selection */}
                        <div className="flex flex-col h-full">
                             <label className="block text-sm font-medium text-zinc-400 mb-2">3. Рекламные материалы ({newCampaign.creativeIds.length})</label>
                             <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-4 overflow-y-auto min-h-[300px] max-h-[500px]">
                                {availableCreatives.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center">
                                        <p className="mb-2">Нет материалов для {newCampaign.appName}</p>
                                        <span className="text-xs">Сгенерируйте контент во вкладке "Генерация"</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {availableCreatives.map(item => {
                                            const isSelected = newCampaign.creativeIds.includes(item.id);
                                            return (
                                                <div 
                                                    key={item.id}
                                                    onClick={() => toggleCreative(item.id)}
                                                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                                                        isSelected ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-transparent hover:border-zinc-700'
                                                    }`}
                                                >
                                                    {item.thumbnail ? (
                                                        <img src={item.thumbnail} className="w-full h-full object-cover" alt={item.title}/>
                                                    ) : (
                                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">?</div>
                                                    )}
                                                    
                                                    {/* Badge */}
                                                    <div className="absolute top-1 left-1 bg-black/60 backdrop-blur px-1.5 py-0.5 rounded text-[10px] text-white">
                                                        {item.type}
                                                    </div>

                                                    {/* Selection Indicator */}
                                                    {isSelected && (
                                                        <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
                                                            <div className="bg-yellow-500 text-black rounded-full p-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                             </div>
                             <p className="text-xs text-zinc-500 mt-2 text-center">Выберите один или несколько креативов для ротации</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900 shrink-0">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        Отмена
                    </button>
                    <button 
                        onClick={handleCreateCampaign}
                        className="px-6 py-2.5 rounded-xl font-bold bg-yellow-500 text-zinc-900 hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all"
                    >
                        Запустить ({newCampaign.creativeIds.length})
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
