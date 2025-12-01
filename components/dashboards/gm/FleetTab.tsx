
import React from 'react';
import { Ship } from 'lucide-react';
import { Tender } from '../../../types';

interface FleetTabProps {
  tenders: Tender[];
}

export const FleetTab: React.FC<FleetTabProps> = ({ tenders }) => {
  return (
    <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10 animate-in fade-in duration-300 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-6 uppercase tracking-widest flex items-center gap-2">
        <Ship size={14} className="text-indigo-500" /> Fleet Status (Tenders)
      </h3>
      <div className="space-y-3">
        {tenders.map((tender) => {
          const statusColor = tender.status === 'Idle' ? 'bg-emerald-500' : tender.status === 'Busy' ? 'bg-amber-500' : 'bg-red-500';
          return (
            <div key={tender.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-black/20 rounded-lg border border-slate-200 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${statusColor} shadow-sm`} />
                <div>
                  <span className="font-mono font-bold text-sm text-slate-800 dark:text-zinc-200 block">{tender.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase tracking-wider">{tender.status}</span>
                </div>
              </div>
              {tender.status === 'Busy' && tender.assignment && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase">Assigned To</span>
                  <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">{tender.assignment}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
