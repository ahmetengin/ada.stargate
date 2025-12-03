
import React, { useState, useEffect } from 'react';
import { RegistryEntry, Tender, UserProfile, CongressEvent, Delegate, AgentTraceLog, VhfLog, AisTarget, TenantConfig } from '../../types';
import { facilityExpert } from '../../services/agents/facilityAgent';
import { congressExpert } from '../../services/agents/congressAgent';
import { hrExpert } from '../../services/agents/hrAgent';
import { commercialExpert } from '../../services/agents/commercialAgent';
import { analyticsExpert } from '../../services/agents/analyticsAgent';
import { berthExpert } from '../../services/agents/berthAgent';
import { reservationsExpert } from '../../services/agents/reservationsAgent';
import { FileText, Activity, Bell, Anchor, Navigation, DollarSign, Hexagon, Layers, Zap, Users, BarChart3, Scan, Radar, Target } from 'lucide-react';

import { OpsTab } from './gm/OpsTab';
import { FleetTab } from './gm/FleetTab';
import { FacilityTab } from './gm/FacilityTab';
import { CongressTab } from './gm/CongressTab';
import { BerthsTab } from './gm/BerthsTab';
import { HRTab, CommercialTab, AnalyticsTab, BookingsTab } from './gm/ManagementTabs';
import { ObserverTab } from './gm/ObserverTab';
import { GuestCheckInTab } from './gm/GuestCheckInTab';

interface GMDashboardProps {
  userProfile: UserProfile;
  logs: any[];
  registry: RegistryEntry[];
  tenders: Tender[];
  vesselsInPort: number;
  agentTraces: AgentTraceLog[];
  vhfLogs?: VhfLog[];
  aisTargets?: AisTarget[];
  onOpenReport: () => void;
  onOpenTrace: () => void;
  activeTenantConfig: TenantConfig;
}

// ... (DEPARTMENTS Array same as before) ...
const DEPARTMENTS = [
    { id: 'OPS', label: 'OPERATIONS', icon: Navigation, color: 'text-indigo-500', modules: [{ id: 'ops', label: 'LIVE MAP' }, { id: 'fleet', label: 'FLEET CMD' }, { id: 'berths', label: 'HARBOR' }] },
    { id: 'ENG', label: 'TECHNICAL', icon: Zap, color: 'text-amber-500', modules: [{ id: 'facility', label: 'INFRA & ECO' }] },
    { id: 'COM', label: 'COMMERCIAL', icon: DollarSign, color: 'text-emerald-500', modules: [{ id: 'bookings', label: 'BOOKINGS' }, { id: 'commercial', label: 'RETAIL' }, { id: 'congress', label: 'EVENTS' }] },
    { id: 'ADM', label: 'ADMIN', icon: Users, color: 'text-blue-500', modules: [{ id: 'hr', label: 'HR / STAFF' }, { id: 'guest_entry', label: 'SECURITY' }] },
    { id: 'INT', label: 'INTEL', icon: BarChart3, color: 'text-purple-500', modules: [{ id: 'analytics', label: 'PREDICTIVE' }, { id: 'observer', label: 'SYSTEM' }] }
];

