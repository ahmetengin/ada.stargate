
import React, { useState, useEffect } from 'react';
import { RegistryEntry, Tender, UserProfile, AgentTraceLog, AisTarget, TenantConfig } from '../../types';
import { OpsTab } from './gm/OpsTab';
import { FleetTab } from './gm/FleetTab';
import { FacilityTab } from './gm/FacilityTab';
import { CongressTab } from './gm/CongressTab';
import { BerthsTab } from './gm/BerthsTab';
import { HRTab, CommercialTab, AnalyticsTab, BookingsTab, CustomerTab } from './gm/ManagementTabs';
import { GuestCheckInTab } from './gm/GuestCheckInTab';
import { Navigation, Anchor, Wrench, Globe, Users, FileText, Compass, Map, Cpu, Activity, Server } from 'lucide-react';
import { wimMasterData } from '../../services/wimMasterData';
import { LiveMap } from './gm/LiveMap';

interface GMDashboardProps {
  userProfile: UserProfile;
  logs: any[];
  registry: RegistryEntry[];
  tenders: Tender[];
  aisTargets?: AisTarget[];
  onOpenReport: () => void;
  onOpenTrace: () => void;
  agentTraces?: AgentTraceLog[];
  vesselsInPort: number;
  activeTenantConfig: TenantConfig;
  activeTabOverride?: string;
}

// --- BBN: CHARTPLOTTER VIEW ---
const ChartplotterView = () => (
    <div className="h-full w-full bg-[#050b14] relative overflow-hidden flex flex-col">
        {/* Top Data Strip */}
        <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-6 font-mono text-xs text-amber-500">
            <div>LAT: <span className="text-white">40°57.850' N</span></div>
            <div>LON: <span className="text-white">28°53.400' E</span></div>
            <div>SOG: <span className="text-white font-bold">5.2 kn</span></div>
            <div>COG: <span className="text-white font-bold">285° M</span></div>
            <div className="ml-auto text-zinc-500">OPENCPN LAYER ACTIVE</div>
        </div>
        {/* Map Area */}
        <div className="flex-1 relative">
            <LiveMap /> {/* Reusing LiveMap but conceptualized as Chartplotter */}
            
            {/* Tactical Overlay */}
            <div className="absolute bottom-4 right-4 bg-black/80 border border-zinc-700 p-2 rounded text-[10px] font-mono text-emerald-400">
                <div>AIS TARGETS: 12</div>
                <div>CPA ALARM: OFF</div>
                <div>VECTOR: 6 MIN</div>
            </div>
        </div>
    </div>
);

// --- BBN: INSTRUMENT PANEL (SignalK Style) ---
const InstrumentPanel = () => (
    <div className="h-full w-full bg-[#000] p-4 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto">
        {[
            { label: "SOG", value: "5.2", unit: "kn", color: "text-emerald-500" },
            { label: "COG", value: "285", unit: "deg", color: "text-amber-500" },
            { label: "DEPTH", value: "14.2", unit: "m", color: "text-cyan-400" },
            { label: "WIND (T)", value: "12.5", unit: "kn", color: "text-white" },
            { label: "AWA", value: "035", unit: "deg", color: "text-red-400" },
            { label: "AWS", value: "18.2", unit: "kn", color: "text-red-400" },
            { label: "BATTERY", value: "12.8", unit: "V", color: "text-yellow-400" },
            { label: "BARO", value: "1013", unit: "hPa", color: "text-purple-400" },
        ].map((inst, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col items-center justify-center p-6 aspect-square">
                <div className="text-zinc-500 font-bold text-sm tracking-widest mb-2">{inst.label}</div>
                <div className={`text-6xl font-mono font-black ${inst.color} tracking-tighter`}>{inst.value}</div>
                <div className="text-zinc-600 font-bold mt-2">{inst.unit}</div>
            </div>
        ))}
    </div>
);

