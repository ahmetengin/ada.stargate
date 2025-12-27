
import React, { useState, useEffect } from 'react';
import { Users, Store, TrendingUp, BadgeCheck, BarChart3, Globe, ShoppingBag, Utensils, ShieldAlert, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';
import { customerExpert } from '../../../services/agents/customerAgent';
import { marinaExpert } from '../../../services/agents/marinaAgent';

// --- HR TAB ---
export const HRTab: React.FC<{ hrData: any }> = ({ hrData }) => {
  if (!hrData) return <div className="p-4 text-xs font-mono text-zinc-500">Connecting to Kronos DB...</div>;
  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#020617] p-6 animate-in fade-in duration-300">
      <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800">
        <h3 className="text-xs font-black text-zinc-200 mb-6 uppercase tracking-widest flex items-center gap-2">
            <Users size={14} className="text-indigo-500" /> Personnel Manifest
        </h3>
        <div className="space-y-2">
            {hrData.schedule.map((staff: any) => (
            <div key={staff.name} className="flex justify-between items-center p-3 bg-zinc-900/80 rounded border border-zinc-800 hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${staff.status === 'ON_DUTY' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                    <div>
                        <span className="font-bold text-sm text-zinc-200 block">{staff.name}</span>
                        <span className="text-[10px] text-zinc-500 uppercase">{hrData.department} • {staff.shift}</span>
                    </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-1 rounded border ${
                    staff.status === 'ON_DUTY' 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                }`}>
                    {staff.status.replace('_', ' ')}
                </span>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// --- CUSTOMER INTELLIGENCE TAB (ATS ENGINE) ---
export const CustomerTab: React.FC = () => {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [expandedProfile, setExpandedProfile] = useState<string | null>(null);

    useEffect(() => {
        const loadProfiles = async () => {
            const vessels = marinaExpert.getAllFleetVessels();
            const analyzed = await Promise.all(vessels.map(async (v) => {
                const risk = await customerExpert.evaluateCustomerRisk(v.name, () => {});
                return { ...v, riskProfile: risk };
            }));
            setProfiles(analyzed);
        };
        loadProfiles();
    }, []);

    const getSegmentColor = (segment: string) => {
        switch(segment) {
            case 'WHALE': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
            case 'PLATINUM': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
            case 'STANDARD': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'RISKY': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'BLACKLISTED': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#020617] p-6 animate-in fade-in duration-300">
            <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-xs font-black text-zinc-200 uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert size={14} className="text-blue-500" /> Ada Trust Score (ATS) Engine
                    </h3>
                    <div className="text-[10px] text-zinc-500">
                        Live Behavioral Grading
                    </div>
                </div>

                <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                    {profiles.map((p) => (
                        <div key={p.name} className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 hover:bg-zinc-800/80 transition-all shadow-sm">
                            <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpandedProfile(expandedProfile === p.name ? null : p.name)}>
                                <div>
                                    <div className="font-bold text-sm text-zinc-200 flex items-center gap-2">
                                        {p.name}
                                        {expandedProfile === p.name ? <ArrowUpRight size={14} className="text-zinc-400"/> : <ArrowDownRight size={14} className="text-zinc-400"/>}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">Owner: {p.ownerName} | IMO: {p.imo}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`px-2 py-1 rounded border text-[10px] font-bold uppercase inline-block mb-1 ${getSegmentColor(p.riskProfile?.segment)}`}>
                                        {p.riskProfile?.segment}
                                    </div>
                                    <div className="text-xs font-mono font-black text-zinc-300">
                                        SCORE: {p.riskProfile?.totalScore}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Score Bar */}
                            <div className="mt-3 flex items-center gap-3">
                                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden relative">
                                    {/* Zone Markers */}
                                    <div className="absolute left-[30%] top-0 bottom-0 w-px bg-white/20"></div>
                                    <div className="absolute left-[50%] top-0 bottom-0 w-px bg-white/20"></div>
                                    <div className="absolute left-[75%] top-0 bottom-0 w-px bg-white/20"></div>
                                    
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${
                                            p.riskProfile?.totalScore < 300 ? 'bg-red-500' : 
                                            p.riskProfile?.totalScore < 500 ? 'bg-orange-500' :
                                            p.riskProfile?.totalScore < 750 ? 'bg-emerald-500' :
                                            p.riskProfile?.totalScore < 900 ? 'bg-indigo-500' : 'bg-purple-500'
                                        }`} 
                                        style={{ width: `${(p.riskProfile?.totalScore / 1000) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Breakdown Grid */}
                            <div className="grid grid-cols-4 gap-2 mt-4 text-[9px] text-zinc-500 uppercase font-bold text-center">
                                {[
                                    { l: 'Finance', v: p.riskProfile?.breakdown.financial, max: 400 },
                                    { l: 'Ops', v: p.riskProfile?.breakdown.operational, max: 300 },
                                    { l: 'Behavior', v: p.riskProfile?.breakdown.behavioral, max: 200 },
                                    { l: 'Loyalty', v: p.riskProfile?.breakdown.loyalty, max: 100 }
                                ].map((item, i) => (
                                    <div key={i} className="bg-black/20 p-2 rounded border border-zinc-800 flex flex-col gap-1">
                                        <span className="opacity-70">{item.l}</span>
                                        <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                            <div className="bg-indigo-500 h-full" style={{ width: `${(item.v / item.max) * 100}%` }}></div>
                                        </div>
                                        <span className="text-zinc-300">{item.v}/{item.max}</span>
                                    </div>
                                ))}
                            </div>

                            {/* EXPANDED HISTORY VIEW */}
                            {expandedProfile === p.name && (
                                <div className="mt-4 pt-4 border-t border-zinc-800 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                                        <History size={12} /> Grading History
                                    </h4>
                                    <div className="space-y-2">
                                        {p.riskProfile?.history.length === 0 ? (
                                            <div className="text-[10px] text-zinc-500 italic">No recorded interactions.</div>
                                        ) : (
                                            p.riskProfile?.history.map((evt: any) => (
                                                <div key={evt.id} className="flex justify-between items-center p-2 rounded bg-zinc-900/50 border border-zinc-800/50 text-[10px]">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`font-bold px-1.5 py-0.5 rounded border ${
                                                            evt.delta > 0 
                                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                                            : 'bg-red-500/10 text-red-600 border-red-500/20'
                                                        }`}>
                                                            {evt.delta > 0 ? '+' : ''}{evt.delta}
                                                        </span>
                                                        <div>
                                                            <div className="text-zinc-300 font-bold">{evt.description}</div>
                                                            <div className="text-zinc-500 font-mono">{new Date(evt.date).toLocaleDateString()} • {evt.category}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-zinc-400 font-mono text-[9px]">{evt.action}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- COMMERCIAL TAB (RETAIL & REAL ESTATE) ---
export const CommercialTab: React.FC<{ commercialData: any[] }> = ({ commercialData }) => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#020617] p-6 animate-in fade-in duration-300">
        <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-zinc-200 uppercase tracking-widest flex items-center gap-2">
                    <Store size={14} className="text-purple-500" /> Commercial Estate
                </h3>
                <div className="text-[9px] font-bold bg-purple-500/10 text-purple-500 px-2 py-1 rounded border border-purple-500/20">
                    OCCUPANCY: 98%
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commercialData.map((tenant: any) => (
                <div key={tenant.id} className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 hover:border-purple-500/30 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-800 rounded-lg border border-zinc-700 text-slate-400">
                                {tenant.type === 'F&B' ? <Utensils size={14}/> : <ShoppingBag size={14}/>}
                            </div>
                            <div>
                                <div className="font-bold text-sm text-zinc-200">{tenant.name}</div>
                                <div className="text-[9px] text-zinc-500 uppercase">{tenant.type} • {tenant.location}</div>
                            </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${tenant.status === 'PAID' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 my-3">
                        <div className="bg-zinc-900/50 p-2 rounded border border-zinc-700/50">
                            <span className="text-[9px] text-slate-400 block uppercase">Area</span>
                            <span className="font-mono text-xs font-bold text-zinc-300">{tenant.area} m²</span>
                        </div>
                        <div className="bg-zinc-900/50 p-2 rounded border border-zinc-700/50">
                            <span className="text-[9px] text-slate-400 block uppercase">Rent</span>
                            <span className="font-mono text-xs font-bold text-zinc-300">€{tenant.rent}</span>
                        </div>
                    </div>

                    <div className={`text-center py-1.5 rounded text-[9px] font-bold border flex justify-between px-3 ${
                        tenant.status === 'PAID' 
                        ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20' 
                        : 'bg-red-500/5 text-red-600 border-red-500/20'
                    }`}>
                        <span>LEASE STATUS</span>
                        <span>{tenant.status}</span>
                    </div>
                </div>
                ))}
            </div>
        </div>
    </div>
  );
};

// --- ANALYTICS TAB ---
export const AnalyticsTab: React.FC<{ analyticsData: any }> = ({ analyticsData }) => {
  if (!analyticsData) return <div className="p-4 text-xs font-mono text-zinc-500">Calibrating TabPFN Models...</div>;
  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#020617] p-6 animate-in fade-in duration-300">
        <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800">
            <h3 className="text-xs font-black text-zinc-200 mb-6 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} className="text-sky-500" /> Predictive Engine (TabPFN)
            </h3>
            
            <div className="relative overflow-hidden rounded-xl bg-black p-6 text-white text-center border border-white/10">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
                
                <div className="relative z-10">
                    <div className="text-[10px] text-sky-400 uppercase font-bold tracking-widest mb-2">Occupancy Forecast ({analyticsData.period})</div>
                    <div className="text-6xl font-black text-white tracking-tighter mb-2">
                        {analyticsData.prediction}<span className="text-2xl text-zinc-500">%</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[10px] border border-white/10">
                        <BarChart3 size={10} className="text-sky-400" />
                        Confidence Level: <span className="font-bold text-sky-400">{analyticsData.confidence}%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- BOOKINGS TAB ---
export const BookingsTab: React.FC<{ bookings: any[] }> = ({ bookings }) => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#020617] p-6 animate-in fade-in duration-300">
        <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800">
            <h3 className="text-xs font-black text-zinc-200 mb-6 uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} className="text-purple-500" /> Incoming Transmissions
            </h3>
            <div className="space-y-3">
                {bookings.length === 0 ? (
                <div className="text-xs text-zinc-500 italic text-center p-8 border border-dashed border-zinc-800 rounded-lg">No active signals detected on booking channel.</div>
                ) : (
                bookings.map((booking, i) => (
                    <div key={i} className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-xs font-bold text-white block">S/Y Wind Chaser</span>
                            <span className="text-[10px] text-zinc-500 font-mono">REQ: June 10 - June 15</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 font-mono">€{booking.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[10px] bg-black/40 p-2 rounded border border-zinc-700/50">
                        <BadgeCheck size={12} className="text-purple-500" />
                        <span className="text-zinc-400">Auto-Assigned:</span>
                        <strong className="text-zinc-200">{booking.berth}</strong>
                        <span className="text-zinc-600 truncate ml-1 opacity-70">({booking.reasoning})</span>
                    </div>
                    </div>
                ))
                )}
            </div>
        </div>
    </div>
  );
};
