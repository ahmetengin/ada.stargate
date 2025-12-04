
import React from 'react';
import { UserProfile, TenantConfig } from '../../types';
import { FEDERATION_REGISTRY } from '../../services/config';
import { 
    Radio, Shield, Anchor, Wifi, Zap, Battery, Signal, UserCheck, 
    CreditCard, ScanLine, Activity, CheckCircle2, 
    LifeBuoy, Droplets, Wrench, Navigation, 
    Utensils, Calendar, MapPin, Car, Info, ShoppingBag, Globe, LogIn, ChevronRight, Scale, Brain, Bot, Projector
} from 'lucide-react';

interface SidebarProps {
  nodeStates: Record<string, 'connected' | 'working' | 'disconnected'>;
  activeChannel: string;
  isMonitoring: boolean;
  userProfile: UserProfile;
  onRoleChange: (role: string) => void;
  onVhfClick?: (channel: string) => void;
  onScannerClick?: () => void;
  onPulseClick?: () => void;
  onTenantSwitch: (tenantId: string) => void;
  onStartPresentation?: () => void; // NEW PROP
  activeTenantId: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  nodeStates, 
  activeChannel,
  isMonitoring,
  userProfile,
  onRoleChange,
  onScannerClick,
  onPulseClick,
  onTenantSwitch,
  onStartPresentation,
  activeTenantId
}) => {

  // THE BIG 4 CLUSTERS + NEW MODULES
  const nodeGroups = [
    { 
        title: 'ADA.MARINA (OPS)', 
        color: 'text-cyan-400',
        nodes: [
            { id: 'ada.marina', label: 'HARBOUR MASTER' },
            { id: 'ada.sea', label: 'SEA / COLREGS' },
            { id: 'ada.technic', label: 'BOATYARD / LIFT' },
            { id: 'ada.energy', label: 'GRID (MONACO PROTOCOL)' },
            { id: 'ada.robotics', label: 'ROBOTICS (SUBSEA/SKY)' } // NEW
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

            {/* Presentation Mode Trigger (Only for GM) */}
            {isGM && onStartPresentation && (
                <button 
                    onClick={onStartPresentation}
                    className="p-2 rounded-full bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white transition-all border border-indigo-500/30 hover:border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)] group"
                    title="Initiate Presentation Mode"
                >
                    <Projector size={18} className="group-hover:animate-pulse" />
                </button>
            )}
        </div>
      </div>

      {/* DYNAMIC CONTENT AREA BASED ON ROLE */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8 relative z-10">
          
          {/* 1. GENERAL MANAGER VIEW: The "Big 4" System Nodes */}
          {isGM && (
              <div className="space-y-6">
                {nodeGroups.map((group) => (
                    <div key={group.title}>
                        <h3 className={`text-[9px] font-bold uppercase tracking-widest mb-2 pl-2 border-l-2 ${group.color.replace('text', 'border')} ${group.color}`}>
                            {group.title}
                        </h3>
                        <div className="grid grid-cols-1 gap-1">
                            {group.nodes.map((node) => {
                                // Simulate random activity for visual effect if strict state missing
                                const isWorking = nodeStates[node.id] === 'working' || Math.random() > 0.95;
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
          )}

          {/* 2. CAPTAIN VIEW: "My Ship" & Port Services */}
          {isCaptain && (
              <div className="space-y-6">
                {/* Vessel Status HUD */}
                <div className="relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-white/50 dark:bg-cyan-950/20 p-4 shadow-sm">
                    <div className="absolute top-0 right-0 p-2 opacity-10 text-[var(--accent-color)]"><Anchor size={64} /></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4 border-b border-[var(--border-color)] pb-2">
                            <span className="text-[10px] font-display font-bold text-[var(--text-secondary)] uppercase tracking-widest">COMMAND</span>
                            <span className="text-[10px] font-mono font-bold bg-[var(--accent-color)] text-white px-2 py-0.5 rounded shadow-sm">S/Y Phisedelia</span>
                        </div>
                        <div className="space-y-2 font-mono text-[10px]">
                            <div className="flex justify-between items-center">
                                <span className="text-[var(--text-secondary)]">Power</span>
                                <span className="text-emerald-500 font-bold">CONNECTED</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[var(--text-secondary)]">Battery</span>
                                <span className="text-amber-500 font-bold">24.4V</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[var(--text-secondary)]">Account</span>
                                <span className="text-[var(--text-primary)] font-bold">CLEAR</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Port Services Menu */}
                <div>
                    <SectionHeader title="Services" />
                    <div className="space-y-1">
                        <MenuButton icon={LifeBuoy} label="Request Tender" />
                        <MenuButton icon={Bot} label="Drone Delivery" />
                        <MenuButton icon={Droplets} label="Fuel & Water" />
                        <MenuButton icon={Wrench} label="Technical Support" />
                        <MenuButton icon={Navigation} label="Flight Plan" />
                    </div>
                </div>
              </div>
          )}

          {/* 3. MEMBER VIEW: "Digital Pass" & Concierge */}
          {isMember && (
              <div className="space-y-6">
                {/* Guest Pass Card */}
                <div className="rounded-xl p-0.5 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md">
                    <div className="bg-[var(--bg-primary)] rounded-lg p-4 relative overflow-hidden backdrop-blur-md">
                        <div className="absolute top-0 right-0 p-2 opacity-20 text-indigo-400"><ScanLine size={48}/></div>
                        <div className="text-[9px] font-display font-bold text-indigo-500 dark:text-indigo-300 uppercase tracking-widest mb-1">ADA PASS</div>
                        <div className="text-lg font-bold text-[var(--text-primary)] mb-4">{userProfile.name}</div>
                        
                        <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-2 rounded border border-[var(--border-color)]">
                            <Wifi size={14} className="text-emerald-500"/>
                            <div>
                                <div className="text-[8px] text-[var(--text-secondary)] uppercase">Wi-Fi Access</div>
                                <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-300">WIM_GUEST / Sailor25</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Concierge Menu */}
                <div>
                    <SectionHeader title="Concierge" />
                    <div className="space-y-1">
                        <MenuButton icon={Bot} label="Drone Service" />
                        <MenuButton icon={Car} label="Valet / Taxi" />
                        <MenuButton icon={Utensils} label="Dining Reservations" />
                        <MenuButton icon={Info} label="Concierge Desk" />
                    </div>
                </div>
              </div>
          )}

          {/* 4. VISITOR VIEW: "Public Info" */}
          {isVisitor && (
              <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-white/50 dark:bg-white/5 border border-[var(--border-color)] rounded-xl p-4 text-center backdrop-blur-md shadow-sm">
                    <div className="text-lg font-display font-bold text-[var(--text-primary)] mb-2">Welcome to WIM</div>
                    <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">Discover the marina lifestyle. Login to access exclusive services.</p>
                    <button className="w-full bg-[var(--accent-color)] hover:bg-cyan-500 text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md">
                        <LogIn size={14} /> Member Login
                    </button>
                </div>

                {/* Public Menu */}
                <div>
                    <SectionHeader title="Explore" />
                    <div className="space-y-1">
                        <MenuButton icon={MapPin} label="Marina Map" />
                        <MenuButton icon={ShoppingBag} label="Shops & Brands" />
                        <MenuButton icon={Utensils} label="Restaurants" />
                        <MenuButton icon={Calendar} label="Events" />
                    </div>
                </div>
              </div>
          )}

      </div>

      {/* VHF MONITOR (GM ONLY) */}
      {isGM && (
        <div className="px-6 py-4 border-t border-[var(--border-color)] relative z-10 bg-[var(--bg-primary)] backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[var(--accent-color)] font-bold text-[10px] uppercase tracking-wider font-mono">
                    <Radio size={12} /> Live Spectrum
                </div>
                <div className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-pulse"></div>
            </div>
            <div className="h-8 flex items-end gap-0.5 opacity-80">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="flex-1 bg-[var(--accent-color)] opacity-40 animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s` }}></div>
                ))}
            </div>
        </div>
      )}

      {/* FOOTER: SYSTEM CONTROLS */}
      <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-primary)] relative z-10">
          
          {/* Identity Switcher */}
          <div className="mb-4">
            <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 flex items-center gap-2">
                <Shield size={10} /> Identity Profile
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
            <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 flex items-center gap-2">
                <Anchor size={10} /> Active Node
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

// --- SUB-COMPONENTS ---

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

const ActivityIcon = ({ color }: { color: string }) => (
    <div className="flex gap-0.5">
        <div className={`w-0.5 h-2 ${color} animate-pulse`}></div>
        <div className={`w-0.5 h-3 ${color} animate-pulse delay-75`}></div>
        <div className={`w-0.5 h-1.5 ${color} animate-pulse delay-150`}></div>
    </div>
);
