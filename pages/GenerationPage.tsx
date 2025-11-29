
import React, { useState, useRef, useEffect } from 'react';
import { MediaType, MediaItem, APP_NAMES, AppName, GAMES_DATA } from '../types';
import { generateImageService, generateVideoService, generatePlayableService } from '../services/geminiService';
import { GameIcon } from '../components/GameIcon';

interface GenerationPageProps {
  onAddToLibrary: (item: MediaItem) => void;
  userBalance: number;
  onSpendBalance: (amount: number) => void;
}

// Model Definitions with Previews and Costs
const MODELS = {
  video: [
    { 
      id: 'veo-3.1-fast-generate-preview', 
      name: 'Veo 3.1 Fast', 
      desc: 'Быстрая генерация', 
      img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
      cost: 0.10
    },
    { 
      id: 'veo-3.1-generate-preview', 
      name: 'Veo 3.1 Pro', 
      desc: 'Кинематографичное HD', 
      img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80',
      cost: 0.25
    },
    { 
      id: 'mock-sora', 
      name: 'Sora-v1', 
      desc: 'Реализм (Mock)', 
      img: 'https://images.unsplash.com/photo-1535016120720-40c6874c3b13?w=400&q=80',
      cost: 0.50
    },
    { 
      id: 'mock-gen3', 
      name: 'Gen-3 Alpha', 
      desc: 'Креативное движение (Mock)', 
      img: 'https://images.unsplash.com/photo-1616499370260-485b3e5ed653?w=400&q=80',
      cost: 0.40
    },
    { 
      id: 'mock-kling', 
      name: 'Kling AI', 
      desc: 'Высокая динамика (Mock)', 
      img: 'https://images.unsplash.com/photo-1605218427306-633ba87c9759?w=400&q=80',
      cost: 0.35
    },
    { 
      id: 'mock-luma', 
      name: 'Luma Dream', 
      desc: '3D анимация (Mock)', 
      img: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&q=80',
      cost: 0.20
    }
  ],
  image: [
    { 
      id: 'imagen-4.0-generate-001', 
      name: 'Imagen 4', 
      desc: 'Высокая детализация', 
      img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80',
      cost: 0.04
    },
    { 
      id: 'gemini-2.5-flash-image', 
      name: 'Gemini 2.5 Flash', 
      desc: 'Скорость и креатив', 
      img: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&q=80',
      cost: 0.01
    },
    { 
      id: 'gemini-3-pro-image-preview', 
      name: 'Gemini 3 Pro', 
      desc: 'Максимальное качество', 
      img: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80',
      cost: 0.08
    },
    { 
      id: 'mock-midjourney', 
      name: 'Midjourney v6', 
      desc: 'Арт-стилистика (Mock)', 
      img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&q=80',
      cost: 0.06
    },
    { 
      id: 'mock-flux', 
      name: 'Flux Pro', 
      desc: 'Фотореализм (Mock)', 
      img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80',
      cost: 0.03
    },
    { 
      id: 'mock-sd3', 
      name: 'Stable Diffusion 3', 
      desc: 'Контроль (Mock)', 
      img: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&q=80',
      cost: 0.02
    }
  ],
  playable: [
    { 
      id: 'gemini-2.5-flash', 
      name: 'Gemini 2.5 Flash', 
      desc: 'Оптимально для кода', 
      img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
      cost: 0.005
    },
    { 
      id: 'gemini-3-pro-preview', 
      name: 'Gemini 3 Pro', 
      desc: 'Сложная логика', 
      img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
      cost: 0.02
    },
    { 
      id: 'mock-gpt4o', 
      name: 'GPT-4o', 
      desc: 'Кодинг (Mock)', 
      img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80',
      cost: 0.03
    },
    { 
      id: 'mock-claude', 
      name: 'Claude 3.5 Sonnet', 
      desc: 'Чистый код (Mock)', 
      img: 'https://images.unsplash.com/photo-1531297461136-82lw9z1w9s?w=400&q=80',
      cost: 0.03
    },
    { 
      id: 'mock-deepseek', 
      name: 'DeepSeek V3', 
      desc: 'Эконом (Mock)', 
      img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80',
      cost: 0.001
    },
    { 
      id: 'mock-qwen', 
      name: 'Qwen 2.5', 
      desc: 'Математика (Mock)', 
      img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
      cost: 0.002
    }
  ]
};

