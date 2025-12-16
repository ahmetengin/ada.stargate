import React, { useEffect, useState } from 'react';
import { X, Mic, Radio, AlertTriangle, Power, RefreshCw, Activity, Signal } from 'lucide-react';
import { LiveSession } from '../../services/liveService';
import { LiveConnectionState, UserProfile, TenantConfig } from '../../types';
import { formatCoordinate } from '../../services/utils';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  activeTenantConfig: TenantConfig;
  onTranscriptReceived: (userText: string, modelText: string) => void;
  channel: string;
}

// Mocking the vhfinfo library logic for immediate UI rendering without build dependency issues in preview
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
  const [showProtocol, setShowProtocol] = useState(false);

  // Get coordinates dynamically from activeTenantConfig
  const lat = activeTenantConfig.masterData?.identity?.location?.coordinates?.lat || 0;
  const lng = activeTenantConfig.masterData?.identity?.location?.coordinates?.lng || 0;

  const formattedLat = formatCoordinate(lat, 'lat');
  const formattedLng = formatCoordinate(lng, 'lng');
  const displayCoordinates = `${formattedLat} / ${formattedLng}`;
  
  const vhfInfo = getVhfDetails(channel);

  useEffect(() => {
    if (isOpen && status === LiveConnectionState.Disconnected) {
      connect();
    }

    return () => {
      // Cleanup handled by disconnect button for now, but safety here
    };
  }, [isOpen]);

  const connect = async () => {
      const newSession = new LiveSession();
      
      newSession.onStatusChange = (s) => {
        setStatus(s as LiveConnectionState);
      };
      
      newSession.onAudioLevel = (level) => {
        // Smooth the level for visualization
        setAudioLevel(prev => prev * 0.8 + level * 0.2);
      };

      newSession.onTurnComplete = (userText, modelText) => {
          onTranscriptReceived(userText, modelText);
      };

      setSession(newSession);
      // Pass userProfile AND tenantConfig to connect
      newSession.connect(userProfile, activeTenantConfig);
  };

  const handleDisconnect = async () => {
    if (session) {
      await session.disconnect();
    }
    onClose();
    setStatus(LiveConnectionState.Disconnected);
    setSession(null);
  };

  const handleRetry = async () => {
      if (session) await session.disconnect();
      setStatus(LiveConnectionState.Connecting); // Set to connecting immediately for UI feedback
      setTimeout(() => connect(), 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-zinc-900 border-2 border-zinc-700 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* LCD Display Effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,6px_100%]"></div>

        {/* Header / Radio Brand */}
        <div className="bg-zinc-800 p-4 flex justify-between items-center border-b border-zinc-700 relative z-10">
          <div className="flex items-center gap-2">
            <Radio className="text-indigo-500" />
            <span className="font-mono font-bold tracking-widest text-zinc-200">ADA VHF</span>
          </div>
          <div className="flex items-center gap-3">
             {status === LiveConnectionState.Connected && (
                <div className="flex items-center gap-1.5 text-red-500 animate-pulse">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-[10px] font-mono font-bold">REC</span>
                </div>
              )}
             <div className={`w-2 h-2 rounded-full ${status === LiveConnectionState.Connected ? 'bg-green-500 animate-pulse' : status === LiveConnectionState.Error ? 'bg-red-500' : 'bg-amber-500'}`} />
             <span className="text-[10px] font-mono uppercase text-zinc-500">{status}</span>
          </div>
        </div>

        {/* Main Display Area */}
        <div className="p-8 flex flex-col items-center justify-center min-h-[320px] relative z-10">
           
           {/* Channel Indicator */}
           <div className="mb-6 text-center w-full">
             <div className="flex justify-between items-end border-b border-zinc-700 pb-2 mb-4">
                 <div className="text-left">
                     <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Network</span>
                     <span className="text-xs font-mono text-zinc-300 uppercase">{activeTenantConfig.masterData?.identity?.code || 'UNKNOWN'}</span>
                 </div>
                 <div className="text-right">
                     <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Frequency</span>
                     <span className="text-xs font-mono text-emerald-500">{vhfInfo.freq} MHz</span>
                 </div>
             </div>
             
             {/* Coordinates */}
             <div className="text-xs font-mono text-zinc-500 mb-4">{displayCoordinates}</div>
             
             {/* Big Channel Number */}
             <div className="text-7xl font-mono font-bold text-indigo-500 tracking-tighter flex items-center justify-center gap-4 text-shadow-glow">
               {channel === 'SCAN' ? 'SCN' : channel} 
               <div className="flex flex-col items-start">
                   <span className="text-base text-zinc-400 font-bold uppercase leading-none">{vhfInfo.type}</span>
                   <span className="text-[10px] text-zinc-600 uppercase max-w-[80px] leading-tight mt-1">{vhfInfo.desc}</span>
               </div>
             </div>
           </div>

           {/* Visualizer Circle / Error State */}
           <div className="relative w-32 h-32 flex items-center justify-center mb-4">
             {status === LiveConnectionState.Error ? (
                 <div className="flex flex-col items-center justify-center text-red-500 animate-pulse">
                     <AlertTriangle size={48} />
                     <span className="text-[10px] font-bold mt-2 uppercase tracking-widest text-center">Network Error<br/>Link Lost</span>
                 </div>
             ) : (
                 <>
                    {/* Outer Rings - Simulated RF Emission */}
                    <div className={`absolute inset-0 rounded-full border border-indigo-500/30 transition-all duration-75`} 
                        style={{ transform: `scale(${1 + audioLevel * 1.5})`, opacity: 0.6 - audioLevel }}></div>
                    <div className={`absolute inset-0 rounded-full border border-indigo-400/20 transition-all duration-100 delay-75`} 
                        style={{ transform: `scale(${1 + audioLevel * 2.5})`, opacity: 0.4 - audioLevel }}></div>
                    
                    {/* Inner Core */}
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-transform duration-75 ${status === LiveConnectionState.Connected ? 'scale-100' : 'scale-90 grayscale'}`}>
                        {status === LiveConnectionState.Connected ? (
                            <Mic className="text-white w-8 h-8" />
                        ) : (
                            <Activity className="text-white/50 w-8 h-8 animate-spin-slow" />
                        )}
                    </div>
                 </>
             )}
           </div>

           {/* Status Text */}
           <div className="font-mono text-sm text-zinc-400 text-center h-6 flex items-center justify-center gap-2">
             {status === LiveConnectionState.Connecting && "ESTABLISHING SECURE LINK..."}
             {status === LiveConnectionState.Connected && (
                 <>
                    <Signal size={14} className={audioLevel > 0.05 ? "text-emerald-500" : "text-zinc-600"} />
                    {audioLevel > 0.05 ? "TRANSMITTING" : "SQUELCH OPEN"}
                 </>
             )}
             {status === LiveConnectionState.Error && <span className="text-red-500 font-bold">SIGNAL LOST</span>}
           </div>
            
           {/* Protocol Instructions */}
           {showProtocol && (
                <div className="mt-4 w-full text-left font-mono text-xs text-zinc-400 bg-zinc-800/50 p-4 rounded-lg animate-in fade-in duration-300 border border-zinc-700/50">
                    <h4 className="font-bold text-indigo-400 mb-2 uppercase tracking-widest">VHF Protocol (IMO SMCP)</h4>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-300">
                        <li><strong>Ch {channel}:</strong> {vhfInfo.desc}</li>
                        <li><strong>Freq:</strong> {vhfInfo.freq} MHz ({vhfInfo.type})</li>
                        <li>Identify station called 3 times.</li>
                        <li>Use "Over" to exchange.</li>
                    </ul>
                </div>
            )}
        </div>

        {/* Controls */}
        <div className="bg-zinc-800 p-4 border-t border-zinc-700 flex flex-col items-center justify-center relative z-10">
          <div className="mb-4 text-center">
            <button
                onClick={() => setShowProtocol(!showProtocol)}
                className="text-xs font-mono text-zinc-500 hover:text-indigo-400 transition-colors"
            >
                {showProtocol ? '[ Hide Technical Data ]' : '[ Show Technical Data ]'}
            </button>
          </div>
          
          {status === LiveConnectionState.Error ? (
              <button 
                onClick={handleRetry}
                className="group flex items-center gap-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 text-amber-500 px-8 py-3 rounded-full transition-all font-mono uppercase font-bold tracking-wider hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse"
              >
                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                RE-ESTABLISH
              </button>
          ) : (
              <button 
                onClick={handleDisconnect}
                className="group flex items-center gap-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-500 px-8 py-3 rounded-full transition-all font-mono uppercase font-bold tracking-wider hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                <Power size={18} className="group-hover:scale-110 transition-transform" />
                POWER OFF
              </button>
          )}
        </div>

      </div>
    </div>
  );
};