// --- BBN: SYSTEM MONITOR (Pi Status) ---
const SystemMonitor = () => (
    <div className="h-full w-full bg-[#050b14] p-6 overflow-y-auto font-mono">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CPU/RAM */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h3 className="text-emerald-500 font-bold mb-4 flex items-center gap-2"><Cpu size={16}/> RASPBERRY PI 5 STATUS</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1"><span>CPU LOAD (4 Cores)</span><span>12%</span></div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-600 w-[12%]"></div></div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1"><span>CPU TEMP</span><span>42°C</span></div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-600 w-[30%]"></div></div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1"><span>RAM USAGE (8GB)</span><span>2.4GB</span></div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-purple-600 w-[28%]"></div></div>
                    </div>
                </div>
            </div>

            {/* Services */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2"><Activity size={16}/> SERVICE MESH</h3>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5"><span>signal-k-server</span><span className="text-emerald-500 font-bold">RUNNING</span></div>
                    <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5"><span>opencpn-core</span><span className="text-emerald-500 font-bold">RUNNING</span></div>
                    <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5"><span>ada-stargate-agent</span><span className="text-emerald-500 font-bold">RUNNING</span></div>
                    <div className="flex justify-between p-2 bg-black/40 rounded border border-white/5"><span>pypilot</span><span className="text-zinc-500 font-bold">STANDBY</span></div>
                </div>
            </div>

            {/* Network */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 col-span-1 md:col-span-2">
                <h3 className="text-cyan-500 font-bold mb-4 flex items-center gap-2"><Server size={16}/> NETWORK INTERFACES</h3>
                <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-black/40 rounded border border-white/5">
                        <div className="text-zinc-500 mb-1">eth0 (NMEA 2000)</div>
                        <div className="text-white">192.168.1.100</div>
                        <div className="text-emerald-500 mt-1">RX: 1.2 MB/s</div>
                    </div>
                    <div className="p-3 bg-black/40 rounded border border-white/5">
                        <div className="text-zinc-500 mb-1">wlan0 (Local Hotspot)</div>
                        <div className="text-white">10.10.10.1</div>
                        <div className="text-emerald-500 mt-1">Clients: 3</div>
                    </div>
                    <div className="p-3 bg-black/40 rounded border border-white/5">
                        <div className="text-zinc-500 mb-1">can0 (N2K Bus)</div>
                        <div className="text-white">UP</div>
                        <div className="text-emerald-500 mt-1">Load: 15%</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const GMDashboard: React.FC<GMDashboardProps> = ({
  userProfile,
  logs,
  registry,
  tenders,
  aisTargets,
  onOpenReport,
  onOpenTrace,
  agentTraces,
  vesselsInPort,
  activeTenantConfig,
  activeTabOverride
}) => {
  const [activeTab, setActiveTab] = useState('chartplotter');

  useEffect(() => {
      if (activeTabOverride) {
          setActiveTab(activeTabOverride);
      }
  }, [activeTabOverride]);

  const renderContent = () => {
      switch(activeTab) {
          case 'chartplotter': return <ChartplotterView />;
          case 'instruments': return <InstrumentPanel />;
          case 'system': return <SystemMonitor />;
          // Keep legacy tabs available if needed, but prioritized BBN ones
          case 'ops': return <OpsTab vesselsInPort={vesselsInPort} registry={registry} criticalLogs={logs} tenders={tenders} aisTargets={aisTargets} />;
          case 'fleet': return <FleetTab tenders={tenders} />;
          case 'facility': return <FacilityTab blueFlagStatus={{status: 'BLUE', data: {e_coli: 12}}} zeroWasteStats={{recyclingRate: 45}} />;
          case 'congress': return <CongressTab eventDetails={null} delegates={[]} />;
          case 'berths': return <BerthsTab berthAllocation={null} />;
          case 'hr': return <HRTab hrData={null} />;
          case 'commercial': return <CommercialTab commercialData={[]} />;
          case 'analytics': return <AnalyticsTab analyticsData={null} />;
          case 'bookings': return <BookingsTab bookings={[]} />;
          case 'customer': return <CustomerTab />;
          case 'guest_checkin': return <GuestCheckInTab />;
          default: return <div className="p-10 text-center text-zinc-500">Module offline.</div>;
      }
  };

  return (
      <div className="h-full flex flex-col bg-zinc-50 dark:bg-black/20 overflow-hidden">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shrink-0 overflow-x-auto no-scrollbar">
              <div className="flex gap-2">
                  <button onClick={() => setActiveTab('chartplotter')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'chartplotter' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50 shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      <Map size={14} /> CHART
                  </button>
                  <button onClick={() => setActiveTab('instruments')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'instruments' ? 'bg-amber-900/50 text-amber-500 border border-amber-500/50 shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      <Compass size={14} /> INST
                  </button>
                  <button onClick={() => setActiveTab('system')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'system' ? 'bg-purple-900/50 text-purple-400 border border-purple-500/50 shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      <Cpu size={14} /> SYS
                  </button>
                   <div className="w-px bg-zinc-200 dark:bg-zinc-800 mx-2 h-6 self-center"></div>
                  <button onClick={() => setActiveTab('ops')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'ops' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      <Navigation size={14} /> OPS
                  </button>
              </div>
              
              <div className="flex gap-2 pl-2">
                  <select 
                      className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none w-32 md:w-auto"
                      value={activeTab}
                      onChange={(e) => setActiveTab(e.target.value)}
                  >
                      <option value="chartplotter">Navigation</option>
                      <option value="instruments">Instruments</option>
                      <option value="system">System</option>
                      <option value="fleet">Fleet</option>
                      <option value="facility">Facility</option>
                  </select>
                  
                  <button onClick={onOpenReport} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors" title="Reports">
                      <FileText size={16} />
                  </button>
              </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden relative">
              {renderContent()}
          </div>
      </div>
  );
};
