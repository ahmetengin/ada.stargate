
import React, { useRef, useCallback, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Message, ModelType, TenantConfig, ThemeMode, UserRole } from '../../types';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';

interface ChatInterfaceProps {
    messages: Message[];
    activeChannel: string;
    isLoading: boolean;
    selectedModel: ModelType;
    userRole: UserRole;
    theme: ThemeMode;
    activeTenantConfig: TenantConfig; 
    onModelChange: (m: ModelType) => void;
    onSend: (text: string, attachments: File[]) => void;
    onQuickAction: (text: string) => void;
    onScanClick: () => void;
    onRadioClick: () => void;
    onTraceClick: () => void;
    onToggleTheme: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    messages,
    activeChannel,
    isLoading,
    selectedModel,
    userRole,
    theme,
    activeTenantConfig, 
    onModelChange,
    onSend,
    onQuickAction,
    onScanClick,
    onRadioClick,
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
        <div className="flex flex-col h-full w-full relative transition-colors duration-300">
            {/* Background Base - Now uses CSS Variables */}
            <div className="absolute inset-0 bg-[var(--bg-primary)] z-0"></div>
            
            {/* Atmospheric Glow - Only visible in Dark Mode */}
            <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-cyan-500/5 blur-[120px] pointer-events-none z-0"></div>

            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-md z-10 flex-shrink-0 transition-colors">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={onTraceClick}>
                    <div className="relative">
                        <div className="w-2.5 h-2.5 bg-teal-500 rounded-full shadow-[0_0_10px_#14b8a6] group-hover:scale-110 transition-transform"></div>
                        <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <div>
                        <span className="text-[10px] font-display font-bold text-[var(--text-secondary)] tracking-[0.2em] uppercase hover:text-[var(--accent-color)] transition-colors block leading-none">
                            {activeTenantConfig.id}.MARINA
                        </span>
                        <span className="text-[8px] font-mono text-[var(--accent-color)] tracking-widest opacity-80">SECURE LINK</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-white/5 rounded-full border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-colors">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-mono font-bold text-[var(--text-secondary)]">VHF {activeChannel}</span>
                    </div>
                    <button 
                        onClick={onToggleTheme}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors"
                    >
                        {theme === 'light' ? <Sun size={14} /> : theme === 'dark' ? <Moon size={14} /> : <Monitor size={14} />}
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
            <div className="flex-shrink-0 bg-[var(--glass-bg)] backdrop-blur-xl border-t border-[var(--border-color)] p-4 sm:p-6 pb-6 sm:pb-8 z-20 relative transition-colors">
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
