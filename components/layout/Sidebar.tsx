
import React from 'react';
import { UserProfile } from '../../types';
import { FEDERATION_REGISTRY } from '../../services/config';
import { 
    Anchor, ChevronRight, Projector, Activity, Radio, Users, Briefcase, UserCheck, Wrench
} from 'lucide-react';

export type SidebarTabId = 'vhf' | 'presenter' | 'crm' | 'tech' | 'hr' | 'observer' | 'none';

interface SidebarProps {
  nodeStates: Record<string, 'connected' | 'working' | 'disconnected'>;
  userProfile: UserProfile;
  activeTenantId: string;
  activeTab: SidebarTabId;
  onTabChange: (tabId: SidebarTabId) => void;
  onRoleChange: (role: string) => void;
  onPulseClick?: () => void;
  onTenantSwitch: (tenantId: string) => void;
}

const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-widest mb-2 pl-2 border-l-2 border-[var(--accent-color)]">
        {title}
    </h3>
);

interface PersonaButtonProps {
    icon: any;
    label: string;
    subtext: string;
    onClick: () => void;
    active?: boolean;
}

const PersonaButton: React.FC<PersonaButtonProps> = ({ icon: Icon, label, subtext, onClick, active }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all group mb-2 ${
            active 
            ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)] text-[var(--text-primary)]' 
            : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${active ? 'bg-[var(--accent-color)] text-white' : 'bg-white/10 text-[var(--text-secondary)] group-hover:text-[var(--accent-color)]'}`}>
                <Icon size={16} />
            </div>
            <div className="text-left">
                <div className="text-xs font-bold uppercase tracking-wider leading-none mb-1">{label}</div>
                <div className="text-[9px] opacity-60 font-mono">{subtext}</div>
            </div>
        </div>
        <ChevronRight size={14} className={`transition-transform ${active ? 'rotate-90 text-[var(--accent-color)]' : 'opacity-0 group-hover:opacity-100'}`} />
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

export const Sidebar: React.FC<SidebarProps> = ({ 
  userProfile,
  onRoleChange,
  onPulseClick,
  onTenantSwitch,
  activeTenantId,
  activeTab,
  onTabChange
}) => {

  const isGM = userProfile.role === 'GENERAL_MANAGER';
  const activeTenant = FEDERATION_REGISTRY.peers.find(p => p.id === activeTenantId) || FEDERATION_REGISTRY.peers[0];
  const tenantNetworkName = activeTenant ? activeTenant.network : 'Unknown Network';

  const menuItems: { id: SidebarTabId; label: string; subtext: string; icon: any }[] = [
      { id: 'vhf', label: 'VHF Operator', subtext: 'Voice & Radio Protocol', icon: Radio },
      { id: 'presenter', label: 'Presenter', subtext: 'Sales & Negotiation', icon: Projector },
      { id: 'crm', label: 'CRM Analyst', subtext: 'Customer Intelligence', icon: UserCheck },
      { id: 'tech', label: 'Tech Support', subtext: 'Equipment Repair & Guides', icon: Wrench },
      { id: 'hr', label: 'Team Lead', subtext: 'HR & Internal Ops', icon: Briefcase },
  ];

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
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative z-10">
          
          {/* GENERAL MANAGER VIEW */}
          {isGM ? (
              <div className="space-y-6">
                
                {/* 1. ADA PERSONAS (Modes) */}
                <div>
                    <SectionHeader title="Select Persona" />
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <PersonaButton
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                subtext={item.subtext}
                                active={activeTab === item.id}
                                onClick={() => onTabChange(item.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* 2. SYSTEM UTILITIES */}
                <div className="mt-6">
                    <SectionHeader title="System Utils" />
                    <button 
                        onClick={() => onTabChange('observer')}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group border ${
                            activeTab === 'observer' 
                            ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)] text-[var(--text-primary)]'
                            : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-primary)] border-transparent hover:border-[var(--border-color)]'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Activity size={14} />
                            Neural Observer
                        </div>
                    </button>
                </div>

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
