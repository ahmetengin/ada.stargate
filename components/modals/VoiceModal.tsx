
import React, { useEffect, useState } from 'react';
import { PhoneOff, Mic, Activity, Signal, Zap } from 'lucide-react';
import { LiveSession } from '../../services/liveService';
import { LiveConnectionState, UserProfile, TenantConfig } from '../../types';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  activeTenantConfig: TenantConfig;
  onTranscriptReceived: (userText: string, modelText: string) => void;
  channel: string;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({ 
    isOpen, 
    onClose, 
    userProfile, 
    activeTenantConfig, 
    onTranscriptReceived, 
    channel 
}) => {
  const [status, setStatus] = useState<LiveConnectionState>(LiveConnectionState.Disconnected);
  const [session, setSession] = useState<LiveSession | null>(null);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (isOpen) {
        const newSession = new LiveSession();
        newSession.onStatusChange = (s) => setStatus(s as LiveConnectionState);
        newSession.onAudioLevel = (level) => setVolume(level * 100);
        newSession.onTurnComplete = (u, m) => onTranscriptReceived(u, m);
        setSession(newSession);
        newSession.connect(userProfile, activeTenantConfig);
    } else {
        session?.disconnect();
        setSession(null);
        setStatus(LiveConnectionState.Disconnected);
        setVolume(0);
    }
  }, [isOpen, userProfile, activeTenantConfig, onTranscriptReceived]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono">
      <div className="relative w-full max-w-sm aspect-[3/4] bg-[#020617] border border-cyan-500/30 rounded-[3rem] shadow-[0_0_80px_rgba(8,145,178,0.2)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
             <div className="flex flex-col"><span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">156.625 MHz</span><span className="text-lg font-black text-white">VHF CH {channel}</span></div>
        </div>

        <div className="flex-1 flex items-center justify-center relative z-10">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 relative shadow-2xl ${status === LiveConnectionState.Connected ? 'bg-cyan-900 border-2 border-cyan-400' : 'bg-zinc-900 border-2 border-zinc-800'}`} style={{ transform: `scale(${1 + volume/150})` }}>
                <Mic size={40} className={status === LiveConnectionState.Connected ? 'text-white' : 'text-zinc-600'} />
                {status === LiveConnectionState.Connected && <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping"></div>}
            </div>
            <div className="absolute mt-48 text-[10px] font-bold tracking-widest text-cyan-500 uppercase animate-pulse">{status === LiveConnectionState.Connected ? 'Live Transmitting' : 'Connecting...'}</div>
        </div>

        <div className="p-8 pb-10 z-20">
            <div className="flex justify-between items-center text-[9px] text-zinc-600 mb-6 font-bold uppercase">
                <div className="flex items-center gap-1"><Signal size={10}/> -42dBm</div>
                <div className="flex items-center gap-1"><Zap size={10}/> 12.4V</div>
            </div>
            <button onClick={onClose} className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl transition-all shadow-lg active:scale-95">
                <PhoneOff size={20} /><span className="text-xs font-black uppercase tracking-widest">End Session</span>
            </button>
        </div>
      </div>
    </div>
  );
};
