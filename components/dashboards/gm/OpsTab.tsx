
import React from 'react';
import { Target, TrendingUp, Ship, Radio, AlertTriangle } from 'lucide-react';
import { RegistryEntry, Tender, VhfLog, AisTarget } from '../../../types';
import { LiveMap } from './LiveMap';
import { BreachRadar } from './BreachRadar';
import { FinanceWidget } from './FinanceWidget';

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
    <div className="h-full flex flex-col relative">
        
        {/* 1. MAP LAYER (Background) */}
        <div className="absolute inset-0 z-0 opacity-80">
            <LiveMap />
        </div>

        {/* 2. OVERLAY HUD LAYOUT */}
        <div className="relative z-10 h-full flex flex-col justify-between pointer-events-none">
            
            {/* Top Area: Empty for Map Visibility */}
            <div className="flex-1"></div>

            {/* Bottom Area: Data Streams (Glassmorphism) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gradient-to-t from-zinc-50/95 via-zinc-50/80 to-transparent dark:from-black/95 dark:via-black/80 dark:to-transparent pointer-events-auto">
                
                {/* COL 1: RADAR & ALERTS */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                        <Target size={14} className="animate-pulse"/>
                        <h3 className="text-xs font-bold uppercase tracking-widest">Active Threats</h3>
                    </div>
                    {/* No Box, Just Radar */}
                    <div className="pl-2">
                        <BreachRadar />
                    </div>
                </div>

                {/* COL 2: FLEET LIST (Clean Lines) */}
                <div>
                    <div className="flex items-center justify-between text-amber-500 mb-4 border-b border-amber-500/20 pb-1">
                        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Ship size={14} /> Fleet Command
                        </h3>
                        <span className="text-[9px] font-mono">{tenders.length} ASSETS</span>
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {tenders.map((tender) => (
                            <div key={tender.id} className="flex items-center justify-between text-xs group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${tender.status === 'Busy' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                    <span className="text-zinc-700 dark:text-zinc-300 font-mono font-bold group-hover:text-indigo-400 transition-colors">
                                        {tender.name}
                                    </span>
                                </div>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                    {tender.status === 'Busy' ? tender.assignment : 'STATION'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COL 3: COMMS LOG (Terminal Style) */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2 border-b border-zinc-200 dark:border-zinc-800 pb-1">
                        <Radio size={14} />
                        <h3 className="text-xs font-bold uppercase tracking-widest">VHF CH.72</h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto max-h-40 custom-scrollbar space-y-3 font-mono text-[10px]">
                        {vhfLogs.length === 0 ? (
                            <div className="text-zinc-600 italic">No signal detected.</div>
                        ) : (
                            vhfLogs.slice().reverse().map((log, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <span className="text-zinc-500 shrink-0">{log.timestamp.split(' ')[0]}</span>
                                    <div>
                                        <span className={`font-bold ${log.speaker === 'VESSEL' ? 'text-indigo-400' : 'text-emerald-500'}`}>
                                            {log.speaker === 'VESSEL' ? 'UNK' : 'HQ'}:
                                        </span>
                                        <span className="text-zinc-400 ml-2">{log.message}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};
