
import React, { useState, useEffect, useRef } from 'react';
import { getChatModel, generateImageService, generateVideoService } from '../services/geminiService';
import { ChatMessage, MediaType, MediaItem } from '../types';

interface ChatPageProps {
    onAddToLibrary: (item: MediaItem) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ onAddToLibrary }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [chatSession, setChatSession] = useState<any>(null);

    // Initialize chat session once
    useEffect(() => {
        setChatSession(getChatModel());
        setMessages([{
            id: 'init',
            role: 'model',
            text: 'Привет! Я SuperLeo бот. Я могу сгенерировать для вас видео или картинку, а также запустить рекламную кампанию. Просто попросите!',
            timestamp: Date.now()
        }]);
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !chatSession) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const result = await chatSession.sendMessage(userMsg.text);
            const calls = result.functionCalls; // Check for tool calls

            let responseText = result.response.text();
            let attachment: ChatMessage['attachment'] = undefined;

            if (calls && calls.length > 0) {
                // Handle Function Calls
                for (const call of calls) {
                    if (call.name === 'generate_media') {
                        const { prompt, mediaType } = call.args;
                        responseText = `Генерирую ${mediaType === 'VIDEO' ? 'видео' : 'изображение'} по запросу: "${prompt}"... Это может занять время.`;
                        
                        // Add an intermediate message saying "working on it"
                        setMessages(prev => [...prev, {
                            id: Date.now().toString() + '_working',
                            role: 'model',
                            text: responseText,
                            timestamp: Date.now()
                        }]);

                        // Perform generation
                        let url = '';
                        try {
                            if (mediaType === 'VIDEO') {
                                url = await generateVideoService(prompt);
                            } else {
                                url = await generateImageService(prompt);
                            }
                            attachment = { type: mediaType === 'VIDEO' ? 'video' : 'image', url };
                            
                            // Generate metrics for video
                            const cpiMetrics = mediaType === 'VIDEO' ? {
                                ww: Number((Math.random() * 0.5 + 0.1).toFixed(2)),
                                usa: Number((Math.random() * 2.0 + 0.5).toFixed(2))
                            } : undefined;

                            // Save to library automatically
                            onAddToLibrary({
                                id: Date.now().toString(),
                                type: mediaType === 'VIDEO' ? MediaType.VIDEO : MediaType.IMAGE,
                                url,
                                title: prompt,
                                createdAt: Date.now(),
                                tags: ['chat-generated'],
                                thumbnail: url,
                                cpiMetrics
                            });

                            responseText = "Готово! Я сохранил результат в вашу библиотеку.";
                            
                            // Send function response back to model (simplified for this demo: we just show result)
                            // In full implementation: await chatSession.sendMessage([{ functionResponse: ... }]);
                        } catch (err) {
                            responseText = "Произошла ошибка при генерации.";
                        }
                    } 
                    else if (call.name === 'create_campaign') {
                        const { name, budget } = call.args;
                        responseText = `Кампания "${name}" с бюджетом ${budget} создана! (Симуляция)`;
                        attachment = { 
                            type: 'campaign', 
                            data: { name, budget, status: 'active' } 
                        };
                    }
                }
            }

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText,
                timestamp: Date.now(),
                attachment
            };

            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: 'Извините, произошла ошибка соединения.',
                timestamp: Date.now()
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4 lg:p-6">
            <header className="mb-4">
                <h1 className="text-2xl font-bold text-white">AI Ассистент</h1>
                <p className="text-zinc-400 text-sm">Чат-интерфейс для управления платформой</p>
            </header>

            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                msg.role === 'user' 
                                    ? 'bg-yellow-500 text-zinc-900 rounded-br-none font-medium' 
                                    : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                
                                {/* Attachments */}
                                {msg.attachment && (
                                    <div className="mt-3 rounded-xl overflow-hidden bg-black/20 border border-black/10">
                                        {msg.attachment.type === 'image' && (
                                            <img src={msg.attachment.url} alt="Generated" className="w-full h-auto max-h-64 object-contain" />
                                        )}
                                        {msg.attachment.type === 'video' && (
                                            <video src={msg.attachment.url} controls className="w-full h-auto max-h-64" />
                                        )}
                                        {msg.attachment.type === 'campaign' && (
                                            <div className="p-3 bg-zinc-950/50">
                                                <div className="text-xs text-zinc-500 uppercase">Кампания</div>
                                                <div className="font-bold">{msg.attachment.data.name}</div>
                                                <div className="text-green-400 text-sm">Бюджет: {msg.attachment.data.budget} ₽</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <span className={`text-[10px] opacity-50 block mt-1 ${msg.role === 'user' ? 'text-zinc-800' : 'text-zinc-500'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                             <div className="bg-zinc-800 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}/>
                                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}/>
                                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}/>
                             </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-zinc-900 border-t border-zinc-800">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Напишите сообщение..."
                            disabled={loading}
                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all disabled:opacity-50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-900 rounded-xl px-5 flex items-center justify-center font-bold transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
