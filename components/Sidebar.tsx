
import React from 'react';
import { UserProfile, TenantConfig } from '../types';
import { FEDERATION_REGISTRY } from '../services/config';
import { 
    Shield, Anchor, Wifi, Zap, Battery, Signal, UserCheck, 
    CreditCard, ScanLine, Activity, CheckCircle2, 
    LifeBuoy, Droplets, Wrench, Navigation, 
    Utensils, Calendar, MapPin, Car, Info, ShoppingBag, Globe, LogIn, ChevronRight, Scale, Brain, Bot, Projector
} from 'lucide-react';

interface SidebarProps {
  nodeStates: Record<string, 'connected' | 'working' | 'disconnected'>;
  isMonitoring: boolean;
  userProfile: UserProfile;
  onRoleChange: (role: string) => void;
  onScannerClick?: () => void;
  onPulseClick?: () => void;
  onTenantSwitch: (tenantId: string) => void;
  onStartPresentation?: () => void;
  activeTenantId: string;
}

const ActivityIcon = ({ color }: { color: string }) => (
    <div className={`flex gap-0.5 ${color}`}>
        <div className={`w-0.5 h-2 bg-current animate-pulse`}></div>
        <div className={`w-0.5 h-3 bg-current animate-pulse delay-75`}></div>
        <div className={`w-0.5 h-1.5 bg-current animate-pulse delay-150`}></div>
    </div>
);

const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-widest mb-2 pl-2 border-l-2 border-[var(--accent-color)]">
        {title}
    </h3>
);

const MenuButton = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-primary)] transition-all group border border-transparent hover:border-[var(--border-color)]">
        <div className="flex items-center gap-3">
            <Icon size={14} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] transition-colors" />
            {label}
        </div>
        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[var(--accent-color)]" />
    </button>
);


export const Sidebar: React.FC<SidebarProps> = ({ 
  nodeStates, 
  isMonitoring,
  userProfile,
  onRoleChange,
  onScannerClick,
  onPulseClick,
  onTenantSwitch,
  onStartPresentation,
  activeTenantId
}) => {

  const nodeGroups = [
    { 
        title: 'ADA.MARINA (OPS)', 
        color: 'text-cyan-400',
        nodes: [
            { id: 'ada.marina', label: 'HARBOUR MASTER' },
            { id: 'ada.sea', label: 'SEA / COLREGS' },
            { id: 'ada.technic', label: 'BOATYARD / LIFT' },
            { id: 'ada.energy', label: 'GRID (MONACO PROTOCOL)' },
            { id: 'ada.robotics', label: 'ROBOTICS (SUBSEA/SKY)' }
        ]
    },
    { 
        title: 'ADA.FINANCE (CFO)', 
        color: 'text-emerald-400',
        nodes: [
            { id: 'ada.finance', label: 'LEDGER & INVOICE' },
            { id: 'ada.commercial', label: 'COMMERCIAL / RETAIL' }, 
            { id: 'ada.customer', label: 'CRM / LOYALTY' },
            { id: 'ada.yield', label: 'YIELD (MIAMI MODE)' } 
        ]
    },
    { 
        title: 'ADA.LEGAL (COUNSEL)', 
        color: 'text-indigo-400',
        nodes: [
            { id: 'ada.legal', label: 'RULES & RAG' },
            { id: 'ada.security', label: 'SECURITY / ISPS' },
            { id: 'ada.shield', label: 'SHIELD (ANTIBES DOME)' }, 
            { id: 'ada.passkit', label: 'ACCESS CONTROL' }
        ]
    },
    { 
        title: 'ADA.STARGATE (BRAIN)', 
        color: 'text-purple-400',
        nodes: [
            { id: 'ada.orchestrator', label: 'ROUTER & SEAL' },
            { id: 'ada.federation', label: 'NETWORK LINK' }
        ]
    }
  ];

  const isGM = userProfile.role === 'GENERAL_MANAGER';
  const isCaptain = userProfile.role === 'CAPTAIN';
  const isMember = userProfile.role === 'MEMBER';
  const isVisitor = userProfile.role === 'VISITOR';

  const activeTenant = FEDERATION_REGISTRY.peers.find(p => p.id === activeTenantId) || FEDERATION_REGISTRY.peers[0];
  const tenantNetworkName = activeTenant ? activeTenant.network : 'Unknown Network';

  return (
    <div className="h-full w-full flex flex-col bg-[var(--glass-bg)] backdrop-blur-md border-r border-[var(--border-color)] text-[var(--text-secondary)] relative overflow-hidden transition-colors">
      
      <div className="hidden dark:block absolute top-0 left-0 w-full h-48 bg-cyan-500/10 blur-[80px] pointer-events-none mix-blend-screen"></div>

      <div className="p-6 flex-shrink-0 border-b border-[var(--border-color)] relative z-10 transition-colors">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={onPulseClick}>
                <div className="relative">
                    <div className="w-12 h-12 bg-white/50 dark:bg-cyan-950/30 rounded-xl flex items-center justify-center border border-[var(--border-color)] group-hover:border-[var(--accent-color)] transition-all duration-500 shadow-sm">
                        <Anchor size={24} className="text-[var(--accent-color)] drop-shadow-sm" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[var(--bg-primary)] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></div>
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold tracking-widest text-[var(--text-primary)] leading-none neon-text">ADA<span className="text-[var(--accent-color)]">STARGATE</span></h2>
                    <div className="text-[10px] text-[var(--text-secondary)] font-mono tracking-wider mt-1 uppercase">
                        {tenantNetworkName}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
