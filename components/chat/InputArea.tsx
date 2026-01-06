
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { ArrowUp, AudioWaveform, ScanLine, Command, Radio, ChevronRight, Mic } from 'lucide-react';
import { ModelType, UserRole } from '../../types';
import { QuickActions } from './QuickActions';

interface InputAreaProps {
  onSend: (text: string, attachments: File[]) => void;
  isLoading: boolean;
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
  userRole?: UserRole;
  onQuickAction?: (text: string) => void;
  onScanClick?: () => void;
  onRadioClick?: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  onSend, 
  isLoading, 
  userRole,
  onQuickAction,
  onScanClick,
  onRadioClick,
}) => {
  const [text, setText] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const textBeforeDictationRef = useRef(''); 

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'tr-TR'; 

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const newText = (textBeforeDictationRef.current + ' ' + transcript).trim();
        setText(newText);
        setIsDictating(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsDictating(false);
      };

      recognitionRef.current.onend = () => {
        setIsDictating(false);
      };
    }
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
  };

  const toggleDictation = () => {
    if (!recognitionRef.current) {
        alert("Browser does not support speech recognition.");
        return;
    }
    if (isDictating) {
        recognitionRef.current.stop();
        setIsDictating(false);
    } else {
        try {
            textBeforeDictationRef.current = text;
            recognitionRef.current.start();
            setIsDictating(true);
        } catch (e) {
            setIsDictating(false);
        }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSend = () => {
    if ((!text.trim()) || isLoading) return;
    onSend(text, []);
    setText('');
    textBeforeDictationRef.current = ''; 
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {userRole && onQuickAction && (
          <div className="w-full pl-2">
              <QuickActions userRole={userRole} onAction={onQuickAction} />
          </div>
      )}

      <div className={`
          relative group transition-all duration-300
          ${isLoading ? 'opacity-80 cursor-wait' : ''}
      `}>
          {/* Decorative Borders that glow on hover/focus */}
          <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-tech-500/30 rounded-tl-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-500"></div>
          <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-tech-500/30 rounded-br-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-500"></div>

          <div className={`
              relative bg-black/40 backdrop-blur-xl rounded-2xl border flex items-end p-2 shadow-lg transition-all duration-300 ease-out
              ${isDictating 
                ? 'border-red-500/50 ring-1 ring-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                : 'border-tech-800/60 hover:border-tech-700/80 hover:bg-black/50'
              }
              focus-within:border-tech-500/60 focus-within:ring-1 focus-within:ring-tech-500/20 focus-within:shadow-[0_0_25px_rgba(20,184,166,0.1)] focus-within:bg-black/60 focus-within:-translate-y-0.5
          `}>
              
              {/* Left Tools */}
              <div className="flex items-center gap-1 pr-2 border-r border-tech-900/50 mr-2 mb-2 self-end pb-1 pl-1">
                  <button onClick={onScanClick} className="p-2 text-slate-500 hover:text-tech-400 hover:bg-white/5 rounded-xl transition-colors" title="Scanner">
                      <ScanLine size={18} strokeWidth={1.5} />
                  </button>
                  <button onClick={onRadioClick} className="p-2 text-red-500 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors shadow-[0_0_10px_rgba(239,68,68,0.2)]" title="VHF Radio">
                      <Radio size={18} strokeWidth={1.5} />
                  </button>
              </div>
              
              {/* Text Input */}
              <div className="flex-1 relative py-1">
                  <div className={`absolute left-0 top-3.5 text-tech-600 transition-opacity duration-300 pointer-events-none ${hasText ? 'opacity-100' : 'opacity-50'}`}>
                      <ChevronRight size={16} />
                  </div>
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    placeholder={isDictating ? "LISTENING [REC]..." : "Enter command or query..."}
                    className={`
                        w-full bg-transparent border-none focus:outline-none text-sm text-slate-200 
                        placeholder:text-slate-600 py-3 pl-6 pr-2 font-mono min-w-0 max-h-[150px] resize-none leading-relaxed
                        ${isDictating ? 'placeholder:text-red-500 animate-pulse' : ''}
                    `}
                    disabled={isLoading}
                    spellCheck={false}
                  />
              </div>

              {/* Right Tools */}
              <div className="flex items-center gap-2 pl-2 mb-1.5 self-end">
                  <button 
                    onClick={toggleDictation} 
                    className={`
                        p-2.5 rounded-xl transition-all duration-300
                        ${isDictating 
                            ? 'text-white bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }
                    `}
                  >
                      {isDictating ? <AudioWaveform size={20} /> : <Mic size={20} strokeWidth={1.5} />}
                  </button>
                  
                  <button 
                    onClick={handleSend}
                    disabled={!hasText || isLoading}
                    className={`
                        p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center transform
                        ${hasText 
                            ? 'bg-gradient-to-br from-tech-500 to-tech-600 text-white shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-105 hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] translate-x-0 opacity-100' 
                            : 'bg-tech-950/50 border border-tech-900 text-slate-600 cursor-not-allowed scale-95 opacity-70'
                        }
                    `}
                  >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <ArrowUp size={20} strokeWidth={2.5} />
                      )}
                  </button>
              </div>
          </div>
      </div>
      
      {/* Status Line */}
      <div className="hidden sm:flex items-center justify-center gap-4 text-[9px] text-slate-600 font-code tracking-widest opacity-60 transition-opacity duration-500 group-hover:opacity-100">
          <div className="flex items-center gap-1.5">
            <div className={`w-1 h-1 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            {isLoading ? 'PROCESSING NEURAL TASK...' : 'SYSTEM READY'}
          </div>
          <span>::</span>
          <div className="flex items-center gap-1.5">
            <Command size={10} /> 
            ENCRYPTION: AES-256
          </div>
      </div>
    </div>
  );
};
