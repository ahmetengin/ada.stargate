
import React from 'react';
import { Anchor, Calculator, ArrowRight } from 'lucide-react';

interface BerthsTabProps {
  berthAllocation: any;
}

export const BerthsTab: React.FC<BerthsTabProps> = ({ berthAllocation }) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header HUD */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 text-white border border-zinc-800 shadow-lg">
        <div>
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <Anchor size={14} /> Harbormaster Control
            </h3>
            <div className="text-[10px] text-zinc-500 font-mono mt-1">YIELD MANAGEMENT SYSTEM V4.6</div>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase text-emerald-500">Dynamic Pricing Active</span>
        </div>
      </div>

      {/* Analysis Panel */}
      {berthAllocation ? (
        <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-[#0a0f18] p-6 shadow-[0_0_30px_rgba(79,70,229,0.1)]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calculator size={120} className="text-indigo-500" />
            </div>

            <div className="relative z-10">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                    Inbound Vessel Analysis
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Vessel Info */}
                    <div className="flex-1">
                        <div className="text-2xl font-black text-white mb-1">S/Y Phisedelia</div>
                        <div className="text-xs font-mono text-zinc-400">VO65 Racing Yacht (ex-Mapfre)</div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="bg-white/5 p-2 rounded border border-white/5">
                                <div className="text-[9px] text-zinc-500 uppercase">Length</div>
                                <div className="text-sm font-mono font-bold text-indigo-300">20.4m</div>
                            </div>
                            <div className="bg-white/5 p-2 rounded border border-white/5">
                                <div className="text-[9px] text-zinc-500 uppercase">Beam</div>
                                <div className="text-sm font-mono font-bold text-indigo-300">5.6m</div>
                            </div>
                        </div>
                    </div>

                    {/* Arrow Divider */}
                    <div className="hidden md:flex items-center justify-center text-zinc-600">
                        <ArrowRight size={24} />
                    </div>

                    {/* Allocation Result */}
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-[10px] text-zinc-500 uppercase font-bold">Optimal Assignment</div>
                            <div className="text-[10px] bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">CONFIRMED</div>
                        </div>
                        <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                            {berthAllocation.berth}
                        </div>
                        <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded text-xs text-indigo-300 italic">
                            "{berthAllocation.reasoning}"
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex-1 text-right border-l border-white/5 pl-8">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Dynamic Rate</div>
                        <div className="text-4xl font-black text-white">€{berthAllocation.priceQuote}</div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-1">PER NIGHT (HIGH SEASON)</div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-zinc-700 rounded-xl text-zinc-500 text-xs font-mono">
            Waiting for vessel telemetry...
        </div>
      )}
    </div>
  );
};
