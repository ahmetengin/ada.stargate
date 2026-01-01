
import React, { useRef, useCallback, useEffect } from 'react';
import { Menu } from 'lucide-react';
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
    onSend: (text: string) => void;
    onQuickAction: (text: string) => void;
    onScanClick: () => void;
    // ADDED: onRadioClick to support VHF Radio mode toggle from App.tsx
    onRadioClick?: () => void;
    onTraceClick: () => void;
    onThemeChange: (t: ThemeMode) => void;
    onToggleSidebar: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    messages,
    isLoading,
    userRole,
    theme,
    activeTenantConfig, 
    onModelChange,
    selectedModel,
    onSend,
    onQuickAction,
    onScanClick,
    onRadioClick,
    onTraceClick,
    onThemeChange,
    onToggleSidebar
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
    }, [messages]);

    return (
        <div className="flex flex-col h-full w-full relative bg-[var(--bg-primary)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

            <header className="flex h-14 items-center justify-between px-4 border-b border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-md z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onToggleSidebar} className="lg:hidden p-2 text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                        <Menu size={18} />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={onTraceClick}>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-xs font-mono font-black text-[var(--text-primary)] uppercase tracking-widest group-hover:text-[var(--accent-color)] transition-colors">
                            {activeTenantConfig.node_address}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-lg border border-[var(--border-color)]">
                        {(['light', 'dark'] as ThemeMode[]).map(t => (
                            <button 
                                key={t}
                                onClick={() => onThemeChange(t)}
                                className={`px-2 py-1 text-[9px] font-bold uppercase rounded transition-all ${theme === t ? 'bg-white dark:bg-zinc-800 text-indigo-500 shadow-sm' : 'text-zinc-500'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 space-y-6" ref={scrollContainerRef}>
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 lg:p-6 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent">
                <InputArea 
                    onSend={(t) => onSend(t)}
                    isLoading={isLoading}
                    selectedModel={selectedModel}
                    onModelChange={onModelChange}
                    userRole={userRole}
                    onQuickAction={onQuickAction}
                    onScanClick={onScanClick}
                    // ADDED: Passed down onRadioClick
                    onRadioClick={onRadioClick}
                />
            </div>
        </div>
    );
};
