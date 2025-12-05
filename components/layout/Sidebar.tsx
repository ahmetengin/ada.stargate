
import React from 'react';
import { UserProfile, VhfLog } from '../../types';
import { FEDERATION_REGISTRY } from '../../services/config';
import { 
    Anchor, ChevronRight, Projector, Activity
} from 'lucide-react';

interface SidebarProps {
  nodeStates: Record<string, 'connected' | 'working' | 'disconnected'>;
  isMonitoring: boolean;
  userProfile: UserProfile;
  vhfLogs: VhfLog[];
  onRoleChange: (role: string) => void;
  onScannerClick?: () => void;
  onPulseClick?: () => void;
  onTenantSwitch: (tenantId: string) => void;
  onEnterObserverMode?: () => void;
  onEnterScribeMode?: () => void;
  activeTenantId: string;
}

const ActivityIcon = ({ color }: { color: string }) => (
    <div className="flex gap-0.5">
        <div className={`w-0.5 h-2 ${color} animate-pulse`}></div>
        <div className={`w-0.5 h-3 ${color} animate-pulse delay-75`}></div>
        <div className={`w-0.5 h-1.5 ${color} animate-pulse delay-150`}></div>
    </div>
);

const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-widest mb-2 pl-2 border-l-2 border-[var(--accent-color)]">
        {title}
    </h3>
);

const MenuButton = ({ icon: Icon, label }: { icon: any, label: string }) => (
    <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-primary)] transition-all group border border-transparent hover:border-[var(--border-color)]">
        <div className="flex items-center gap-3">
            <Icon size={14} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] transition-colors" />
            {label}
        </div>
        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[var(--accent-color)]" />
    </button>
);

// --- SUB-COMPONENTS FOR FOOTER ---
const RoleMiniButton = ({ role, current, onClick, label }: any) => (
    <button
        onClick={onClick}
        className={`px-1 py-1.5 rounded text-[8px] font-bold uppercase tracking-wider text-center transition-all border ${
            current === role 
            ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-md' 
            : 'text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-primary)]'
        }`}
    >
        {label}
    </button>
);

const TenantButton = ({ tenantId, currentTenantId, onClick, label }: any) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex justify-between items-center transition-all border ${
            currentTenantId === tenantId 
            ? 'bg-black/5 dark:bg-cyan-950/30 text-[var(--accent-color)] border-[var(--border-color)] shadow-sm' 
            : 'text-[var(--text-secondary)] border-transparent hover:bg-black/5 dark:hover:bg-white/5'
        }`}
    >
        <span className="truncate">{label}</span>
        {currentTenantId === tenantId && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] shadow-sm"></div>}
    </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
  nodeStates, 
  userProfile,
  onRoleChange,
  onPulseClick,
  onTenantSwitch,
  onEnterObserverMode,
  onEnterScribeMode,
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
  const activeTenant = FEDERATION_REGISTRY.peers.find(p => p.id === activeTenantId) || FEDERATION_REGISTRY.peers[0];
  const tenantNetworkName = activeTenant ? activeTenant.network : 'Unknown Network';

  return (
    <div className="h-full w-full flex flex-col bg-[var(--glass-bg)] backdrop-blur-md border-r border-[var(--border-color)] text-[var(--text-secondary)] relative overflow-hidden transition-colors">
      
      {/* Glow Effect - Dark Mode Only */}
      <div className="hidden dark:block absolute top-0 left-0 w-full h-48 bg-cyan-500/10 blur-[80px] pointer-events-none mix-blend-screen"></div>

      {/* Header */}
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

            {/* Header Actions (Only for GM) */}
            {isGM && (
                <div className="flex items-center gap-2">
                    {/* Presentation Mode (Sunum) */}
                    {onEnterScribeMode && (
                        <button 
                            onClick={onEnterScribeMode}
                            className="p-2 rounded-full bg-purple-500/10 hover:bg-purple-500 text-purple-500 hover:text-white transition-all border border-purple-500/30 hover:border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)] group"
                            title="Presentation Mode"
                        >
                            <Projector size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                    )}

                    {/* Observer Mode (Matrix) */}
                    {onEnterObserverMode && (
                        <button 
                            onClick={onEnterObserverMode}
                            className="p-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500 text-cyan-500 hover:text-white transition-all border border-cyan-500/30 hover:border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)] group"
                            title="Neural Observer"
                        >
                            <Activity size={18} className="group-hover:animate-pulse" />
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8 relative z-10">
          
          {/* GENERAL MANAGER VIEW */}
          {isGM ? (
              <div className="space-y-6">
                {nodeGroups.map((group) => (
                    <div key={group.title}>
                        <h3 className={`text-[9px] font-bold uppercase tracking-widest mb-2 pl-2 border-l-2 ${group.color.replace('text', 'border')} ${group.color}`}>
                            {group.title}
                        </h3>
                        <div className="grid grid-cols-1 gap-1">
                            {group.nodes.map((node) => {
                                const isWorking = nodeStates[node.id] === 'working';
                                return (
                                    <div key={node.id} className="flex items-center justify-between group py-2 px-3 hover:bg-black/5 dark:hover:bg-cyan-500/5 rounded-lg transition-all border border-transparent hover:border-[var(--border-color)]">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1 h-1 rounded-full ${isWorking ? 'bg-amber-400 animate-pulse' : 'bg-slate-400'}`} />
                                            <span className={`text-[10px] font-mono font-medium transition-colors ${isWorking ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                                {node.label}
                                            </span>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isWorking ? <ActivityIcon color="text-amber-400" /> : <div className="text-[8px] text-[var(--accent-color)] font-mono">IDLE</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
              </div>
          ) : (
              <div className="text-center p-4 text-xs text-[var(--text-secondary)] italic">
                  Role-based view active.<br/>Restricted system access.
              </div>
          )}

      </div>

      {/* FOOTER: SYSTEM CONTROLS */}
      <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-primary)] relative z-10">
          
          {/* Identity Switcher */}
          <div className="mb-4">
            <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">
                Identity Profile
            </div>
            <div className="grid grid-cols-4 gap-1">
                <RoleMiniButton role="VISITOR" current={userProfile.role} onClick={() => onRoleChange('VISITOR')} label="VIS" />
                <RoleMiniButton role="MEMBER" current={userProfile.role} onClick={() => onRoleChange('MEMBER')} label="MEM" />
                <RoleMiniButton role="CAPTAIN" current={userProfile.role} onClick={() => onRoleChange('CAPTAIN')} label="CPT" />
                <RoleMiniButton role="GENERAL_MANAGER" current={userProfile.role} onClick={() => onRoleChange('GENERAL_MANAGER')} label="GM" />
            </div>
          </div>

          {/* Node Switcher */}
          <div>
            <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">
                Active Node
            </div>
            <div className="space-y-1">
                {FEDERATION_REGISTRY.peers.map((tenant) => (
                    <TenantButton 
                        key={tenant.id}
                        tenantId={tenant.id}
                        currentTenantId={activeTenantId}
                        onClick={() => onTenantSwitch(tenant.id)}
                        label={tenant.name}
                    />
                ))}
            </div>
          </div>
      </div>
    </div>
  );
};
