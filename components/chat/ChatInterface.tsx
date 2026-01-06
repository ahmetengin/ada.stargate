
import React, { useRef, useCallback, useEffect } from 'react';
import { Sun, Moon, Monitor, Radio, Signal, Wifi } from 'lucide-react';
import { Message, ModelType, TenantConfig, ThemeMode, UserRole } from '../../types';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';

interface ChatInterfaceProps {
    messages: Message[];
    isLoading: boolean;
    selectedModel: ModelType;
    userRole: UserRole;
    theme: ThemeMode;
    activeTenantConfig: TenantConfig; 
    onModelChange: (m: ModelType) => void;
    onSend: (text: string, attachments: File[]) => void;
    onQuickAction: (text: string) => void;
    onScanClick: () => void;
    onTraceClick: () => void;
    onToggleTheme: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    messages,
    isLoading,
    selectedModel,
    userRole,
    theme,
    activeTenantConfig, 
    onModelChange,
    onSend,
    onQuickAction,
    onScanClick,
    onTraceClick,
    onToggleTheme
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isUserAtBottomRef = useRef(true);

    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const threshold = 100;
        const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        isUserAtBottomRef.current = distanceToBottom < threshold;
    }, []);

    useEffect(() => {
        if (isUserAtBottomRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full w-full relative transition-colors duration-300 pb-20 lg:pb-0 bg-void">
            {/* Technical Background */}
            <div className="absolute inset-0 bg-grid-tech opacity-10 z-0 pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-tech-500/5 blur-[100px] pointer-events-none z-0"></div>

            {/* Comms Header */}
            <div className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-tech-900/50 bg-void/80 backdrop-blur-md z-10 flex-shrink-0">
                <div className="flex items-center gap-4 cursor-pointer group" onClick={onTraceClick}>
                    {/* Node Indicator */}
                    <div className="flex flex-col items-end">
                        <div className="flex gap-1">
                            <div className="w-1 h-3 bg-tech-500/50 skew-x-[-10deg]"></div>
                            <div className="w-1 h-3 bg-tech-500 skew-x-[-10deg]"></div>
                            <div className="w-1 h-3 bg-tech-400 skew-x-[-10deg] animate-pulse"></div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-tech font-bold text-white tracking-[0.1em] uppercase">
                                {activeTenantConfig.id}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-sm bg-tech-900/50 border border-tech-800 text-[9px] font-code text-tech-400">
                                NODE_ID: 8812
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 tracking-widest uppercase group-hover:text-tech-400 transition-colors">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]"></span>
                            Secure Link Established
                        </div>
                    </div>
                </div>
                
                {/* Frequency Tuner Visual */}
                <div className="flex-1 max-w-md mx-8 relative h-8 hidden xl:block">
                    <div className="absolute inset-0 flex items-center justify-between opacity-20">
                        {[...Array(20)].map((_,i) => <div key={i} className="w-px h-2 bg-tech-500"></div>)}
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center gap-8 text-[10px] font-mono text-tech-700">
                        <span>156.600</span>
                        <span className="text-tech-400 font-bold glow">156.625 MHz</span>
                        <span>156.650</span>
                    </div>
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-red-500/50"></div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-tech-950 border border-tech-900 rounded text-slate-400">
                        <Signal size={12} className="text-emerald-500" />
                        <span className="text-[10px] font-mono font-bold">-42 dBm</span>
                    </div>
                    <button 
                        onClick={onToggleTheme}
                        className="p-2 rounded hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                    >
                        {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div 
                className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-8 custom-scrollbar scroll-smooth relative z-10" 
                ref={scrollContainerRef}
                onScroll={handleScroll}
            >
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 bg-void/90 backdrop-blur-xl border-t border-tech-900/50 p-4 sm:p-6 pb-6 sm:pb-8 z-20 relative">
                <InputArea 
                    onSend={onSend}
                    isLoading={isLoading}
                    selectedModel={selectedModel}
                    onModelChange={onModelChange}
                    userRole={userRole}
                    onQuickAction={onQuickAction}
                    onScanClick={onScanClick}
                />
            </div>
        </div>
    );
};
