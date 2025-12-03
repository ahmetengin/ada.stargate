
import React, { useState, useEffect } from 'react';
import { Users, Store, TrendingUp, BookOpen, Clock, BadgeCheck, BarChart3, Globe, PieChart, ShoppingBag, Utensils, ShieldAlert, Award, AlertTriangle } from 'lucide-react';
import { customerExpert } from '../../../services/agents/customerAgent';
import { marinaExpert } from '../../../services/agents/marinaAgent';
import { CustomerRiskProfile } from '../../../types';

// --- HR TAB ---
export const HRTab: React.FC<{ hrData: any }> = ({ hrData }) => {
  if (!hrData) return <div className="p-4 text-xs font-mono text-zinc-500">Connecting to Kronos DB...</div>;
  return (
    <div className="bg-white dark:bg-zinc-900/30 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 animate-in fade-in duration-300">
      <h3 className="text-xs font-black text-slate-700 dark:text-zinc-200 mb-6 uppercase tracking-widest flex items-center gap-2">
        <Users size={14} className="text-indigo-500" /> Personnel Manifest
      </h3>
      <div className="space-y-2">
        {hrData.schedule.map((staff: any) => (
          <div key={staff.name} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-900/80 rounded border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/30 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${staff.status === 'ON_DUTY' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                <div>
                    <span className="font-bold text-sm text-slate-800 dark:text-zinc-200 block">{staff.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase">{hrData.department} • {staff.shift}</span>
                </div>
            </div>
            <span className={`text-[9px] font-bold px-2 py-1 rounded border ${
                staff.status === 'ON_DUTY' 
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
            }`}>
                {staff.status.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- CUSTOMER INTELLIGENCE TAB (NEW) ---
export const CustomerTab: React.FC = () => {
    const [profiles, setProfiles] = useState<any[]>([]);

    useEffect(() => {
        const loadProfiles = async () => {
            const vessels = marinaExpert.getAllFleetVessels();
            // Here we ask the Customer Agent to interrogate other agents about each vessel
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
            case 'VIP': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'RISKY': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'BLACKLISTED': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900/30 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-slate-700 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert size={14} className="text-blue-500" /> Customer Risk Matrix
                </h3>
                <div className="text-[10px] text-zinc-500">
                    Ada Trust Score (ATS) Analysis
                </div>
            </div>

            <div className="space-y-3">
                {profiles.map((p) => (
                    <div key={p.name} className="p-3 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-bold text-sm text-slate-800 dark:text-zinc-200">{p.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">Owner: {p.ownerName}</div>
                            </div>
                            <div className={`px-2 py-1 rounded border text-[10px] font-bold uppercase ${getSegmentColor(p.riskProfile?.segment)}`}>
                                {p.riskProfile?.segment}
                            </div>
                        </div>
                        
                        {/* Score Bar */}
                        <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${p.riskProfile?.totalScore < 500 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                    style={{ width: `${(p.riskProfile?.totalScore / 1000) * 100}%` }}
                                ></div>
                            </div>
                            <div className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
                                {p.riskProfile?.totalScore}
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="grid grid-cols-3 gap-2 mt-3 text-[9px] text-slate-500 dark:text-zinc-500 uppercase font-bold text-center">
                            <div className="bg-white dark:bg-black/20 p-1 rounded border border-slate-100 dark:border-zinc-800">
                                Finance: <span className={p.riskProfile?.breakdown.financial < 50 ? 'text-red-500' : 'text-emerald-500'}>{p.riskProfile?.breakdown.financial}</span>
                            </div>
                            <div className="bg-white dark:bg-black/20 p-1 rounded border border-slate-100 dark:border-zinc-800">
                                Ops: <span className={p.riskProfile?.breakdown.operational < 50 ? 'text-red-500' : 'text-emerald-500'}>{p.riskProfile?.breakdown.operational}</span>
                            </div>
                            <div className="bg-white dark:bg-black/20 p-1 rounded border border-slate-100 dark:border-zinc-800">
                                Value: <span className="text-purple-500">{p.riskProfile?.breakdown.commercial}</span>
                            </div>
                        </div>

                        {/* Flags */}
                        {p.riskProfile?.flags.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-zinc-800 flex gap-2 flex-wrap">
                                {p.riskProfile.flags.map((flag: string) => (
                                    <span key={flag} className="flex items-center gap-1 text-[9px] text-red-600 bg-red-100 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                                        <AlertTriangle size={8} /> {flag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- COMMERCIAL TAB (RETAIL & REAL ESTATE) ---
export const CommercialTab: React.FC<{ commercialData: any[] }> = ({ commercialData }) => {
  return (
    <div className="bg-white dark:bg-zinc-900/30 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black text-slate-700 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-2">
            <Store size={14} className="text-purple-500" /> Commercial Estate
          </h3>
          <div className="text-[9px] font-bold bg-purple-500/10 text-purple-500 px-2 py-1 rounded border border-purple-500/20">
              OCCUPANCY: 98%
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {commercialData.map((tenant: any) => (
          <div key={tenant.id} className="p-4 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-purple-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-slate-100 dark:border-zinc-700 text-slate-400">
                        {tenant.type === 'F&B' ? <Utensils size={14}/> : <ShoppingBag size={14}/>}
                    </div>
                    <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-zinc-200">{tenant.name}</div>
                        <div className="text-[9px] text-slate-500 dark:text-zinc-500 uppercase">{tenant.type} • {tenant.location}</div>
                    </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${tenant.status === 'PAID' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 my-3">
                <div className="bg-white dark:bg-zinc-900/50 p-2 rounded border border-slate-100 dark:border-zinc-700/50">
                    <span className="text-[9px] text-slate-400 block uppercase">Area</span>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-300">{tenant.area} m²</span>
                </div>
                <div className="bg-white dark:bg-zinc-900/50 p-2 rounded border border-slate-100 dark:border-zinc-700/50">
                    <span className="text-[9px] text-slate-400 block uppercase">Rent</span>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-300">€{tenant.rent}</span>
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
  );
};

// --- ANALYTICS TAB ---
export const AnalyticsTab: React.FC<{ analyticsData: any }> = ({ analyticsData }) => {
  if (!analyticsData) return <div className="p-4 text-xs font-mono text-zinc-500">Calibrating TabPFN Models...</div>;
  return (
    <div className="bg-white dark:bg-zinc-900/30 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 animate-in fade-in duration-300">
      <h3 className="text-xs font-black text-slate-700 dark:text-zinc-200 mb-6 uppercase tracking-widest flex items-center gap-2">
        <TrendingUp size={14} className="text-sky-500" /> Predictive Engine (TabPFN)
      </h3>
      
      <div className="relative overflow-hidden rounded-xl bg-slate-900 dark:bg-black p-6 text-white text-center border border-slate-800 dark:border-white/10">
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
  );
};

// --- BOOKINGS TAB ---
export const BookingsTab: React.FC<{ bookings: any[] }> = ({ bookings }) => {
  return (
    <div className="bg-white dark:bg-zinc-900/30 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 animate-in fade-in duration-300">
      <h3 className="text-xs font-black text-slate-700 dark:text-zinc-200 mb-6 uppercase tracking-widest flex items-center gap-2">
        <Globe size={14} className="text-purple-500" /> Incoming Transmissions
      </h3>
      <div className="space-y-3">
        {bookings.length === 0 ? (
          <div className="text-xs text-zinc-500 italic text-center p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">No active signals detected on booking channel.</div>
        ) : (
          bookings.map((booking, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block">S/Y Wind Chaser</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">REQ: June 10 - June 15</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">€{booking.totalCost.toFixed(2)}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[10px] bg-white dark:bg-black/40 p-2 rounded border border-slate-200 dark:border-zinc-700/50">
                  <BadgeCheck size={12} className="text-purple-500" />
                  <span className="text-slate-600 dark:text-zinc-400">Auto-Assigned:</span>
                  <strong className="text-slate-800 dark:text-zinc-200">{booking.berth}</strong>
                  <span className="text-slate-400 dark:text-zinc-600 truncate ml-1 opacity-70">({booking.reasoning})</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
