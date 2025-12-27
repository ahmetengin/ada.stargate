
import React, { useState, useEffect } from 'react';
import { Target, Ship, ShieldAlert, Radio, Eye } from 'lucide-react';
import { RegistryEntry, Tender, AisTarget, SecurityAlert } from '../../../types';
import { LiveMap } from './LiveMap';
import { BreachRadar } from './BreachRadar';
import { securityExpert } from '../../../services/agents/securityAgent';

interface OpsTabProps {
  vesselsInPort: number;
  registry: RegistryEntry[];
  criticalLogs: any[];
  tenders: Tender[];
  aisTargets?: AisTarget[];
}

export const OpsTab: React.FC<OpsTabProps> = ({ vesselsInPort, registry, criticalLogs, tenders, aisTargets = [] }) => {
  const [activeAlerts, setActiveAlerts] = useState<SecurityAlert[]>([]);
  
  // Mock Navtex Data
  const navtexAlerts = [
      { id: 'NAV-382', type: 'GUNNERY', sector: 'AEGEAN', coord: '38°45N - 025°21E', status: 'ACTIVE' },
      { id: 'NAV-385', type: 'SAR OPS', sector: 'MARMARA', coord: '40°55N - 028°50E', status: 'ACTIVE' }
  ];

  // SIMULATION: Check for threats shortly after mount
  useEffect(() => {
      const interval = setInterval(async () => {
          // In a real app, this would come from a websocket or shared state
          const alerts = await securityExpert.monitorRealTimeThreats([], () => {});
          if (alerts.length > 0) {
              setActiveAlerts(prev => {
                  // prevent duplicate alert spam in this demo
                  if (prev.length > 0) return prev;
                  return alerts;
              });
          }
      }, 8000); // Check every 8 seconds
      return () => clearInterval(interval);
  }, []);

  const dismissAlert = (id: string) => {
      setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="h-full w-full flex overflow-hidden">
        {/* MAIN VISUALIZATION AREA */}
        <div className="flex-1 relative bg-[#020617] h-full flex flex-col">
            
            {/* 1. MAP LAYER (Full Coverage) */}
            <div className={`absolute inset-0 z-0 opacity-60 transition-all duration-500 ${activeAlerts.length > 0 ? 'scale-105' : 'scale-100'}`}>
                <LiveMap />
            </div>

            {/* 2. ALERT OVERLAY (Conditional - High Z-Index) */}
            {activeAlerts.length > 0 && (
                <div className="absolute top-4 left-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="bg-red-950/90 border-l-4 border-red-500 backdrop-blur-md rounded-r-xl p-4 flex items-center justify-between shadow-[0_0_50px_rgba(239,68,68,0.2)] max-w-4xl mx-auto">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-600/20 rounded-full animate-pulse border border-red-500/50">
                                <ShieldAlert size={24} className="text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    SECURITY BREACH DETECTED
                                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded border border-red-400">CRITICAL</span>
                                </h2>
                                <p className="text-red-200 font-mono text-xs mt-1">
                                    {activeAlerts[0].message}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded uppercase text-[10px] tracking-wider flex items-center gap-2 transition-colors">
                                 <Eye size={12} /> View Cam
                             </button>
                             <button 
                                onClick={() => dismissAlert(activeAlerts[0].id)}
                                className="px-3 py-1.5 bg-black/40 hover:bg-black/60 text-zinc-400 hover:text-white font-bold rounded uppercase text-[10px] tracking-wider border border-white/10 transition-colors"
                             >
                                 Dismiss
                             </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. HUD OVERLAYS (Structured Layout) */}
            <div className="absolute inset-0 z-10 pointer-events-none p-4 flex flex-col justify-between">
                
                {/* TOP BAR HUD */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <div className="glass-panel bg-black/60 backdrop-blur-md rounded-lg p-1.5 flex items-center gap-3 border border-white/10">
                        <div className="text-[10px] font-mono text-cyan-400 px-2 border-r border-white/10 font-bold">LIVE FEED</div>
                        <div className="flex items-center gap-2 pr-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-white tracking-widest">RECORDING</span>
                        </div>
                    </div>

                    {/* NAVTEX ALERTS MINI-HUD */}
                    <div className="flex flex-col gap-2 items-end">
                        {navtexAlerts.map(alert => (
                            <div key={alert.id} className="glass-panel bg-amber-950/60 border-amber-500/30 backdrop-blur-md rounded-lg p-2 flex items-center gap-3 animate-in slide-in-from-right duration-500 max-w-xs cursor-pointer hover:bg-amber-900/60 transition-colors">
                                <div className="text-amber-500 animate-pulse"><Radio size={14} /></div>
                                <div>
                                    <div className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">NAVTEX {alert.id} ({alert.type})</div>
                                    <div className="text-[9px] font-mono text-amber-200/70">{alert.sector} • {alert.coord}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BOTTOM PANELS HUD */}
                <div className="grid grid-cols-12 gap-4 items-end pointer-events-auto">
                    
                    {/* RADAR WIDGET */}
                    <div className="col-span-12 lg:col-span-4">
                        <div className={`glass-panel bg-[#0a0f18]/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 relative overflow-hidden group transition-all duration-500 ${activeAlerts.length > 0 ? 'border-red-500/50 bg-red-900/20' : ''}`}>
                            <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                                <div className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${activeAlerts.length > 0 ? 'text-red-400 animate-pulse' : 'text-zinc-400'}`}>
                                    <Target size={12} /> {activeAlerts.length > 0 ? 'ACTIVE THREAT TRACKING' : 'Threat Detection'}
                                </div>
                                <div className="text-[9px] font-mono text-zinc-600">RANGE: 20nm</div>
                            </div>
                            <div className="flex justify-center py-1">
                                <BreachRadar />
                            </div>
                        </div>
                    </div>

                    {/* FLEET STATUS (Constrained Height) */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="glass-panel bg-[#0a0f18]/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex flex-col max-h-[220px]">
                            <div className="flex items-center justify-between text-amber-400 mb-2 pb-2 border-b border-white/5 flex-shrink-0">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Ship size={12} /> Fleet Assets
                                </h3>
                                <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">{tenders.length} ONLINE</span>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                                {tenders.map((tender) => (
                                    <div key={tender.id} className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1.5 h-1.5 rounded-full ${tender.status === 'Busy' ? 'bg-amber-500 animate-pulse shadow-[0_0_5px_orange]' : 'bg-emerald-500'}`}></div>
                                            <span className="text-[10px] font-mono font-bold text-slate-300 group-hover:text-white transition-colors">{tender.name}</span>
                                        </div>
                                        <span className="text-[9px] text-slate-500 font-mono uppercase bg-black/20 px-2 py-0.5 rounded">
                                            {tender.status === 'Busy' ? <span className="text-indigo-400">{tender.assignment}</span> : 'STATION'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
};
