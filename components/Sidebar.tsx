
import React from 'react';
import { UserProfile, TenantConfig } from '../types';
import { FEDERATION_REGISTRY } from '../services/config';
import { 
    Radio, Shield, Anchor, Wifi, Zap, Battery, Signal, UserCheck, 
    CreditCard, ScanLine, Activity, CheckCircle2, 
    LifeBuoy, Droplets, Wrench, Navigation, 
    Utensils, Calendar, MapPin, Car, Info, ShoppingBag, Globe, LogIn, ChevronRight
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
  activeTenantId
}) => {

  const nodes = [
    { id: 'ada.sea', label: 'SEA (COLREGs)' },
    { id: 'ada.marina', label: 'MARINA OPS' },
    { id: 'ada.finance', label: 'FINANCE' },
    { id: 'ada.customer', label: 'CRM / GUEST' },
    { id: 'ada.passkit', label: 'PASSKIT' },
    { id: 'ada.security', label: 'SECURITY' },
    { id: 'ada.technic', label: 'TECHNIC' },
    { id: 'ada.hr', label: 'HR / STAFF' },
  ];

  const isGM = userProfile.role === 'GENERAL_MANAGER';
  const isCaptain = userProfile.role === 'CAPTAIN';
  const isMember = userProfile.role === 'MEMBER';
  const isVisitor = userProfile.role === 'VISITOR';

  const activeTenant = FEDERATION_REGISTRY.peers.find(p => p.id === activeTenantId);
  const tenantNetworkName = activeTenant ? activeTenant.network : 'Unknown Network';

  return (
    <div className="h-full w-full flex flex-col bg-[#020617]/40 backdrop-blur-md border-r border-cyan-500/10 text-slate-300 relative overflow-hidden">
      
      {/* Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-48 bg-cyan-500/10 blur-[80px] pointer-events-none mix-blend-screen"></div>

      {/* Header */}
      <div className="p-6 flex-shrink-0 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={onPulseClick}>
            <div className="relative">
                <div className="w-12 h-12 bg-cyan-950/30 rounded-xl flex items-center justify-center border border-cyan-500/30 group-hover:border-cyan-400 transition-all duration-500 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <Anchor size={24} className="text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#020617] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></div>
                </div>
            </div>
            <div>
                <h2 className="text-xl font-display font-bold tracking-widest text-white leading-none neon-text">ADA<span className="text-cyan-300">STARGATE</span></h2>
                <div className="text-[10px] text-cyan-500/70 font-mono tracking-wider mt-1 uppercase">
                    {tenantNetworkName}
                </div>
            </div>
        </div>
      </div>

      {/* DYNAMIC CONTENT AREA BASED ON ROLE */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8 relative z-10">
          
          {/* 1. GENERAL MANAGER VIEW: The "Matrix" (System Nodes) */}
          {isGM && (
              <div className="space-y-4">
                <SectionHeader title="System Status" />
                <div className="grid grid-cols-1 gap-1">
                    {nodes.map((node) => {
                    const isWorking = nodeStates[node.id] === 'working';
                    return (
                        <div key={node.id} className="flex items-center justify-between group py-2.5 px-3 hover:bg-cyan-500/5 rounded-lg transition-all border border-transparent hover:border-cyan-500/20">
                            <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${isWorking ? 'bg-amber-400 shadow-[0_0_8px_orange]' : 'bg-cyan-400 shadow-[0_0_8px_cyan]'}`} />
                                <span className={`text-[11px] font-mono font-bold uppercase transition-colors ${isWorking ? 'text-amber-300' : 'text-slate-300 group-hover:text-cyan-100'}`}>
                                    {node.label}
                                </span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                {isWorking ? <ActivityIcon color="text-amber-400" /> : <div className="text-[9px] text-cyan-600 font-mono">OK</div>}
                            </div>
                        </div>
                    );
                    })}
                </div>
              </div>
          )}

          {/* 2. CAPTAIN VIEW: "My Ship" & Port Services */}
          {isCaptain && (
              <div className="space-y-6">
                {/* Vessel Status HUD */}
                <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
                    <div className="absolute top-0 right-0 p-2 opacity-10 text-cyan-400"><Anchor size={64} /></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4 border-b border-cyan-500/20 pb-2">
                            <span className="text-[10px] font-display font-bold text-cyan-300 uppercase tracking-widest text-shadow">COMMAND</span>
                            <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-200 px-2 py-0.5 rounded border border-cyan-500/30">S/Y Phisedelia</span>
                        </div>
                        <div className="space-y-2 font-mono text-[10px]">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Power</span>
                                <span className="text-emerald-400 font-bold shadow-green-glow">CONNECTED</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Battery</span>
                                <span className="text-amber-400 font-bold">24.4V</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Account</span>
                                <span className="text-white font-bold">CLEAR</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Port Services Menu */}
                <div>
                    <SectionHeader title="Services" />
                    <div className="space-y-1">
                        <MenuButton icon={LifeBuoy} label="Request Tender" />
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
                <div className="rounded-xl p-0.5 bg-gradient-to-br from-indigo-500/50 to-purple-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                    <div className="bg-[#020617]/90 rounded-lg p-4 relative overflow-hidden backdrop-blur-md">
                        <div className="absolute top-0 right-0 p-2 opacity-20 text-indigo-400"><ScanLine size={48}/></div>
                        <div className="text-[9px] font-display font-bold text-indigo-300 uppercase tracking-widest mb-1">ADA PASS</div>
                        <div className="text-lg font-bold text-white mb-4 neon-text">{userProfile.name}</div>
                        
                        <div className="flex items-center gap-2 bg-white/5 p-2 rounded border border-white/10">
                            <Wifi size={14} className="text-emerald-400"/>
                            <div>
                                <div className="text-[8px] text-slate-400 uppercase">Wi-Fi Access</div>
                                <div className="text-[10px] font-mono font-bold text-emerald-300">WIM_GUEST / Sailor25</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Concierge Menu */}
                <div>
                    <SectionHeader title="Concierge" />
                    <div className="space-y-1">
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
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-md shadow-lg">
                    <div className="text-lg font-display font-bold text-white mb-2 neon-text">Welcome to WIM</div>
                    <p className="text-xs text-slate-300 mb-4 leading-relaxed">Discover the marina lifestyle. Login to access exclusive services.</p>
                    <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]">
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
        <div className="px-6 py-4 border-t border-cyan-500/10 relative z-10 bg-black/40 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-[10px] uppercase tracking-wider font-mono">
                    <Radio size={12} /> Live Spectrum
                </div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_cyan]"></div>
            </div>
            <div className="h-8 flex items-end gap-0.5 opacity-80">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="flex-1 bg-cyan-500/40 animate-pulse shadow-[0_0_5px_cyan]" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s` }}></div>
                ))}
            </div>
        </div>
      )}

      {/* FOOTER: SYSTEM CONTROLS */}
      <div className="p-4 border-t border-cyan-500/10 bg-[#020617]/80 relative z-10">
          
          {/* Identity Switcher */}
          <div className="mb-4">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
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
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
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
    <h3 className="text-[10px] font-bold text-cyan-600/80 uppercase tracking-widest mb-2 pl-2 border-l-2 border-cyan-600">
        {title}
    </h3>
);

const MenuButton = ({ icon: Icon, label }: { icon: any, label: string }) => (
    <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all group border border-transparent hover:border-cyan-500/20">
        <div className="flex items-center gap-3">
            <Icon size={14} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
            {label}
        </div>
        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-cyan-500" />
    </button>
);

const RoleMiniButton = ({ role, current, onClick, label }: any) => (
    <button
        onClick={onClick}
        className={`px-1 py-1.5 rounded text-[8px] font-bold uppercase tracking-wider text-center transition-all border ${
            current === role 
            ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
            : 'text-slate-500 border-white/5 hover:bg-white/5 hover:text-slate-300'
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
            ? 'bg-cyan-950/30 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(34,211,238,0.1)]' 
            : 'text-slate-500 border-transparent hover:bg-white/5'
        }`}
    >
        <span className="truncate">{label}</span>
        {currentTenantId === tenantId && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_cyan]"></div>}
    </button>
);

const ActivityIcon = ({ color }: { color: string }) => (
    <div className="flex gap-0.5">
        <div className={`w-0.5 h-2 ${color} animate-pulse`}></div>
        <div className={`w-0.5 h-3 ${color} animate-pulse delay-75`}></div>
        <div className={`w-0.5 h-1.5 ${color} animate-pulse delay-150`}></div>
    </div>
);
