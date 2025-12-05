
import React from 'react';
import { X, Printer, ShieldAlert, Anchor, Briefcase, Sun, Wind, CloudRain, Utensils, ShoppingBag, Activity, AlertTriangle, Navigation, DollarSign, FileText } from 'lucide-react';
import { RegistryEntry, UserProfile, WeatherForecast, TenantConfig, Tender, AgentTraceLog, AisTarget } from '../../types';
import { GuestDashboard } from '../dashboards/GuestDashboard';
import { CaptainDashboard } from '../dashboards/CaptainDashboard';
import { GMDashboard } from '../dashboards/GMDashboard';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  registry: RegistryEntry[];
  logs: any[];
  vesselsInPort: number;
  userProfile: UserProfile;
  weatherData: WeatherForecast;
  activeTenantConfig: TenantConfig;
  tenders: Tender[];
  agentTraces: AgentTraceLog[];
  aisTargets: AisTarget[];
  onOpenReport: () => void;
  onOpenTrace: () => void;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({ 
  isOpen, 
  onClose, 
  registry, 
  logs, 
  vesselsInPort,
  userProfile,
  weatherData,
  activeTenantConfig,
  tenders,
  agentTraces,
  aisTargets,
  onOpenReport,
  onOpenTrace
}) => {
  if (!isOpen) return null;

  const today = new Date();
  const currentWx = weatherData || { temp: 24, condition: 'Sunny', windSpeed: 12, windDir: 'NW' };

  const handlePrint = () => {
    window.print();
  };

  const renderContent = () => {
    switch(userProfile.role) {
      case 'VISITOR': 
      case 'MEMBER': 
        return <GuestDashboard userProfile={userProfile} />;
      case 'CAPTAIN': 
        return <CaptainDashboard />;
      case 'GENERAL_MANAGER': 
        return <GMDashboard 
            userProfile={userProfile}
            logs={logs}
            registry={registry}
            tenders={tenders}
            vesselsInPort={vesselsInPort}
            agentTraces={agentTraces}
            aisTargets={aisTargets}
            onOpenReport={onOpenReport}
            onOpenTrace={onOpenTrace}
            activeTenantConfig={activeTenantConfig}
        />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col relative max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
             <FileText size={16} className="text-indigo-500" />
             <h2 className="font-bold text-zinc-800 dark:text-zinc-200">{activeTenantConfig.name} Daily Operations Report</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint} 
              className="p-2 rounded-md text-zinc-500 hover:text-indigo-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Print Report"
            >
              <Printer size={16} />
            </button>
            <button onClick={onClose} className="p-2 rounded-md text-zinc-500 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <X size={16} />
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar" id="printable-report">
            {renderContent()}
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .dark {
             color-scheme: light;
          }
          #printable-report.dark, .dark #printable-report {
            background-color: white !important;
            color: black !important;
          }
          .dark #printable-report [class*="dark:text-"] {
             color: inherit !important;
          }
           .dark #printable-report [class*="dark:bg-"] {
             background-color: #f4f4f5 !important;
          }
           .dark #printable-report [class*="dark:border-"] {
             border-color: #e4e4e7 !important;
          }
        }
      `}</style>
    </div>
  );
};
