
import React from 'react';
import { Users, Store, TrendingUp, BookOpen, Clock, BadgeCheck, BarChart3, Globe } from 'lucide-react';

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

// --- COMMERCIAL TAB ---
export const CommercialTab: React.FC<{ commercialData: any[] }> = ({ commercialData }) => {
  return (
    <div className="bg-white dark:bg-zinc-900/30 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 animate-in fade-in duration-300">
      <h3 className="text-xs font-black text-slate-700 dark:text-zinc-200 mb-6 uppercase tracking-widest flex items-center gap-2">
        <Store size={14} className="text-amber-500" /> Commercial Grid
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {commercialData.map((tenant: any) => (
          <div key={tenant.id} className="p-4 bg-slate-50 dark:bg-zinc-900/80 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-amber-500/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div className="font-bold text-sm text-slate-800 dark:text-zinc-200">{tenant.name}</div>
                <div className={`w-2 h-2 rounded-full ${tenant.status === 'PAID' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-500 mb-1">
                <span>Lease Area</span>
                <span className="font-mono">{tenant.area} m²</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-500 mb-3">
                <span>Monthly Rent</span>
                <span className="font-mono">€{tenant.rent}</span>
            </div>
            <div className={`text-center py-1 rounded text-[10px] font-bold border ${
                tenant.status === 'PAID' 
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-600 border-red-500/20'
            }`}>
                STATUS: {tenant.status}
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
