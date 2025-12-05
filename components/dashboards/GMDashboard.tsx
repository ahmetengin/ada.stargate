import React, { useState } from 'react';
import { RegistryEntry, Tender, UserProfile, AgentTraceLog, AisTarget, TenantConfig } from '../../types';
import { OpsTab } from './gm/OpsTab';
import { FleetTab } from './gm/FleetTab';
import { FacilityTab } from './gm/FacilityTab';
import { CongressTab } from './gm/CongressTab';
import { BerthsTab } from './gm/BerthsTab';
import { HRTab, CommercialTab, AnalyticsTab, BookingsTab, CustomerTab } from './gm/ManagementTabs';
import { GuestCheckInTab } from './gm/GuestCheckInTab';
import { Navigation, Anchor, Wrench, Globe, Users, FileText } from 'lucide-react';
import { wimMasterData } from '../../services/wimMasterData';

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
}

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
  activeTenantConfig
}) => {
  const [activeTab, setActiveTab] = useState('ops');

  // Prepare Data for Tabs
  
  // HR Data (Mocked based on wimMasterData or static if needed)
  const hrData = {
      department: 'Security',
      schedule: wimMasterData.hr_management?.shift_pattern ? [
          { name: 'Ahmet Yılmaz', shift: '08:00-16:00', status: 'ON_DUTY' },
          { name: 'Murat Kaya', shift: '08:00-16:00', status: 'ON_DUTY' },
          { name: 'Zeynep Aydın', shift: '16:00-24:00', status: 'OFF_DUTY' }
      ] : []
  };

  // Commercial Data
  const commercialData = wimMasterData.commercial_tenants?.key_tenants?.map((t: any, i: number) => ({
      id: `T-${i}`,
      name: t.name,
      type: t.type,
      location: t.location,
      area: 120,
      rent: 4500,
      status: Math.random() > 0.1 ? 'PAID' : 'OVERDUE'
  })) || [];

  // Analytics Data (Mock)
  const analyticsData = {
      period: '3M',
      prediction: 92,
      confidence: 89
  };

  // Bookings (Mock)
  const bookings = [
      { berth: 'C-10', totalCost: 1250, reasoning: 'Optimal size match' }
  ];

  // Berth Allocation (Mock for display)
  const berthAllocation = {
      berth: 'C-12',
      reasoning: 'Standard allocation based on LOA.',
      priceQuote: 150.00
  };

  // Facility Data
  const blueFlagStatus = { status: 'BLUE', data: { e_coli: 12 } };
  const zeroWasteStats = { recyclingRate: 45, nextAudit: '2025-12-15' };

  // Congress Data (Mock)
  const eventDetails = {
      id: 'EVT-1',
      name: 'Global Superyacht Summit',
      status: 'LIVE' as const,
      delegateCount: 450,
      dates: { start: '2025-11-25', end: '2025-11-27' },
      venues: ['WIM Grand Ballroom']
  };
  const delegates = [
      { id: 'D-1', name: 'Jean-Luc Picard', company: 'Starfleet', status: 'CHECKED_IN' as const, location: 'Ballroom' },
      { id: 'D-2', name: 'Will Riker', company: 'Titan Salvage', status: 'IN_TRANSIT' as const, location: 'Transfer' }
  ];

  const renderContent = () => {
      switch(activeTab) {
          case 'ops': return <OpsTab vesselsInPort={vesselsInPort} registry={registry} criticalLogs={logs} tenders={tenders} aisTargets={aisTargets} />;
          case 'fleet': return <FleetTab tenders={tenders} />;
          case 'facility': return <FacilityTab blueFlagStatus={blueFlagStatus} zeroWasteStats={zeroWasteStats} />;
          case 'congress': return <CongressTab eventDetails={eventDetails} delegates={delegates} />;
          case 'berths': return <BerthsTab berthAllocation={berthAllocation} />;
          case 'hr': return <HRTab hrData={hrData} />;
          case 'commercial': return <CommercialTab commercialData={commercialData} />;
          case 'analytics': return <AnalyticsTab analyticsData={analyticsData} />;
          case 'bookings': return <BookingsTab bookings={bookings} />;
          case 'customer': return <CustomerTab />;
          case 'guest_checkin': return <GuestCheckInTab />;
          default: return <div className="p-10 text-center text-zinc-500">Module under maintenance.</div>;
      }
  };

  return (
      <div className="h-full flex flex-col bg-zinc-50 dark:bg-black/20">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0 overflow-x-auto">
              <div className="flex gap-2">
                  <button onClick={() => setActiveTab('ops')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'ops' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      <Navigation size={14} /> OPS
                  </button>
                  <button onClick={() => setActiveTab('fleet')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'fleet' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      <Anchor size={14} /> FLEET
                  </button>
                  <button onClick={() => setActiveTab('facility')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'facility' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      <Wrench size={14} /> FACILITY
                  </button>
                  <button onClick={() => setActiveTab('congress')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'congress' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      <Globe size={14} /> CONGRESS
                  </button>
                  <div className="w-px bg-zinc-200 dark:bg-zinc-700 mx-2"></div>
                  <button onClick={() => setActiveTab('guest_checkin')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'guest_checkin' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      <Users size={14} /> ENTRY
                  </button>
              </div>
              
              <div className="flex gap-2">
                  <select 
                      className="bg-zinc-100 dark:bg-zinc-800 border-none text-xs font-bold text-zinc-600 dark:text-zinc-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={activeTab}
                      onChange={(e) => setActiveTab(e.target.value)}
                  >
                      <option value="ops">Management Views...</option>
                      <option value="hr">HR & Staffing</option>
                      <option value="commercial">Commercial</option>
                      <option value="analytics">Analytics</option>
                      <option value="bookings">Reservations</option>
                      <option value="customer">Customer Risk</option>
                      <option value="berths">Yield (Berths)</option>
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