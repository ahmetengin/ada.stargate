
import React, { useEffect, useState, useRef } from 'react';
import { X, Mic, Radio, AlertTriangle, Power, RefreshCw, Activity, Signal, MessageSquare, ChevronRight, Send } from 'lucide-react';
import { LiveSession } from '../../services/liveService';
import { LiveConnectionState, UserProfile, TenantConfig } from '../../types';
import { formatCoordinate, getCurrentMaritimeTime } from '../../services/utils';
import { vhfExpert } from '../../services/agents/vhfAgent';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  activeTenantConfig: TenantConfig;
  onTranscriptReceived: (userText: string, modelText: string) => void;
  channel: string;
}

interface RadioLog {
    id: string;
    sender: 'YOU' | 'ADA' | 'OTHER';
    text: string;
    timestamp: string;
    type: 'ROUTINE' | 'SAFETY' | 'DISTRESS' | 'URGENCY';
}

const getVhfDetails = (channel: string) => {
    const db: Record<string, any> = {
        '16': { freq: '156.800', type: 'Simplex', desc: 'Distress, Safety & Calling' },
        '72': { freq: '156.625', type: 'Simplex', desc: 'Inter-ship & Marina Ops' },
        '73': { freq: '156.675', type: 'Simplex', desc: 'Inter-ship (Yachting)' },
        '06': { freq: '156.300', type: 'Simplex', desc: 'Search and Rescue (SAR)' },
        '12': { freq: '156.600', type: 'Simplex', desc: 'Port Operations / VTS' },
        '13': { freq: '156.650', type: 'Simplex', desc: 'Bridge-to-Bridge (Nav Safety)' },
        '67': { freq: '156.375', type: 'Simplex', desc: 'Meteorology / Weather' },
    };
    return db[channel] || { freq: '---.---', type: 'Unknown', desc: 'Auxiliary' };
};