export const GenerationPage: React.FC<GenerationPageProps> = ({ onAddToLibrary, userBalance, onSpendBalance }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'playable'>('video');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<AppName>(APP_NAMES[0]);
  
  // Image specific options
  const [removeBackground, setRemoveBackground] = useState(false);
  
  // Image Upload State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default model when tab changes
  useEffect(() => {
    if (activeTab === 'video') {
        setSelectedModel('veo-3.1-fast-generate-preview');
    } else if (activeTab === 'image') {
        setSelectedModel('imagen-4.0-generate-001');
    } else if (activeTab === 'playable') {
        setSelectedModel('gemini-2.5-flash');
    }
    setGeneratedResult(null);
    setError(null);
    setRemoveBackground(false);
  }, [activeTab]);

  const getCurrentCost = () => {
    const model = MODELS[activeTab].find(m => m.id === selectedModel);
    return model ? model.cost : 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt && !uploadedImage && activeTab !== 'playable') return; 
    if (activeTab === 'playable' && !prompt) return;

    const cost = getCurrentCost();
    if (userBalance < cost) {
      setError(`Недостаточно средств. Стоимость: $${cost}, Баланс: $${userBalance}`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedResult(null);

    // Contextualize prompt with selected App
    const finalPrompt = `[Context: Game Style ${selectedApp}] ${prompt}`;

    try {
      let resultUrl = '';
      if (activeTab === 'image') {
        resultUrl = await generateImageService(finalPrompt, selectedModel, "1:1", uploadedImage || undefined, removeBackground);
      } else if (activeTab === 'video') {
        resultUrl = await generateVideoService(finalPrompt, selectedModel, uploadedImage || undefined);
      } else if (activeTab === 'playable') {
        resultUrl = await generatePlayableService(finalPrompt, selectedModel);
      }
      
      setGeneratedResult(resultUrl);
      onSpendBalance(cost);
    } catch (err: any) {
      setError("Ошибка генерации. Попробуйте снова. " + (err.message || ''));
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToLibrary = () => {
    if (!generatedResult) return;
    
    // Generate random CPI metrics for video items
    const cpiMetrics = activeTab === 'video' ? {
        ww: Number((Math.random() * 0.5 + 0.1).toFixed(2)),
        usa: Number((Math.random() * 2.0 + 0.5).toFixed(2))
    } : undefined;

    const newItem: MediaItem = {
      id: Date.now().toString(),
      type: activeTab === 'video' ? MediaType.VIDEO : activeTab === 'image' ? MediaType.IMAGE : MediaType.PLAYABLE_AD,
      url: generatedResult,
      title: prompt ? prompt.slice(0, 30) : `Generated for ${selectedApp}`,
      createdAt: Date.now(),
      appName: selectedApp,
      tags: ['generated', activeTab, selectedModel, selectedApp],
      thumbnail: activeTab === 'video' ? 'https://picsum.photos/320/180' : generatedResult,
      cpiMetrics
    };

    onAddToLibrary(newItem);
    alert(`Сохранено в библиотеку для проекта ${selectedApp}!`);
    setGeneratedResult(null);
    setPrompt('');
    setUploadedImage(null);
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full p-6 lg:p-10 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Генерация контента</h1>
        <p className="text-zinc-400">Создавайте уникальные видео, изображения и Playable Ads с помощью ИИ.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-zinc-900/50 p-1 rounded-xl w-fit border border-zinc-800">
        {(['video', 'image', 'playable'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab 
                ? 'bg-yellow-500 text-zinc-900 shadow-lg shadow-yellow-500/20' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {tab === 'video' && 'Видео'}
            {tab === 'image' && 'Изображения'}
            {tab === 'playable' && 'Playable Ads'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full pb-20">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            
            {/* App Selection - Visual Grid */}
            <div className="mb-6">
                 <label className="block text-sm font-medium text-zinc-300 mb-3">
                    Целевое приложение (Игра)
                 </label>
                 <div className="grid grid-cols-3 gap-3">
                    {APP_NAMES.map(app => {
                        const isSelected = selectedApp === app;
                        return (
                            <button
                                key={app}
                                onClick={() => setSelectedApp(app)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                    isSelected 
                                        ? `bg-zinc-800 border-yellow-500 ring-1 ring-yellow-500/50 shadow-lg shadow-yellow-500/10` 
                                        : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600'
                                }`}
                            >
                                <GameIcon app={app} className="w-10 h-10 mb-2" />
                                <span className={`text-[10px] font-bold text-center leading-tight ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                                    {app}
                                </span>
                            </button>
                        );
                    })}
                 </div>
            </div>

            {/* Model Selection Visual */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-300 mb-3">
                    Нейросеть
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {MODELS[activeTab].map((model) => (
                    <div 
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`relative cursor-pointer rounded-xl overflow-hidden border transition-all group shrink-0 ${
                        selectedModel === model.id 
                          ? 'border-yellow-500 ring-2 ring-yellow-500/30' 
                          : 'border-zinc-700 hover:border-zinc-500 hover:ring-2 hover:ring-zinc-700/50'
                      }`}
                    >
                      <div className="h-24 w-full relative">
                        {/* Overlay Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent z-10 transition-opacity ${selectedModel === model.id ? 'opacity-80' : 'opacity-60 group-hover:opacity-40'}`} />
                        <img 
                          src={model.img} 
                          alt={model.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                        
                        {/* Checkmark for selected */}
                        {selectedModel === model.id && (
                          <div className="absolute top-2 right-2 z-20 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                           <div className="flex justify-between items-end">
                                <div>
                                    <div className="font-bold text-white text-sm shadow-black drop-shadow-md">{model.name}</div>
                                    <div className="text-[10px] text-zinc-300 shadow-black drop-shadow-md">{model.desc}</div>
                                </div>
                                <div className="bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold text-yellow-400">
                                    ${model.cost}
                                </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>

            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Промпт (Описание)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={activeTab === 'playable' ? "Мини-игра, где нужно ловить падающие монеты..." : "Футуристичный город..."}
              className="w-full h-24 bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all resize-none mb-4"
            />

            {/* Image Upload Area - Only for Video/Image */}
            {activeTab !== 'playable' && (
            <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Референс (Изображение)
                </label>
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full h-24 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                        uploadedImage ? 'border-yellow-500/50 bg-zinc-950' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50'
                    }`}
                >
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                    />
                    {uploadedImage ? (
                        <div className="flex items-center gap-4 px-4 w-full">
                            <img src={uploadedImage} alt="Reference" className="h-16 w-16 object-cover rounded-lg border border-zinc-700 shrink-0" />
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm text-white truncate">Изображение загружено</span>
                                <span className="text-xs text-yellow-500">Нажмите, чтобы заменить</span>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}
                                className="ml-auto p-1 bg-zinc-800 rounded-full hover:bg-zinc-700 shrink-0"
                            >
                                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-zinc-500">
                             <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                             <span className="text-xs">Загрузить изображение</span>
                        </div>
                    )}
                </div>
            </div>
            )}
            
            {/* Additional Options */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {activeTab === 'video' && (
              <div>
                 <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Длительность
                 </label>
                <select className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-500">
                  <option>5 секунд</option>
                  <option>10 секунд</option>
                </select>
              </div>
              )}
              {activeTab === 'image' && (
              <div className="col-span-2 flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Размер
                    </label>
                    <select className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-500">
                        <option>1024x1024 (1:1)</option>
                        <option>1920x1080 (16:9)</option>
                    </select>
                  </div>
                  <div className="flex-1">
                     <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Доп. опции
                     </label>
                     <label className="flex items-center gap-2 p-2.5 bg-zinc-950 border border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-500 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={removeBackground}
                            onChange={(e) => setRemoveBackground(e.target.checked)}
                            className="w-4 h-4 rounded border-zinc-600 text-yellow-500 focus:ring-yellow-500/50 bg-zinc-800" 
                        />
                        <span className="text-sm text-zinc-200">Удалить фон</span>
                     </label>
                  </div>
              </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!prompt && !uploadedImage && activeTab !== 'playable')}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  isGenerating || (!prompt && !uploadedImage && activeTab !== 'playable')
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-zinc-900 shadow-lg shadow-yellow-500/20'
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Генерация...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
                    Генерировать (${getCurrentCost()})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center shadow-xl relative overflow-hidden h-[600px] lg:h-auto">
          {error && (
            <div className="absolute top-4 left-4 right-4 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm z-30">
              {error}
            </div>
          )}
          
          {generatedResult ? (
            <div className="w-full h-full flex flex-col">
              <div className={`flex-1 flex items-center justify-center bg-black/50 rounded-xl overflow-hidden mb-4 border border-zinc-800 relative ${removeBackground ? 'bg-[url("https://www.transparenttextures.com/patterns/stardust.png")] bg-zinc-800' : ''}`}>
                {/* Checkerboard background for transparency preview if requested */}
                {activeTab === 'image' && removeBackground && (
                     <div className="absolute inset-0 bg-[url('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.U2jC7xKk9a6y5f5y5a5y5gHaHa%26pid%3DApi&f=1&ipt=e86f7b1e1b1e1b1e1b1e1b1e1b1e1b1e1b1e1b1e1b1e1b1e1b1e1b1e1b1e1b1e&ipo=images')] opacity-20 pointer-events-none" style={{backgroundSize: '20px'}}></div>
                )}
                
                {activeTab === 'video' && (
                  <video src={generatedResult} controls className="max-h-full max-w-full z-10" autoPlay loop />
                )}
                {activeTab === 'image' && (
                  <img src={generatedResult} alt="Generated" className="max-h-full max-w-full object-contain z-10" />
                )}
                {activeTab === 'playable' && (
                  <iframe 
                    src={generatedResult} 
                    className="w-full h-full bg-white border-0 z-10" 
                    title="Playable Ad Preview"
                  />
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={saveToLibrary}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                  Отправить в библиотеку
                </button>
                <a 
                  href={generatedResult} 
                  download={`superleo_gen_${Date.now()}.${activeTab === 'video' ? 'mp4' : activeTab === 'image' ? 'jpg' : 'html'}`}
                  className="px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center justify-center"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-zinc-500">
              <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </div>
              <p>Здесь появится результат генерации</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
