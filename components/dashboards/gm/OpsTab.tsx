
import React from 'react';
import { Anchor, DollarSign, Radio, Navigation, Ship, Clock, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { RegistryEntry, Tender, VhfLog, AisTarget } from '../../../types';
import { getCurrentMaritimeTime } from '../../../services/utils';
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
    <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
          {/* 1. HUD ROW (Flat KPIs) */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-white/5 pb-6 pt-2 transition-colors">
            <div className="flex items-center gap-6">
                <div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-bold tracking-widest mb-1 flex items-center gap-2">
                        <Anchor size={12} /> Occupancy
                    </div>
                    <div className="text-3xl font-black text-slate-800 dark:text-zinc-100 leading-none">
                        {vesselsInPort} <span className="text-lg font-medium text-slate-400 dark:text-zinc-500">/ 600</span>
                    </div>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-white/10"></div>
                <div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-bold tracking-widest mb-1 flex items-center gap-2">
                        <Navigation size={12} /> Radar Targets
                    </div>
                    <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
                        {aisTargets.length}
                    </div>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-white/10"></div>
                <div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-bold tracking-widest mb-1 flex items-center gap-2">
                        <DollarSign size={12} /> Yield (Est)
                    </div>
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                        €{(vesselsInPort * 1.5 * 100 / 1000).toFixed(1)}k
                    </div>
                </div>
            </div>

            <div className="text-right bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-lg shadow-sm dark:shadow-none">
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-bold tracking-widest flex items-center justify-end gap-2">
                    <Clock size={12} /> Maritime Time (UTC)
                </div>
                <div className="text-xl font-mono font-bold text-amber-600 dark:text-amber-500">
                    {getCurrentMaritimeTime().split(' ')[0]}
                </div>
            </div>
          </div>

          {/* 2. DIGITAL TWIN (Hero Section) */}
          <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-2">
                      <Navigation size={16} className="text-sky-600 dark:text-sky-400" /> Live Sector Map
                  </h3>
                  <div className="flex gap-4 text-[10px] font-bold uppercase">
                      <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Occupied</span>
                      <span className="flex items-center gap-2 text-red-600 dark:text-red-400"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Breach</span>
                  </div>
              </div>
              <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm bg-slate-100 dark:bg-black/40 transition-colors">
                  <LiveMap />
              </div>
          </div>

          {/* 3. INFO STREAM (Flat Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-slate-200 dark:border-white/5 pt-8">
              
              {/* COL 1: BREACH & FINANCE */}
              <div className="space-y-6">
                  {/* Breach Section */}
                  <div>
                      <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Target size={14} /> Active Alerts
                      </h3>
                      <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm transition-colors">
                          <BreachRadar />
                      </div>
                  </div>

                  {/* Finance Section */}
                  <div>
                      <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <TrendingUp size={14} /> Cash Flow Stream
                      </h3>
                      <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm transition-colors">
                          <FinanceWidget />
                      </div>
                  </div>
              </div>

              {/* COL 2: FLEET STATUS */}
              <div>
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-2">
                          <Ship size={14} /> Asset Status
                      </h3>
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 px-2 py-0.5 rounded font-bold border border-amber-200 dark:border-amber-500/20">{tenders.length} Units</span>
                  </div>
                  
                  <div className="space-y-3">
                      {tenders.map((tender) => (
                          <div key={tender.id} className="group flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:border-amber-400 dark:hover:border-amber-500/50 transition-colors shadow-sm">
                              <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-full ${tender.status === 'Busy' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>
                                      <Ship size={16} />
                                  </div>
                                  <div>
                                      <div className="font-bold text-sm text-slate-800 dark:text-zinc-200">{tender.name}</div>
                                      <div className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase">{tender.status}</div>
                                  </div>
                              </div>
                              {tender.status === 'Busy' && (
                                  <div className="text-right">
                                      <div className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase">Mission</div>
                                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{tender.assignment}</div>
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>

              {/* COL 3: VHF FEED */}
              <div>
                  <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Radio size={14} /> Live Comms (CH 72)
                  </h3>
                  {/* UPDATED: White background in day mode with distinct borders and text colors */}
                  <div className="bg-white dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/10 p-4 font-mono text-xs h-full min-h-[400px] flex flex-col shadow-sm transition-colors">
                      <div className="flex-1 space-y-4">
                          {vhfLogs.length === 0 ? (
                              <div className="text-slate-400 dark:text-zinc-600 text-center italic mt-10">Channel Silent...</div>
                          ) : (
                              vhfLogs.slice().reverse().map((log, idx) => (
                                  <div key={idx} className="border-l-2 border-slate-200 dark:border-zinc-800 pl-3">
                                      <div className="flex justify-between items-baseline mb-1">
                                          <span className={`font-bold ${log.speaker === 'VESSEL' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                              {log.speaker === 'VESSEL' ? 'UNKNOWN VESSEL' : 'WIM CONTROL'}
                                          </span>
                                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{log.timestamp}</span>
                                      </div>
                                      <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">{log.message}</p>
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
