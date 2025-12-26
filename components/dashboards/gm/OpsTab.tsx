
import React, { useState, useEffect } from 'react';
import { Target, Ship, Cpu, ShieldAlert, Radio, AlertTriangle, Eye } from 'lucide-react';
import { RegistryEntry, Tender, AisTarget, SecurityAlert } from '../../../types';
import { LiveMap } from './LiveMap';
import { BreachRadar } from './BreachRadar';
import { TelemetryTimeline } from './TelemetryTimeline';
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
    <div className="h-full w-full flex">
        {/* MAIN VISUALIZATION AREA */}
        <div className="flex-1 relative overflow-hidden bg-[#020617]">
            
            {/* 1. MAP LAYER (Full Coverage) */}
            <div className={`absolute inset-0 z-0 opacity-60 transition-all duration-500 ${activeAlerts.length > 0 ? 'scale-105' : 'scale-100'}`}>
                <LiveMap />
            </div>

            {/* 2. ALERT OVERLAY (Conditional) */}
            {activeAlerts.length > 0 && (
                <div className="absolute top-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="bg-red-500/10 border-2 border-red-500 backdrop-blur-md rounded-xl p-4 flex items-center justify-between shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-600 rounded-full animate-pulse">
                                <ShieldAlert size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    SECURITY BREACH DETECTED
                                    <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded border border-red-400">CRITICAL</span>
                                </h2>
                                <p className="text-red-200 font-mono text-sm mt-1">
                                    {activeAlerts[0].message}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                             <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg uppercase text-xs tracking-wider flex items-center gap-2 transition-colors">
                                 <Eye size={14} /> View Cam
                             </button>
                             <button 
                                onClick={() => dismissAlert(activeAlerts[0].id)}
                                className="px-4 py-2 bg-black/40 hover:bg-black/60 text-zinc-400 hover:text-white font-bold rounded-lg uppercase text-xs tracking-wider border border-white/10 transition-colors"
                             >
                                 Dismiss
                             </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. HUD OVERLAYS */}
            <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
                
                {/* Top Stats */}
                <div className="flex justify-between items-start mt-16 lg:mt-0">
                    <div className="glass-panel rounded-lg p-2 flex items-center gap-4 animate-in slide-in-from-left duration-700 pointer-events-auto">
                        <div className="text-[10px] font-mono text-cyan-400 px-2 border-r border-white/10">LIVE FEED</div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold text-white tracking-widest">RECORDING</span>
                        </div>
                    </div>

                    {/* NAVTEX ALERTS MINI-HUD */}
                    <div className="flex flex-col gap-2 pointer-events-auto">
                        {navtexAlerts.map(alert => (
                            <div key={alert.id} className="glass-panel bg-amber-950/40 border-amber-500/30 rounded-lg p-2 flex items-center gap-3 animate-in slide-in-from-right duration-500">
                                <div className="text-amber-500 animate-pulse"><Radio size={14} /></div>
                                <div>
                                    <div className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">NAVTEX {alert.id} ({alert.type})</div>
                                    <div className="text-[9px] font-mono text-amber-200/70">{alert.sector} • {alert.coord}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Panels */}
                <div className="grid grid-cols-12 gap-6 items-end pointer-events-auto">
                    
                    {/* RADAR WIDGET */}
                    <div className="col-span-12 lg:col-span-4">
                        <div className={`glass-panel rounded-xl p-4 relative overflow-hidden group transition-all duration-500 ${activeAlerts.length > 0 ? 'border-red-500/50 bg-red-900/10' : ''}`}>
                            <div className={`absolute top-0 right-0 p-2 opacity-20 transition-colors ${activeAlerts.length > 0 ? 'text-red-500 opacity-50' : 'text-red-500 group-hover:opacity-40'}`}><Target size={32}/></div>
                            <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${activeAlerts.length > 0 ? 'text-red-400 animate-pulse' : 'text-red-400'}`}>
                                <Target size={12} /> {activeAlerts.length > 0 ? 'ACTIVE THREAT TRACKING' : 'Threat Detection'}
                            </div>
                            <div className="pl-0">
                                <BreachRadar />
                            </div>
                        </div>
                    </div>

                    {/* FLEET STATUS */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="glass-panel rounded-xl p-4">
                            <div className="flex items-center justify-between text-amber-400 mb-3 pb-2 border-b border-white/5">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Ship size={12} /> Fleet Assets
                                </h3>
                                <span className="text-[9px] font-mono text-slate-500">{tenders.length} ONLINE</span>
                            </div>
                            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                                {tenders.map((tender) => (
                                    <div key={tender.id} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1 h-1 rounded-full ${tender.status === 'Busy' ? 'bg-amber-500 animate-pulse shadow-[0_0_5px_orange]' : 'bg-emerald-500'}`}></div>
                                            <span className="text-xs font-mono font-bold text-slate-300">{tender.name}</span>
                                        </div>
                                        <span className="text-[9px] text-slate-500 font-mono uppercase">
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

        {/* RIGHT SIDEBAR: TELEMETRY TIMELINE */}
        <TelemetryTimeline />
    </div>
  );
};
