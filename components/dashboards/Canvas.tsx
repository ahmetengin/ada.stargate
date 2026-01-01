
import React, { useEffect, useState } from 'react';
import { RegistryEntry, Tender, UserProfile, AgentTraceLog, AisTarget, TenantConfig } from '../../types';
import { GuestDashboard } from './GuestDashboard';
import { CaptainDashboard } from './CaptainDashboard';
import { GMDashboard } from './GMDashboard';
import { HRDashboard } from './HRDashboard'; // NEW
import { EmergencyDashboard } from './EmergencyDashboard';

interface CanvasProps {
  vesselsInPort: number;
  registry: RegistryEntry[];
  tenders: Tender[];
  aisTargets?: AisTarget[];
  userProfile: UserProfile;
  onOpenReport?: () => void;
  onOpenTrace?: () => void;
  agentTraces?: AgentTraceLog[];
  activeTenantConfig: TenantConfig; 
  activeTabOverride?: string;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  vesselsInPort, 
  registry,
  tenders,
  aisTargets = [],
  userProfile,
  onOpenReport,
  onOpenTrace,
  agentTraces = [],
  activeTenantConfig,
  activeTabOverride
}) => {
  const [occupancyRate, setOccupancyRate] = useState(92);
  
  useEffect(() => {
      const interval = setInterval(() => {
          setOccupancyRate(prev => prev + (Math.random() > 0.5 ? 0.1 : -0.1));
      }, 5000);
      return () => clearInterval(interval);
  }, []);

  const dashboardLogs = agentTraces
    .filter(t => t.step === 'ERROR' || t.isError || (t.content && typeof t.content === 'string' && (t.content.includes('DENIED') || t.content.includes('ALERT') || t.content.includes('CODE_RED') || t.content.includes('MAYDAY'))))
    .map(t => ({
        timestamp: t.timestamp,
        source: t.node,
        message: t.content,
        type: (t.content && typeof t.content === 'string' && (t.content.includes('CODE_RED') || t.content.includes('MAYDAY'))) ? 'CRITICAL_EMERGENCY' : 'critical'
    }));

  const isEmergency = dashboardLogs.some(l => l.type === 'CRITICAL_EMERGENCY');

  // Emergency Override
  if (isEmergency && userProfile.role !== 'VISITOR' && userProfile.role !== 'MEMBER') {
      return <EmergencyDashboard />;
  }

  // Role-Based Routing
  if (userProfile.role === 'HR_MANAGER' || activeTabOverride === 'hr') {
      return <HRDashboard />;
  }

  if (userProfile.role === 'VISITOR' || userProfile.role === 'MEMBER') {
      return <div className="h-full w-full overflow-hidden"><GuestDashboard userProfile={userProfile} /></div>;
  }

  if (userProfile.role === 'CAPTAIN') {
      return <CaptainDashboard />;
  }

  // Default to GM Dashboard for others (GM, Ops)
  return (
      <div className="h-full w-full pb-20 lg:pb-0 overflow-hidden">
        <GMDashboard 
            userProfile={userProfile}
            logs={dashboardLogs}
            registry={registry}
            tenders={tenders}
            vesselsInPort={vesselsInPort}
            agentTraces={agentTraces}
            aisTargets={aisTargets}
            onOpenReport={onOpenReport || (() => {})}
            onOpenTrace={onOpenTrace || (() => {})}
            activeTenantConfig={activeTenantConfig}
            activeTabOverride={activeTabOverride}
        />
      </div>
  );
};
