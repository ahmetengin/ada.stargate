
import React from 'react';
import { Flag, Microscope, ShieldCheck, Recycle, Droplets, Waves, CheckCircle2 } from 'lucide-react';
import { wimMasterData } from '../../../services/wimMasterData';

interface FacilityTabProps {
  blueFlagStatus: any;
  zeroWasteStats: any;
}

export const FacilityTab: React.FC<FacilityTabProps> = ({ blueFlagStatus, zeroWasteStats }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* BLUE FLAG MONITOR */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-black/60 shadow-lg">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        <div className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                        <Flag size={14} /> Environmental Sensor Array
                    </h3>
                    <div className="text-2xl font-black text-slate-800 dark:text-white">BLUE FLAG PROTOCOL</div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-[0_0_15px_rgba(59,130,246,0.3)] ${blueFlagStatus?.status === 'BLUE' ? 'bg-blue-500 text-white border-blue-400' : 'bg-red-500 text-white border-red-400'}`}>
                    <Waves size={14} className="animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{blueFlagStatus?.status === 'BLUE' ? 'OPTIMAL' : 'CRITICAL'}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/80 dark:bg-black/40 border border-blue-100 dark:border-blue-500/20 p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                        <Microscope size={16} />
                        <span className="text-[10px] font-bold uppercase">E. Coli Levels</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {blueFlagStatus?.data?.e_coli || '--'} <span className="text-xs font-sans font-normal text-slate-400 dark:text-zinc-500">cfu/100ml</span>
                    </div>
                    <div className="h-1 w-full bg-slate-200 dark:bg-zinc-800 mt-3 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[12%]"></div>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-black/40 border border-blue-100 dark:border-blue-500/20 p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-bold uppercase">HSE Compliance</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-slate-800 dark:text-zinc-200">
                        100<span className="text-lg">%</span>
                    </div>
                    <div className="flex gap-1 mt-3">
                        {[1,2,3,4,5].map(i => <div key={i} className="h-1 flex-1 bg-emerald-500 rounded-full"></div>)}
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-black/40 border border-blue-100 dark:border-blue-500/20 p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2 text-sky-600 dark:text-sky-400">
                        <Droplets size={16} />
                        <span className="text-[10px] font-bold uppercase">pH Balance</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-slate-800 dark:text-zinc-200">
                        8.1 <span className="text-xs font-sans font-normal text-slate-400 dark:text-zinc-500">Neutral</span>
                    </div>
                    <div className="text-[9px] text-slate-400 dark:text-zinc-500 mt-3 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Sensor Calibrated
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      {/* ZERO WASTE MONITOR */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/10 dark:to-black/60 shadow-lg">
        <div className="p-6 relative z-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                        <Recycle size={14} /> Sustainability Matrix
                    </h3>
                    <div className="text-2xl font-black text-slate-800 dark:text-white">ZERO WASTE OPS</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Certificate</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{wimMasterData.facility_management?.environmental_compliance.zero_waste_certificate}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white dark:bg-black/40 rounded-xl p-4 border border-emerald-100 dark:border-emerald-500/20">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Recycling Rate</span>
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-500">{zeroWasteStats?.recyclingRate || 45}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${zeroWasteStats?.recyclingRate || 45}%` }}></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-black/40 rounded-xl p-4 border border-emerald-100 dark:border-emerald-500/20">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Next Audit</span>
                        <span className="text-xl font-mono font-bold text-slate-800 dark:text-zinc-200">{zeroWasteStats?.nextAudit || '2025-12-15'}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 dark:text-zinc-500 mt-1">Ministry of Environment</div>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};
