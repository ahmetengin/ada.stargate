
import React from 'react';
import { Flag, Microscope, ShieldCheck, Recycle, AlertTriangle, Droplets } from 'lucide-react';
import { wimMasterData } from '../../../services/wimMasterData';

interface FacilityTabProps {
  blueFlagStatus: any;
  zeroWasteStats: any;
}

export const FacilityTab: React.FC<FacilityTabProps> = ({ blueFlagStatus, zeroWasteStats }) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-500/30 p-6 rounded-xl relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f610_1px,transparent_1px),linear-gradient(to_bottom,#3b82f610_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <Flag size={14} className={blueFlagStatus?.status === 'BLUE' ? "text-blue-600 dark:text-blue-500 fill-current animate-pulse" : "text-red-500"} />
            BLUE FLAG STATUS
          </div>
          <div className={`text-[9px] font-bold px-3 py-1 rounded-full border shadow-sm ${blueFlagStatus?.status === 'BLUE' ? 'bg-white dark:bg-blue-500 text-blue-600 dark:text-white border-blue-200 dark:border-blue-400' : 'bg-white dark:bg-red-500 text-red-600 dark:text-white border-red-200 dark:border-red-400'}`}>
            {blueFlagStatus?.status === 'BLUE' ? 'FLYING PROUDLY' : 'LOWERED'}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="bg-white/60 dark:bg-black/40 p-4 rounded-lg border border-blue-200 dark:border-blue-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2"><Microscope size={14} className="text-blue-600 dark:text-blue-400" /><span className="text-[10px] text-blue-800 dark:text-blue-300 uppercase font-bold">E. Coli Analysis</span></div>
            <div className="text-3xl font-black text-slate-800 dark:text-white">{blueFlagStatus?.data?.e_coli || '--'} <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal">cfu/100ml</span></div>
          </div>
          <div className="bg-white/60 dark:bg-black/40 p-4 rounded-lg border border-blue-200 dark:border-blue-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2"><ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" /><span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-bold">HSE Compliance</span></div>
            <div className="text-3xl font-black text-slate-800 dark:text-white">100%</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-emerald-900/10 border border-slate-200 dark:border-emerald-500/30 p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Recycle size={14} /> ZERO WASTE</div>
          <div className="bg-emerald-100 dark:bg-emerald-500 text-emerald-700 dark:text-white text-[9px] font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-transparent">{wimMasterData.facility_management?.environmental_compliance.zero_waste_certificate}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-lg border border-slate-200 dark:border-zinc-700">
            <div className="text-xs text-slate-500 dark:text-zinc-500 mb-1">Recycling Rate</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{zeroWasteStats?.recyclingRate || 45}%</div>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-lg border border-slate-200 dark:border-zinc-700">
            <div className="text-xs text-slate-500 dark:text-zinc-500 mb-1">Next Audit</div>
            <div className="text-xl font-bold text-slate-800 dark:text-zinc-200">{zeroWasteStats?.nextAudit || '2025-12-15'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
