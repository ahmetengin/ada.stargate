
import React, { useState, useEffect } from 'react';
import { RegistryEntry, Tender, UserProfile, CongressEvent, Delegate, AgentTraceLog, VhfLog, AisTarget, TenantConfig } from '../../types';
import { facilityExpert } from '../../services/agents/facilityAgent';
import { congressExpert } from '../../services/agents/congressAgent';
import { hrExpert } from '../../services/agents/hrAgent';
import { commercialExpert } from '../../services/agents/commercialAgent';
import { analyticsExpert } from '../../services/agents/analyticsAgent';
import { berthExpert } from '../../services/agents/berthAgent';
import { reservationsExpert } from '../../services/agents/reservationsAgent';
import { FileText, Activity, Bell, Anchor, Navigation, DollarSign, Hexagon, Layers, Zap, Users, BarChart3 } from 'lucide-react';

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

// --- DEPARTMENT STRUCTURE DEFINITION ---
const DEPARTMENTS = [
    {
        id: 'OPS',
        label: 'OPERATIONS',
        icon: Navigation,
        color: 'text-indigo-500',
        borderColor: 'border-indigo-500',
        bgHover: 'hover:bg-indigo-500/10',
        modules: [
            { id: 'ops', label: 'LIVE MAP' },
            { id: 'fleet', label: 'FLEET CMD' },
            { id: 'berths', label: 'HARBOR' }
        ]
    },
    {
        id: 'ENG',
        label: 'TECHNICAL',
        icon: Zap,
        color: 'text-amber-500',
        borderColor: 'border-amber-500',
        bgHover: 'hover:bg-amber-500/10',
        modules: [
            { id: 'facility', label: 'INFRA & ECO' }
        ]
    },
    {
        id: 'COM',
        label: 'COMMERCIAL',
        icon: DollarSign,
        color: 'text-emerald-500',
        borderColor: 'border-emerald-500',
        bgHover: 'hover:bg-emerald-500/10',
        modules: [
            { id: 'bookings', label: 'BOOKINGS' },
            { id: 'commercial', label: 'RETAIL' },
            { id: 'congress', label: 'EVENTS' }
        ]
    },
    {
        id: 'ADM',
        label: 'ADMIN',
        icon: Users,
        color: 'text-blue-500',
        borderColor: 'border-blue-500',
        bgHover: 'hover:bg-blue-500/10',
        modules: [
            { id: 'hr', label: 'HR / STAFF' },
            { id: 'guest_entry', label: 'SECURITY' }
        ]
    },
    {
        id: 'INT',
        label: 'INTEL',
        icon: BarChart3,
        color: 'text-purple-500',
        borderColor: 'border-purple-500',
        bgHover: 'hover:bg-purple-500/10',
        modules: [
            { id: 'analytics', label: 'PREDICTIVE' },
            { id: 'observer', label: 'SYSTEM' }
        ]
    }
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
  
  // State for Active Module
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
    <div className="text-zinc-800 dark:text-zinc-300 font-mono h-full flex flex-col bg-transparent relative overflow-hidden">
      
      {/* HEADER: Strategic Command HUD */}
      <div className="flex-shrink-0 pt-4 pb-2 px-6 flex items-end justify-between border-b border-zinc-200 dark:border-white/5 relative z-20 bg-slate-50/90 dark:bg-gunmetal-900/90 backdrop-blur-md">
        
        {/* Left: Identity */}
        <div>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-900 dark:bg-white rounded-lg">
                    <Hexagon size={20} className="text-white dark:text-black fill-current" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                        {activeTenantConfig.name.toUpperCase()}
                    </h2>
                    <div className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Strategic Command
                    </div>
                </div>
            </div>
        </div>
        
        {/* Right: Global Metrics & Tools */}
        <div className="flex items-center gap-6">
            
            {/* Quick Metrics */}
            <div className="hidden lg:flex items-center gap-6 mr-6 border-r border-zinc-200 dark:border-white/10 pr-6">
                <div className="text-right">
                    <div className="text-[9px] text-zinc-500 uppercase font-bold">Occupancy</div>
                    <div className="text-lg font-black text-slate-800 dark:text-white leading-none">{vesselsInPort}/600</div>
                </div>
                <div className="text-right">
                    <div className="text-[9px] text-zinc-500 uppercase font-bold">Radar</div>
                    <div className="text-lg font-black text-indigo-500 leading-none">{aisTargets.length} <span className="text-[9px] text-zinc-400">TGT</span></div>
                </div>
                <div className="text-right">
                    <div className="text-[9px] text-zinc-500 uppercase font-bold">Yield</div>
                    <div className="text-lg font-black text-emerald-500 leading-none">€{(vesselsInPort * 1.5 * 100 / 1000).toFixed(1)}k</div>
                </div>
            </div>

            {/* Utility Icons */}
            <div className="flex items-center gap-3">
                <button onClick={onOpenReport} className="p-2 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors" title="Generate Report">
                    <FileText size={18} />
                </button>
                <button onClick={onOpenTrace} className="p-2 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors" title="Neural Trace">
                    <Activity size={18} />
                </button>
                <button className="p-2 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-colors relative" title="Alerts">
                    <Bell size={18} />
                    {criticalLogs.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-zinc-900"></span>
                    )}
                </button>
            </div>
        </div>
      </div>

      {/* DEPARTMENTAL NAVIGATION BAR */}
      <div className="flex-shrink-0 px-6 py-2 bg-white dark:bg-black/20 border-b border-zinc-200 dark:border-white/5 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-8 min-w-max">
              {DEPARTMENTS.map((dept) => (
                  <div key={dept.id} className="flex flex-col gap-2 group">
                      {/* Dept Header */}
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${dept.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                          <dept.icon size={10} />
                          {dept.label}
                      </div>
                      
                      {/* Dept Modules */}
                      <div className="flex items-center gap-1">
                          {dept.modules.map(mod => {
                              const isActive = activeModuleId === mod.id;
                              return (
                                  <button
                                      key={mod.id}
                                      onClick={() => setActiveModuleId(mod.id)}
                                      className={`
                                          px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all relative overflow-hidden
                                          ${isActive 
                                              ? `text-white bg-zinc-900 dark:bg-white dark:text-black shadow-lg` 
                                              : `text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10`
                                          }
                                      `}
                                  >
                                      {mod.label}
                                      {isActive && (
                                          <div className={`absolute bottom-0 left-0 w-full h-[2px] ${dept.color.replace('text-', 'bg-')}`}></div>
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
      <div className="flex-1 overflow-y-auto p-0 relative custom-scrollbar bg-slate-100/50 dark:bg-[#050b14]">
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
