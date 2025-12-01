
import React from 'react';
import { Target, Ship, Radio, Cpu } from 'lucide-react';
import { RegistryEntry, Tender, VhfLog, AisTarget } from '../../../types';
import { LiveMap } from './LiveMap';
import { BreachRadar } from './BreachRadar';

interface OpsTabProps {
  vesselsInPort: number;
  registry: RegistryEntry[];
  criticalLogs: any[];
  tenders: Tender[];
  vhfLogs: VhfLog[];
  aisTargets?: AisTarget[];
}

export const OpsTab: React.FC<OpsTabProps> = ({ vesselsInPort, registry, criticalLogs, tenders, vhfLogs, aisTargets = [] }) => {
  
  return (
    <div className="h-full w-full relative overflow-hidden bg-[#020617]">
        
        {/* 1. MAP LAYER (Full Coverage) */}
        <div className="absolute inset-0 z-0 opacity-60">
            <LiveMap />
        </div>

        {/* 2. HUD OVERLAYS */}
        <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
            
            {/* Top Stats */}
            <div className="flex justify-between items-start">
                <div className="glass-panel rounded-lg p-2 flex items-center gap-4 animate-in slide-in-from-left duration-700">
                    <div className="text-[10px] font-mono text-cyan-400 px-2 border-r border-white/10">LIVE FEED</div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-white tracking-widest">RECORDING</span>
                    </div>
                </div>
            </div>

            {/* Bottom Panels */}
            <div className="grid grid-cols-12 gap-6 items-end pointer-events-auto">
                
                {/* RADAR WIDGET */}
                <div className="col-span-12 lg:col-span-3">
                    <div className="glass-panel rounded-xl p-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-20 text-red-500 group-hover:opacity-40 transition-opacity"><Target size={32}/></div>
                        <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Target size={12} /> Threat Detection
                        </div>
                        <div className="pl-0">
                            <BreachRadar />
                        </div>
                    </div>
                </div>

                {/* FLEET STATUS */}
                <div className="col-span-12 lg:col-span-5">
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

                {/* COMMS LOG */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="glass-panel rounded-xl p-4 flex flex-col h-48">
                        <div className="flex items-center justify-between text-cyan-400 mb-2 pb-2 border-b border-white/5">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <Radio size={12} /> Comms / Ch.72
                            </h3>
                            <Cpu size={12} className="opacity-50" />
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 font-mono text-[10px]">
                            {vhfLogs.length === 0 ? (
                                <div className="text-slate-600 italic mt-4 text-center">Spectrum Clear.</div>
                            ) : (
                                vhfLogs.slice().reverse().map((log, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <span className="text-slate-500">{log.timestamp.split(' ')[0]}</span>
                                            <span className={`font-bold ${log.speaker === 'VESSEL' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                                {log.speaker === 'VESSEL' ? 'UNK' : 'HQ'}
                                            </span>
                                        </div>
                                        <div className="text-slate-300 pl-10 border-l border-white/5 ml-3 my-1">
                                            {log.message}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};
