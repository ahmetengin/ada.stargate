
import React, { useRef, useCallback, useEffect } from 'react';
import { Sun, Moon, Monitor, Menu } from 'lucide-react';
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
    onThemeChange: (t: ThemeMode) => void;
    onRadioClick: () => void;
    onToggleSidebar: () => void; // NEW PROP
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
    onThemeChange,
    onRadioClick,
    onToggleSidebar // NEW PROP
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
        <div className="flex flex-col h-full w-full relative transition-colors duration-300">
            {/* Background Base */}
            <div className="absolute inset-0 bg-[var(--bg-primary)] z-0"></div>
            
            {/* Atmospheric Glow */}
            <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-cyan-500/5 blur-[120px] pointer-events-none z-0"></div>

            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 lg:px-6 border-b border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-md z-10 flex-shrink-0 transition-colors">
                
                <div className="flex items-center gap-3">
                    {/* Mobile Sidebar Toggle */}
                    <button 
                        onClick={onToggleSidebar}
                        className="lg:hidden p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex items-center gap-3 cursor-pointer group" onClick={onTraceClick}>
                        <div className="relative">
                            <div className="w-2.5 h-2.5 bg-teal-500 rounded-full shadow-[0_0_10px_#14b8a6] group-hover:scale-110 transition-transform"></div>
                            <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-75"></div>
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-xs font-mono font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors">
                                ● {activeTenantConfig.node_address}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)] bg-black/5 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-zinc-800 p-0.5">
                        <button onClick={() => onThemeChange('light')} className={`px-2 sm:px-3 py-1 rounded-full transition-colors ${theme === 'light' ? 'text-[var(--text-primary)] bg-[var(--bg-secondary)] shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}>Day</button>
                        <button onClick={() => onThemeChange('dark')} className={`px-2 sm:px-3 py-1 rounded-full transition-colors ${theme === 'dark' ? 'text-[var(--text-primary)] bg-[var(--bg-secondary)] shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}>Night</button>
                        <button onClick={() => onThemeChange('auto')} className={`hidden sm:block px-3 py-1 rounded-full transition-colors ${theme === 'auto' ? 'text-[var(--text-primary)] bg-[var(--bg-secondary)] shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}>Auto</button>
                    </div>
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
            <div className="flex-shrink-0 bg-[var(--glass-bg)] backdrop-blur-xl border-t border-[var(--border-color)] p-4 z-20 relative transition-colors">
                <InputArea 
                    onSend={onSend}
                    isLoading={isLoading}
                    selectedModel={selectedModel}
                    onModelChange={onModelChange}
                    userRole={userRole}
                    onQuickAction={onQuickAction}
                    onScanClick={onScanClick}
                    onRadioClick={onRadioClick}
                />
            </div>
        </div>
    );
};
