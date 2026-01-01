
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { ArrowUp, AudioWaveform, ScanLine, Command, Radio } from 'lucide-react';
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
  // ADDED: onRadioClick prop
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
        console.error("Speech recognition error", event.error);
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
        alert("Tarayıcı sesli komutu desteklemiyor.");
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
            console.error(e);
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
    if (isDictating && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsDictating(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {userRole && onQuickAction && (
          <div className="w-full">
              <QuickActions userRole={userRole} onAction={onQuickAction} />
          </div>
      )}

      <div className={`relative bg-white/90 dark:bg-[#0a101d]/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border shadow-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-end p-2 
          ${isLoading 
            ? 'border-[var(--accent-color)] shadow-[0_0_15px_rgba(34,211,238,0.2)] opacity-80 cursor-wait' 
            : 'border-[var(--border-color)] hover:border-[var(--accent-color)]/50 hover:shadow-lg focus-within:border-[var(--accent-color)] focus-within:ring-1 focus-within:ring-[var(--accent-color)]/50'
          }
          ${isDictating ? 'ring-2 ring-red-500/50 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : ''}`}>
          
          <div className="flex items-center gap-1 pr-2 border-r border-[var(--border-color)] mr-2 mb-1.5">
              <button onClick={onScanClick} className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-color)] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group" title="Tarayıcı">
                  <ScanLine size={18} className="group-hover:scale-110 transition-transform"/>
              </button>
              {/* ADDED: VHF Radio Button */}
              <button onClick={onRadioClick} className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-color)] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group" title="VHF Radyo Modu">
                  <Radio size={18} className="group-hover:scale-110 transition-transform"/>
              </button>
          </div>
          
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={isDictating ? "Dinliyorum..." : "Talimat verin..."}
            className={`flex-1 bg-transparent border-none focus:outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] py-3 font-mono min-w-0 max-h-[150px] resize-none leading-relaxed ${isDictating ? 'placeholder:text-red-400 animate-pulse' : ''}`}
            disabled={isLoading}
          />

          <div className="flex items-center gap-2 pl-2 mb-1">
              <button 
                onClick={toggleDictation} 
                className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${isDictating ? 'text-white bg-red-500 shadow-[0_0_20px_red] scale-110 animate-pulse' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'}`}
                title="Sesli Giriş"
              >
                  <AudioWaveform size={20} />
              </button>
              <button 
                onClick={handleSend}
                disabled={!text.trim() || isLoading}
                className={`p-2.5 rounded-xl transition-all flex items-center justify-center shadow-sm ${text.trim() ? 'bg-[var(--accent-color)] text-white shadow-lg hover:scale-105 hover:shadow-cyan-500/30' : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]'}`}
              >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ArrowUp size={20} />}
              </button>
          </div>
      </div>
      
      <div className="hidden sm:flex items-center justify-center gap-3 text-[9px] text-[var(--text-secondary)] uppercase tracking-[0.2em] font-bold opacity-60">
          <div className={`flex items-center gap-1.5 ${isLoading ? 'text-amber-500' : 'text-emerald-500'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            {isLoading ? 'PROCESSING NEURAL TASK' : 'SYSTEM READY'}
          </div>
          <span className="text-[var(--border-color)]">|</span>
          <div className="flex items-center gap-1.5">
            <Command size={10} /> 
            EDGE COMPUTE ACTIVE
          </div>
      </div>
    </div>
  );
};
