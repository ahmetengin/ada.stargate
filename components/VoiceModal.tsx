
import React, { useEffect, useState } from 'react';
import { X, Mic, Radio, SignalHigh, Waves, Power, AlertTriangle, RefreshCw, Activity, Server, Cloud } from 'lucide-react';
import { LiveSession } from '../services/geminiService';
import { LiveConnectionState, UserProfile } from '../types';
import { wimMasterData } from '../services/wimMasterData';
import { formatCoordinate } from '../services/utils';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onTranscriptReceived: (userText: string, modelText: string) => void;
  channel: string;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose, userProfile, onTranscriptReceived, channel }) => {
  const [status, setStatus] = useState<LiveConnectionState>(LiveConnectionState.Disconnected);
  const [audioLevel, setAudioLevel] = useState(0);
  const [session, setSession] = useState<LiveSession | null>(null);
  const [showProtocol, setShowProtocol] = useState(false);

  // Get coordinates from wimMasterData
  const { lat, lng } = wimMasterData.identity.location.coordinates;
  const displayCoordinates = `${formatCoordinate(lat, 'lat')} / ${formatCoordinate(lng, 'lng')}`;

  // --- AUTO CONNECT (CLOUD ONLY) ---
  useEffect(() => {
    if (isOpen && status === LiveConnectionState.Disconnected) {
      connectCloud();
    }
    return () => {
       // Cleanup handled on disconnect button or modal unmount if managed externally
    };
  }, [isOpen]);

  const connectCloud = async () => {
      const newSession = new LiveSession();
      newSession.onStatusChange = (s) => setStatus(s as LiveConnectionState);
      newSession.onAudioLevel = (level) => setAudioLevel(prev => prev * 0.8 + level * 0.2);
      newSession.onTurnComplete = (userText, modelText) => onTranscriptReceived(userText, modelText);
      setSession(newSession);
      newSession.connect(userProfile);
  };

  const handleDisconnect = async () => {
    if (session) await session.disconnect();
    onClose();
    setStatus(LiveConnectionState.Disconnected);
    setSession(null);
  };

  const getChannelLabel = (ch: string) => {
      if (ch === '16') return 'DISTRESS';
      if (ch === '72') return 'MARINA';
      if (ch === 'SCAN') return 'SCANNING';
      return 'AUX';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-900 border-2 border-zinc-700 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* LCD Display Effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,6px_100%]"></div>

        {/* Header */}
        <div className="bg-zinc-800 p-4 flex justify-between items-center border-b border-zinc-700 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <Radio className="text-indigo-500" />
            <div>
                <span className="font-mono font-bold tracking-widest text-zinc-200 block leading-none">ADA VHF</span>
                <span className="text-[9px] text-zinc-500 font-mono">FREQ: 156.625 MHz</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-900/30 border border-indigo-500/30">
                  <Cloud size={10} className="text-indigo-400" />
                  <span className="text-[9px] font-bold text-indigo-300 uppercase">Cloud Link</span>
              </div>
              <button onClick={handleDisconnect} className="text-zinc-500 hover:text-red-500 transition-colors ml-2">
                  <X size={20} />
              </button>
          </div>
        </div>

        {/* CONTENT AREA (VISUALIZER) */}
        <div className="flex-1 relative z-10 bg-black/20 flex flex-col">
            <div className="p-8 flex flex-col items-center justify-center h-full">
                {/* Channel Info */}
                <div className="mb-8 text-center">
                    <div className="text-6xl font-mono font-bold text-indigo-500 tracking-tighter flex items-center justify-center gap-2 text-shadow-glow">
                    {channel === 'SCAN' ? 'SCAN' : channel} 
                    <span className="text-xl text-zinc-600">{getChannelLabel(channel)}</span>
                    </div>
                    <div className="text-xs font-mono text-zinc-500 mt-2">{displayCoordinates}</div>
                </div>

                {/* Visualizer */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    {status === LiveConnectionState.Error ? (
                        <div className="text-red-500 animate-pulse flex flex-col items-center">
                            <AlertTriangle size={48} />
                            <span className="text-[10px] font-bold mt-2">NO SIGNAL</span>
                        </div>
                    ) : (
                        <>
                            <div className={`absolute inset-0 rounded-full border-2 border-indigo-900 transition-all duration-100`} 
                                style={{ transform: `scale(${1 + audioLevel * 2})`, opacity: 0.5 - audioLevel }}></div>
                            <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)] ${status === LiveConnectionState.Connected ? 'animate-pulse' : 'grayscale opacity-50'}`}>
                                <Mic className="text-white w-8 h-8" />
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-8 font-mono text-sm text-zinc-400">
                    {status === LiveConnectionState.Connecting ? "TUNING FREQUENCY..." : 
                        status === LiveConnectionState.Connected ? "CHANNEL OPEN - TRANSMITTING" : "OFFLINE"}
                </div>
            </div>
        </div>

        {/* Footer Controls */}
        <div className="bg-zinc-800 p-4 border-t border-zinc-700 relative z-10 flex justify-between items-center">
            <button
                onClick={() => setShowProtocol(!showProtocol)}
                className="text-[10px] font-mono text-zinc-500 hover:text-indigo-400 uppercase"
            >
                {showProtocol ? 'Hide Protocol' : 'Show Protocol'}
            </button>
            
            <button 
                onClick={handleDisconnect}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-500 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
            >
                <Power size={14} /> End Transmission
            </button>
        </div>

        {/* Protocol Overlay */}
        {showProtocol && (
            <div className="absolute bottom-16 left-4 right-4 bg-zinc-900/95 border border-zinc-700 p-4 rounded-xl text-xs font-mono text-zinc-400 z-20">
                <h4 className="text-indigo-400 font-bold mb-2">RADIO ETIQUETTE</h4>
                <ul className="list-disc list-inside space-y-1">
                    <li>Identify yourself: "Ada Marina, this is Phisedelia."</li>
                    <li>Keep it brief. Use "Over" to yield.</li>
                    <li>Emergency: "MAYDAY" x3 on Channel 16.</li>
                </ul>
            </div>
        )}

      </div>
    </div>
  );
};
