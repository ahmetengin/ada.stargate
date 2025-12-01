
import React from 'react';
import { UserProfile, TenantConfig } from '../types';
import { FEDERATION_REGISTRY } from '../services/config';
import { 
    Radio, Shield, Anchor, Wifi, Zap, Battery, Signal, UserCheck, 
    CreditCard, ScanLine, Activity, CheckCircle2, 
    LifeBuoy, Droplets, Wrench, Navigation, 
    Utensils, Calendar, MapPin, Car, Info, ShoppingBag, Globe, LogIn
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
    <div className="h-full w-full flex flex-col bg-zinc-50 dark:bg-gunmetal-950 overflow-y-auto custom-scrollbar transition-colors duration-300 border-r border-zinc-200 dark:border-white/5">
      {/* Header */}
      <div className="p-6 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 text-zinc-800 dark:text-zinc-200 mb-1 cursor-pointer group" onClick={onPulseClick}>
            <div className="w-10 h-10 bg-gradient-to-br from-zinc-800 to-black dark:from-white/10 dark:to-white/5 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                <Anchor size={20} className="text-teal-500" />
            </div>
            <div>
                <h2 className="text-sm font-black tracking-widest uppercase">ADA STARGATE</h2>
                <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {tenantNetworkName}
                </div>
            </div>
        </div>
      </div>

      {/* DYNAMIC CONTENT AREA BASED ON ROLE */}
      <div className="px-4 py-2 flex-1 space-y-6">
          
          {/* 1. GENERAL MANAGER VIEW: The "Matrix" (System Nodes) */}
          {isGM && (
              <>
                <div className="bg-zinc-100/50 dark:bg-white/5 rounded-xl p-4 border border-zinc-200 dark:border-white/5">
                    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity size={12} /> Neural Network Status
                    </div>
                    <div className="space-y-3">
                        {nodes.map((node) => {
                        const isWorking = nodeStates[node.id] === 'working';
                        return (
                            <div key={node.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isWorking ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500'}`} />
                                    <span className={`text-[10px] font-mono font-bold uppercase transition-colors ${isWorking ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500'}`}>
                                        {node.label}
                                    </span>
                                </div>
                                {isWorking && <ActivityIcon />}
                            </div>
                        );
                        })}
                    </div>
                </div>
              </>
          )}

          {/* 2. CAPTAIN VIEW: "My Ship" & Port Services */}
          {isCaptain && (
              <>
                {/* Vessel Status Card */}
                <div className="bg-zinc-900 text-white rounded-xl p-4 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10"><Anchor size={48} /></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">COMMAND</span>
                            <span className="text-[9px] font-bold bg-indigo-500 px-2 py-0.5 rounded">S/Y Phisedelia</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-zinc-400 text-[10px]"><Zap size={10}/> Shore Power</div>
                                <span className="text-[10px] font-bold text-emerald-400">CONNECTED</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-zinc-400 text-[10px]"><Battery size={10}/> Service Bank</div>
                                <span className="text-[10px] font-bold text-yellow-400">24.4V</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-zinc-400 text-[10px]"><CreditCard size={10}/> Account</div>
                                <span className="text-[10px] font-bold text-zinc-200">CLEAR</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Port Services Menu */}
                <div>
                    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2 pl-2">Port Services</div>
                    <div className="space-y-1">
                        <MenuButton icon={LifeBuoy} label="Request Tender" />
                        <MenuButton icon={Droplets} label="Fuel & Water" />
                        <MenuButton icon={Wrench} label="Technical Support" />
                        <MenuButton icon={Navigation} label="Flight Plan" />
                    </div>
                </div>
              </>
          )}

          {/* 3. MEMBER VIEW: "Digital Pass" & Concierge */}
          {isMember && (
              <>
                {/* Guest Pass Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-4 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-20"><ScanLine size={48}/></div>
                    <div className="relative z-10">
                        <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">ADA PASS</div>
                        <div className="text-lg font-bold mb-4">{userProfile.name}</div>
                        
                        <div className="flex items-center gap-2 bg-white/10 p-2 rounded backdrop-blur-sm">
                            <Wifi size={14} className="text-emerald-300"/>
                            <div>
                                <div className="text-[9px] opacity-60 uppercase">Wi-Fi Access</div>
                                <div className="text-[10px] font-mono font-bold">WIM_GUEST / Sailor25</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Concierge Menu */}
                <div>
                    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2 pl-2">Member Concierge</div>
                    <div className="space-y-1">
                        <MenuButton icon={Car} label="Valet / Taxi" />
                        <MenuButton icon={Utensils} label="Dining Reservations" />
                        <MenuButton icon={Info} label="Concierge Desk" />
                    </div>
                </div>
              </>
          )}

          {/* 4. VISITOR VIEW: "Public Info" */}
          {isVisitor && (
              <>
                {/* Welcome Card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm text-center">
                    <div className="text-lg font-bold text-slate-800 dark:text-white mb-2">Welcome to WIM</div>
                    <p className="text-xs text-zinc-500 mb-4">Discover the marina lifestyle. Login to access exclusive services.</p>
                    <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                        <LogIn size={12} /> Member Login
                    </button>
                </div>

                {/* Public Menu */}
                <div>
                    <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2 pl-2">Explore Marina</div>
                    <div className="space-y-1">
                        <MenuButton icon={MapPin} label="Marina Map" />
                        <MenuButton icon={ShoppingBag} label="Shops & Brands" />
                        <MenuButton icon={Utensils} label="Restaurants" />
                        <MenuButton icon={Calendar} label="Events" />
                    </div>
                </div>
              </>
          )}

      </div>

      {/* VHF MONITOR (GM ONLY) */}
      {isGM && (
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-white/5">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] uppercase tracking-wider">
                    <Radio size={12} /> Radio Monitor
                </div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div className="bg-zinc-900 rounded p-2 border border-zinc-800 relative overflow-hidden">
                <div className="flex justify-between items-end relative z-10">
                    <div className="text-emerald-500 font-mono text-lg leading-none font-bold">SCANNING</div>
                    <div className="flex gap-0.5 items-end h-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-1 bg-emerald-500/50 animate-pulse" style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* FOOTER: SYSTEM CONTROLS */}
      <div className="px-4 py-4 border-t border-zinc-200 dark:border-white/5 bg-zinc-100/50 dark:bg-black/20">
          
          {/* Identity Switcher */}
          <div className="mb-4">
            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Shield size={10} /> Active Identity
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
            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
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

const MenuButton = ({ icon: Icon, label }: { icon: any, label: string }) => (
    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left group">
        <Icon size={14} className="text-zinc-400 group-hover:text-current transition-colors" />
        {label}
    </button>
);

const RoleMiniButton = ({ role, current, onClick, label }: any) => (
    <button
        onClick={onClick}
        className={`px-1 py-1.5 rounded text-[8px] font-bold uppercase tracking-wider text-center transition-all ${
            current === role 
            ? 'bg-zinc-800 dark:bg-white text-white dark:text-black shadow-md' 
            : 'text-zinc-500 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10'
        }`}
    >
        {label}
    </button>
);

const TenantButton = ({ tenantId, currentTenantId, onClick, label }: any) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex justify-between items-center transition-all ${
            currentTenantId === tenantId 
            ? 'bg-teal-600 dark:bg-teal-500 text-white shadow-md' 
            : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-white/5'
        }`}
    >
        <span className="truncate">{label}</span>
        {currentTenantId === tenantId && <CheckCircle2 size={10} />}
    </button>
);

const ActivityIcon = () => (
    <div className="flex gap-0.5">
        <div className="w-0.5 h-2 bg-zinc-400 animate-pulse"></div>
        <div className="w-0.5 h-3 bg-zinc-400 animate-pulse delay-75"></div>
        <div className="w-0.5 h-1.5 bg-zinc-400 animate-pulse delay-150"></div>
    </div>
);