export const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose, userProfile, activeTenantConfig, onTranscriptReceived, channel }) => {
  const [status, setStatus] = useState<LiveConnectionState>(LiveConnectionState.Disconnected);
  const [audioLevel, setAudioLevel] = useState(0);
  const [session, setSession] = useState<LiveSession | null>(null);
  const [logs, setLogs] = useState<RadioLog[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(['ROGER', 'SAY AGAIN', 'STAND BY']);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const lat = activeTenantConfig.masterData?.identity?.location?.coordinates?.lat || 0;
  const lng = activeTenantConfig.masterData?.identity?.location?.coordinates?.lng || 0;
  const displayCoordinates = `${formatCoordinate(lat, 'lat')} / ${formatCoordinate(lng, 'lng')}`;
  const vhfInfo = getVhfDetails(channel);

  useEffect(() => {
    if (isOpen) {
        if (!session) connect();
        // Add initial system message
        addLog('ADA', `Radio Check. Channel ${channel} (${vhfInfo.desc}). Standing by.`, 'ROUTINE');
    } else {
        disconnectSession();
    }
    return () => disconnectSession();
  }, [isOpen]);

  useEffect(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const disconnectSession = () => {
    if (session) session.disconnect();
    setSession(null);
    setStatus(LiveConnectionState.Disconnected);
    setLogs([]);
  };

  const addLog = (sender: 'YOU' | 'ADA' | 'OTHER', text: string, type: RadioLog['type'] = 'ROUTINE') => {
      setLogs(prev => [...prev, {
          id: `log_${Date.now()}`,
          sender,
          text,
          timestamp: getCurrentMaritimeTime(),
          type
      }]);
      
      // Analyze for new suggestions based on incoming message
      if (sender !== 'YOU') {
          const analysis = vhfExpert.analyzeTransmission(text);
          setSuggestions(analysis.suggestions);
      }
  };

  const connect = async () => {
      const newSession = new LiveSession();
      
      newSession.onStatusChange = (s) => setStatus(s as LiveConnectionState);
      newSession.onAudioLevel = (level) => setAudioLevel(prev => prev * 0.8 + level * 0.2);
      
      newSession.onTurnComplete = (userText, modelText) => {
          if (userText) addLog('YOU', userText);
          if (modelText) addLog('ADA', modelText);
          onTranscriptReceived(userText, modelText);
      };

      setSession(newSession);
      await newSession.connect(userProfile, activeTenantConfig);
  };

  const handleSuggestionClick = (phrase: string) => {
      // In a real scenario, this would send text to the model to speak via TTS
      // For now, we log it as if spoken
      addLog('YOU', phrase);
      session?.sendText(phrase); // Assuming LiveSession has a sendText method for text-to-speech injection
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-mono">
      <div className="w-full max-w-2xl bg-[#0a0f14] border border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* TOP BAR: Frequency & Status */}
        <div className="bg-[#11161d] p-4 flex justify-between items-center border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-zinc-800 shadow-inner">
                <div className={`w-3 h-3 rounded-full ${status === LiveConnectionState.Connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            </div>
            <div>
                <div className="text-3xl font-black text-white tracking-tighter leading-none flex items-baseline gap-2">
                    {channel} <span className="text-xs font-medium text-zinc-500 font-sans tracking-normal">VHF</span>
                </div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-widest">{vhfInfo.desc}</div>
            </div>
          </div>
          
          <div className="text-right hidden sm:block">
             <div className="text-xl font-bold text-indigo-400">{vhfInfo.freq} <span className="text-xs text-zinc-600">MHz</span></div>
             <div className="text-[10px] text-zinc-500">{displayCoordinates}</div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-500 transition-colors"><X size={20}/></button>
        </div>

        {/* MAIN DISPLAY: Transmission Log */}
        <div className="flex-1 bg-black/50 overflow-y-auto p-4 space-y-3 relative">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%,transparent)] bg-[length:30px_30px] pointer-events-none"></div>
            
            {logs.length === 0 && status === LiveConnectionState.Connecting && (
                <div className="flex flex-col items-center justify-center h-full text-zinc-600 animate-pulse">
                    <Radio size={48} className="mb-4 opacity-50" />
                    <span className="tracking-widest text-xs uppercase">Establishing Secure Link...</span>
                </div>
            )}

            {logs.map(log => (
                <div key={log.id} className={`flex gap-4 animate-in slide-in-from-left-2 fade-in duration-300 ${log.sender === 'YOU' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 text-[10px] font-bold border ${
                        log.sender === 'ADA' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                        log.sender === 'YOU' ? 'bg-zinc-800 border-zinc-700 text-zinc-400' :
                        'bg-amber-500/10 border-amber-500/30 text-amber-500'
                    }`}>
                        {log.sender}
                    </div>
                    <div className={`flex flex-col max-w-[80%] ${log.sender === 'YOU' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2 rounded-xl text-xs leading-relaxed border ${
                            log.type === 'DISTRESS' ? 'bg-red-900/20 border-red-500/50 text-red-200' :
                            log.type === 'URGENCY' ? 'bg-amber-900/20 border-amber-500/50 text-amber-200' :
                            log.sender === 'ADA' ? 'bg-indigo-900/10 border-indigo-500/20 text-indigo-100' :
                            log.sender === 'YOU' ? 'bg-zinc-800 border-zinc-700 text-zinc-300' :
                            'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}>
                            {log.text.toUpperCase()}
                        </div>
                        <span className="text-[9px] text-zinc-600 mt-1 px-1">{log.timestamp}</span>
                    </div>
                </div>
            ))}
            <div ref={logsEndRef} />
        </div>

        {/* AI TACTICAL SUGGESTIONS */}
        <div className="bg-[#0e1218] border-t border-zinc-800 p-3">
             <div className="flex items-center gap-2 mb-2">
                 <Activity size={12} className="text-emerald-500" />
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">SMCP Response Suggestions</span>
             </div>
             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                 {suggestions.map((suggestion, idx) => (
                     <button 
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold rounded border border-zinc-700 hover:border-zinc-500 transition-all whitespace-nowrap flex items-center gap-2 group"
                     >
                         {suggestion} <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                     </button>
                 ))}
             </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-[#11161d] p-6 border-t border-zinc-800 shrink-0 flex items-center justify-center relative">
            {/* Visualizer (Fake) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none gap-0.5">
                {[...Array(60)].map((_, i) => (
                    <div key={i} className="w-1 bg-indigo-500 transition-all duration-75" style={{ height: `${Math.random() * (status === 'connected' ? 40 : 10)}%` }}></div>
                ))}
            </div>

            <div className="flex items-center gap-8 relative z-10">
                <div className={`flex flex-col items-center gap-1 ${status === LiveConnectionState.Connected ? 'text-emerald-500' : 'text-zinc-600'}`}>
                    <Signal size={16} />
                    <span className="text-[9px] font-bold">RX</span>
                </div>

                <button 
                    className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)] ${
                        status === LiveConnectionState.Connected 
                        ? 'bg-indigo-600 border-indigo-400 text-white hover:scale-105 hover:bg-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.3)]' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                    }`}
                >
                    <Mic size={32} />
                </button>

                <div className={`flex flex-col items-center gap-1 ${audioLevel > 0.1 ? 'text-red-500' : 'text-zinc-600'}`}>
                    <Activity size={16} />
                    <span className="text-[9px] font-bold">TX</span>
                </div>
            </div>
            
            <div className="absolute bottom-2 right-4 text-[9px] text-zinc-600 font-mono">
                {status.toUpperCase()}
            </div>
        </div>

      </div>
    </div>
  );
};