export const GMDashboard: React.FC<GMDashboardProps> = ({
  userProfile,
  logs,
  registry,
  tenders,
  vesselsInPort,
  agentTraces,
  vhfLogs = [],
  aisTargets = [],
  onOpenReport,
  onOpenTrace,
  activeTenantConfig
}) => {
  const criticalLogs = logs.filter(log => log.type === 'critical' || log.type === 'alert');
  const [activeModuleId, setActiveModuleId] = useState<string>('ops');
  
  // Data States
  const [zeroWasteStats, setZeroWasteStats] = useState<any>(null);
  const [blueFlagStatus, setBlueFlagStatus] = useState<any>(null);
  const [eventDetails, setEventDetails] = useState<CongressEvent | null>(null);
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [hrData, setHrData] = useState<any>(null);
  const [commercialData, setCommercialData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [berthAllocation, setBerthAllocation] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  // Simulation for live counters (Digital Ticker effect)
  const [ticker, setTicker] = useState(0);
  useEffect(() => {
      const interval = setInterval(() => setTicker(t => t + 1), 1000);
      return () => clearInterval(interval);
  }, []);

  // Effect to load data based on active module
  useEffect(() => {
    if (activeModuleId === 'facility') {
      facilityExpert.generateZeroWasteReport(() => { }).then(res => setZeroWasteStats(res));
      facilityExpert.checkSeaWaterQuality(() => { }).then(res => setBlueFlagStatus(res));
    }
    if (activeModuleId === 'congress') {
      congressExpert.getEventDetails().then(setEventDetails);
      congressExpert.getDelegates().then(setDelegates);
    }
    if (activeModuleId === 'hr') {
      hrExpert.getShiftSchedule('Security', () => { }).then(setHrData);
    }
    if (activeModuleId === 'commercial') {
      commercialExpert.getTenantLeases(() => { }).then(setCommercialData);
    }
    if (activeModuleId === 'analytics') {
      analyticsExpert.predictOccupancy('3M', () => { }).then(setAnalyticsData);
    }
    if (activeModuleId === 'berths') {
      berthExpert.findOptimalBerth({ loa: 20.4, beam: 5.6, draft: 4.7, type: 'VO65 Racing Yacht' }, () => { }).then(setBerthAllocation);
    }
    if (activeModuleId === 'bookings') {
      reservationsExpert.processBooking({ name: "S/Y Wind Chaser", type: "Sailing Yacht", loa: 16, beam: 4.5 }, { start: "2025-06-10", end: "2025-06-15" }, () => { }).then(res => setBookings([res.proposal]));
    }
  }, [activeModuleId]);

  return (
    <div className="text-slate-600 dark:text-slate-300 font-mono h-full flex flex-col bg-transparent relative overflow-hidden">
      
      {/* HEADER: Strategic Command HUD */}
      <div className="flex-shrink-0 pt-6 pb-2 px-4 sm:px-8 flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-[var(--border-color)] relative z-20 glass-panel mt-2 mx-4 rounded-xl transition-all">
        
        {/* Left: Identity */}
        <div className="pb-2">
            <div className="flex items-center gap-4">
                <div className="p-2 border border-cyan-500/30 rounded-lg bg-cyan-50 dark:bg-cyan-950/20">
                    <Hexagon size={24} className="text-cyan-600 dark:text-cyan-400 stroke-1" />
                </div>
                <div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-800 dark:text-white tracking-widest leading-none neon-text">
                        {activeTenantConfig.name.toUpperCase()}
                    </h2>
                    <div className="text-[10px] font-mono font-bold text-cyan-600 mt-1 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Scan size={10} className="animate-spin-slow" />
                        Strategic Command
                    </div>
                </div>
            </div>
        </div>
        
        {/* Right: Global Metrics & Tools */}
        <div className="flex items-center gap-4 sm:gap-8 pb-2 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0">
            
            {/* Quick Metrics HUD - Updated with Live Counters */}
            <div className="flex items-center gap-4 sm:gap-8 border-r border-[var(--border-color)] pr-4 sm:pr-8">
                {/* Occupancy Gauge */}
                <div className="text-right">
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest flex items-center justify-end gap-1">
                        <Anchor size={8} /> Occupancy
                    </div>
                    <div className="text-xl sm:text-2xl font-display font-bold text-slate-700 dark:text-white leading-none">
                        {vesselsInPort}<span className="text-sm text-slate-400 dark:text-slate-600">/600</span>
                    </div>
                </div>
                
                {/* Live Radar Targets (Dynamic) */}
                <div className="text-right">
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest flex items-center justify-end gap-1">
                        <Target size={8} className="text-red-500 animate-pulse" /> Radar TGT
                    </div>
                    <div className="text-xl sm:text-2xl font-display font-bold text-cyan-600 dark:text-cyan-400 leading-none tabular-nums">
                        {/* Dynamic number simulation */}
                        {aisTargets.length > 0 ? aisTargets.length : 3 + (ticker % 2)} 
                        <span className="text-[10px] text-cyan-700 dark:text-cyan-900 ml-1">ACT</span>
                    </div>
                </div>

                {/* Daily Yield */}
                <div className="hidden lg:block text-right">
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest flex items-center justify-end gap-1">
                        <DollarSign size={8} /> Yield (Est)
                    </div>
                    <div className="text-xl sm:text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                        €{(vesselsInPort * 1.5 * 100 / 1000).toFixed(1)}k
                    </div>
                </div>
            </div>

            {/* Utility Icons */}
            <div className="flex items-center gap-2">
                <button onClick={onOpenReport} className="p-2 rounded-lg border border-transparent hover:border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all" title="Generate Report">
                    <FileText size={18} />
                </button>
                <button onClick={onOpenTrace} className="p-2 rounded-lg border border-transparent hover:border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all" title="Neural Trace">
                    <Activity size={18} />
                </button>
                <button className="p-2 rounded-lg border border-transparent hover:border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all relative" title="Alerts">
                    <Bell size={18} />
                    {criticalLogs.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]"></span>
                    )}
                </button>
            </div>
        </div>
      </div>

      {/* DEPARTMENTAL NAVIGATION BAR */}
      <div className="flex-shrink-0 px-8 py-3 overflow-x-auto custom-scrollbar border-b border-[var(--border-color)]">
          <div className="flex items-center gap-8 min-w-max">
              {DEPARTMENTS.map((dept) => (
                  <div key={dept.id} className="flex flex-col gap-2 group">
                      {/* Dept Header */}
                      <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${dept.color} opacity-60 group-hover:opacity-100 transition-all`}>
                          <dept.icon size={12} />
                          {dept.label}
                      </div>
                      
                      {/* Dept Modules */}
                      <div className="flex items-center gap-1">
                          {dept.modules.map(mod => {
                              const isActive = activeModuleId === mod.id;
                              // Dynamic Color handling for Tailwind logic
                              const activeBorderColor = dept.color.includes('indigo') ? 'border-indigo-500/50' : 
                                                        dept.color.includes('amber') ? 'border-amber-500/50' : 
                                                        dept.color.includes('emerald') ? 'border-emerald-500/50' :
                                                        dept.color.includes('blue') ? 'border-blue-500/50' : 'border-purple-500/50';
                              
                              const activeBgColor = dept.color.includes('indigo') ? 'bg-indigo-500/10' : 
                                                    dept.color.includes('amber') ? 'bg-amber-500/10' : 
                                                    dept.color.includes('emerald') ? 'bg-emerald-500/10' :
                                                    dept.color.includes('blue') ? 'bg-blue-500/10' : 'bg-purple-500/10';

                              return (
                                  <button
                                      key={mod.id}
                                      onClick={() => setActiveModuleId(mod.id)}
                                      className={`
                                          px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all relative overflow-hidden border
                                          ${isActive 
                                              ? `text-slate-800 dark:text-white ${activeBorderColor} ${activeBgColor} shadow-sm` 
                                              : `text-slate-500 border-transparent hover:border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300`
                                          }
                                      `}
                                  >
                                      {mod.label}
                                      {isActive && (
                                          <div className={`absolute bottom-0 left-0 w-full h-[1px] bg-current opacity-50`}></div>
                                      )}
                                  </button>
                              )
                          })}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-0 relative custom-scrollbar">
        {activeModuleId === 'ops' && (
            <OpsTab 
                vesselsInPort={vesselsInPort} 
                registry={registry} 
                criticalLogs={criticalLogs} 
                tenders={tenders}
                vhfLogs={vhfLogs}
                aisTargets={aisTargets}
            />
        )}
        {activeModuleId === 'fleet' && <FleetTab tenders={tenders} />}
        {activeModuleId === 'facility' && <FacilityTab blueFlagStatus={blueFlagStatus} zeroWasteStats={zeroWasteStats} />}
        {activeModuleId === 'congress' && <CongressTab eventDetails={eventDetails} delegates={delegates} />}
        {activeModuleId === 'hr' && <HRTab hrData={hrData} />}
        {activeModuleId === 'commercial' && <CommercialTab commercialData={commercialData} />}
        {activeModuleId === 'analytics' && <AnalyticsTab analyticsData={analyticsData} />}
        {activeModuleId === 'berths' && <BerthsTab berthAllocation={berthAllocation} />}
        {activeModuleId === 'bookings' && <BookingsTab bookings={bookings} />}
        {activeModuleId === 'guest_entry' && <GuestCheckInTab />}
        {activeModuleId === 'observer' && <ObserverTab traces={agentTraces} />}
      </div>
    </div>
  );
};
