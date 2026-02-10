import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { ArrowUp, AudioWaveform, ScanLine, Radio, StopCircle, AlertCircle } from 'lucide-react';
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
  onRadioClick,
}) => {
  const [text, setText] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [dictationError, setDictationError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const showError = (msg: string) => {
      setDictationError(msg);
      setTimeout(() => setDictationError(null), 3000);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Changed to false for simpler single-command usage
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'tr-TR'; 

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        
        setText(transcript);
        setDictationError(null); // Clear errors on success
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsDictating(false);
        
        switch (event.error) {
            case 'not-allowed':
                showError("Microphone access denied.");
                break;
            case 'no-speech':
                showError("No speech detected.");
                break;
            case 'network':
                showError("Network error during dictation.");
                break;
            case 'aborted':
                 // Ignore manual stops
                break;
            default:
                showError(`Voice error: ${event.error}`);
        }
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
        showError("Browser does not support speech recognition.");
        return;
    }

    if (isDictating) {
        recognitionRef.current.stop();
        setIsDictating(false);
    } else {
        try {
            setText(''); // Clear text on new dictation
            setDictationError(null);
            recognitionRef.current.start();
            setIsDictating(true);
        } catch (e) {
            console.error(e);
            setIsDictating(false);
            showError("Could not start voice input.");
        }
    }
  };

  // Auto-resize textarea
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
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      
      {/* Error Toast */}
      {dictationError && (
          <div className="absolute -top-12 left-0 right-0 flex justify-center z-50 pointer-events-none">
              <div className="bg-red-500/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <AlertCircle size={14} />
                  {dictationError}
              </div>
          </div>
      )}

      {userRole && onQuickAction && !isLoading && (
          <div className="opacity-80 hover:opacity-100 transition-opacity w-full mb-2">
              <QuickActions userRole={userRole} onAction={onQuickAction} />
          </div>
      )}

      <div className={`relative bg-white/90 dark:bg-[#0a101d]/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border shadow-sm transition-all duration-300 flex items-end p-2 
          ${isLoading ? 'border-tech-500/50 shadow-md opacity-80 cursor-wait' : 'border-[var(--border-color)] hover:border-tech-500/50'}
          ${isDictating ? 'ring-1 ring-red-500/50 border-red-500/50' : ''}
          ${dictationError ? 'border-red-500/50' : ''}`}>
          
          {/* Left Tools */}
          <div className="flex items-center gap-1 pr-2 border-r border-[var(--border-color)] mr-2 mb-1.5 shrink-0">
              <button onClick={onScanClick} disabled={isLoading} className="p-2 text-[var(--text-secondary)] hover:text-tech-500 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50" title="Scanner">
                  <ScanLine size={18} />
              </button>
              <button onClick={onRadioClick} disabled={isLoading} className="p-2 text-red-500/80 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors disabled:opacity-50" title="VHF Radio">
                  <Radio size={18} />
              </button>
          </div>
          
          {/* Main Input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Ada is thinking..." : isDictating ? "Listening..." : "Message Ada..."}
            className={`flex-1 bg-transparent border-none focus:outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] py-3 font-mono min-w-0 max-h-[150px] resize-none ${isDictating ? 'placeholder:text-red-400 animate-pulse' : ''}`}
            disabled={isLoading}
            autoFocus
          />

          {/* Right Actions */}
          <div className="flex items-center gap-2 pl-2 mb-1 shrink-0">
              <button 
                onClick={toggleDictation} 
                disabled={isLoading}
                className={`p-2 rounded-full transition-all duration-300 ${isDictating ? 'text-white bg-red-500 shadow-[0_0_15px_red] scale-110' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50'}`}
                title="Voice Input"
              >
                  {isDictating ? <StopCircle size={18} /> : <AudioWaveform size={18} />}
              </button>
              
              <button 
                onClick={handleSend}
                disabled={!text.trim() || isLoading}
                className={`p-2 rounded-full transition-all flex items-center justify-center ${text.trim() && !isLoading ? 'bg-tech-600 text-white shadow-md hover:scale-105 hover:bg-tech-500' : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] cursor-not-allowed'}`}
              >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ArrowUp size={18} />
                  )}
              </button>
          </div>
      </div>
      
      <div className="hidden sm:flex items-center justify-center gap-2 mt-3 opacity-40">
          <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-tech-500 animate-bounce' : 'bg-emerald-500'}`}></div>
          <span className="text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-[0.2em] font-bold">
              {isLoading ? 'PROCESSING NEURAL REQUEST...' : 'SECURE LINK ESTABLISHED'}
          </span>
      </div>
    </div>
  );
};