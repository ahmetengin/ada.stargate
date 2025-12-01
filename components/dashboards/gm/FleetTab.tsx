
import React from 'react';
import { Ship, Navigation, Battery, Signal } from 'lucide-react';
import { Tender } from '../../../types';

interface FleetTabProps {
  tenders: Tender[];
}

export const FleetTab: React.FC<FleetTabProps> = ({ tenders }) => {
  return (
    <div className="p-6 animate-in fade-in duration-500">
      
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-4">
          <div className="col-span-3">Unit ID</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-4">Current Mission</div>
          <div className="col-span-3 text-right">Telemetry</div>
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {tenders.map((tender) => {
          const isBusy = tender.status === 'Busy';
          
          return (
            <div key={tender.id} className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-zinc-100 dark:hover:bg-white/5 rounded transition-colors group border-b border-zinc-100 dark:border-white/5 last:border-0">
              
              {/* ID & Name */}
              <div className="col-span-3 flex items-center gap-3">
                  <div className={`p-1.5 rounded-full ${isBusy ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      <Ship size={14} />
                  </div>
                  <div>
                      <div className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">{tender.name}</div>
                      <div className="text-[9px] text-zinc-500">{tender.id}</div>
                  </div>
              </div>

              {/* Status */}
              <div className="col-span-2">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${
                      isBusy 
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  }`}>
                      <div className={`w-1 h-1 rounded-full ${isBusy ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                      {tender.status}
                  </div>
              </div>

              {/* Mission */}
              <div className="col-span-4 flex items-center gap-2">
                  {isBusy ? (
                      <>
                        <Navigation size={12} className="text-indigo-500" />
                        <span className="text-xs text-indigo-400 font-mono truncate">{tender.assignment}</span>
                      </>
                  ) : (
                      <span className="text-xs text-zinc-600 dark:text-zinc-500 font-mono">Docked at Sector A</span>
                  )}
              </div>

              {/* Telemetry (Mock) */}
              <div className="col-span-3 flex justify-end gap-4 text-zinc-500">
                  <div className="flex items-center gap-1 text-[10px]" title="Battery">
                      <Battery size={12} className={isBusy ? 'text-amber-500' : 'text-emerald-500'} />
                      <span className="font-mono">8{Math.floor(Math.random()*10+80)}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]" title="Signal">
                      <Signal size={12} className="text-emerald-500" />
                      <span className="font-mono">-42dBm</span>
                  </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
