
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { ArrowUp, AudioWaveform, ScanLine, Radio, Sparkles, Zap } from 'lucide-react'; 
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
  selectedModel, 
  onModelChange,
  userRole,
  onQuickAction,
  onScanClick,
  onRadioClick
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
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'tr-TR'; 

      recognitionRef.current.onresult = (event: any) => {
        let currentSessionTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
            currentSessionTranscript += event.results[i][0].transcript;
        }
        const combinedText = (textBeforeDictationRef.current + ' ' + currentSessionTranscript).trim();
        setText(combinedText);
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
    <div className="w-full max-w-4xl mx-auto">
      
      {/* Model Selector & Quick Actions */}
      <div className="flex justify-between items-end mb-3">
          <div className="flex bg-white/50 dark:bg-[#020617]/60 p-1 rounded-lg border border-[var(--border-color)] backdrop-blur-md">
              <button onClick={() => onModelChange(ModelType.Flash)} className={`px-2.5 py-1 rounded-md text-[9px] font-bold flex items-center gap-1.5 transition-all ${selectedModel === ModelType.Flash ? 'bg-[var(--accent-color)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><Zap size={10}/> FLASH</button>
              <button onClick={() => onModelChange(ModelType.Pro)} className={`px-2.5 py-1 rounded-md text-[9px] font-bold flex items-center gap-1.5 transition-all ${selectedModel === ModelType.Pro ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><Sparkles size={10}/> PRO</button>
          </div>
          
          {userRole && onQuickAction && (
              <div className="opacity-80 hover:opacity-100 transition-opacity">
                  <QuickActions userRole={userRole} onAction={onQuickAction} />
              </div>
          )}
      </div>

      {/* Main Input Capsule */}
      <div className={`relative bg-white/80 dark:bg-[#0a101d]/80 backdrop-blur-xl rounded-3xl border shadow-sm transition-all duration-300 flex items-end p-2 
          ${isLoading ? 'border-[var(--accent-color)] shadow-md' : 'border-[var(--border-color)] hover:border-[var(--accent-color)]'}
          ${isDictating ? 'ring-1 ring-red-500/50 border-red-500/50' : ''}`}>
          
          {/* Tools */}
          <div className="flex items-center gap-1 pr-2 border-r border-[var(--border-color)] mr-2 mb-2">
              <button onClick={onScanClick} className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--accent-color)] rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" title="Scanner">
                  <ScanLine size={18} />
              </button>
              <button onClick={onRadioClick} className="p-2.5 text-red-500/80 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors relative" title="Radio">
                  <Radio size={18} />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]"></span>
              </button>
          </div>
          
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={isDictating ? "Listening on secure channel..." : "Execute command or query..."}
            className={`flex-1 bg-transparent border-none focus:outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] py-3.5 font-mono min-w-0 max-h-[200px] resize-none ${isDictating ? 'placeholder:text-red-400 animate-pulse' : ''}`}
            disabled={isLoading}
          />

          <div className="flex items-center gap-2 pl-2 mb-1.5">
              <button 
                onClick={toggleDictation} 
                className={`p-2.5 rounded-full transition-all duration-300 ${isDictating ? 'text-white bg-red-500 shadow-[0_0_15px_red] scale-110' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'}`}
                title="Voice Input"
              >
                  <AudioWaveform size={18} />
              </button>
              <button 
                onClick={handleSend}
                disabled={!text.trim() || isLoading}
                className={`p-2.5 rounded-full transition-all flex items-center justify-center ${text.trim() ? 'bg-[var(--accent-color)] text-white shadow-md hover:scale-105' : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]'}`}
              >
                  {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ArrowUp size={18} />}
              </button>
          </div>
      </div>
      
      <div className="text-[9px] text-center text-[var(--text-secondary)] mt-3 uppercase tracking-[0.2em] font-bold opacity-50 flex items-center justify-center gap-2">
          <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
          Secure Connection Established • 256-BIT Encryption
      </div>
    </div>
  );
};
