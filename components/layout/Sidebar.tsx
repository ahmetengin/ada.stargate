
import React from 'react';
import { UserProfile, UserRole } from '../../types';
import { 
    Anchor, Radio, Map, Activity, Zap, Cpu, Compass, Wind, Settings, Monitor, Hexagon, Terminal, Brain
} from 'lucide-react';

export type SidebarTabId = 'ops' | 'fleet' | 'facility' | 'congress' | 'guest_checkin' | 'vhf' | 'observer' | 'presenter' | 'crm' | 'tech' | 'hr' | 'analytics' | 'commercial' | 'berths' | 'chartplotter' | 'instruments' | 'system' | 'none';

interface SidebarProps {
  userProfile: UserProfile;
  activeTab: SidebarTabId;
  onTabChange: (tab: SidebarTabId) => void;
  onRoleChange: (role: string) => void;
  onPulseClick?: () => void;
}

const SectionHeader = ({ title, color = "text-tech-400" }: { title: string, color?: string }) => (
    <div className="flex items-center gap-2 px-4 mt-6 mb-2 opacity-80">
        <div className={`h-1 w-1 rounded-full bg-current ${color}`}></div>
        <div className={`h-px w-3 bg-current ${color}`}></div>
        <h3 className={`text-[10px] font-tech font-bold uppercase tracking-[0.2em] ${color} text-glow`}>
            {title}
        </h3>
    </div>
);

const NodeItem = ({ id, label, state, onClick, active, icon: Icon }: { id: string, label: string, state: string, onClick?: () => void, active?: boolean, icon?: any }) => (
    <div 
        onClick={onClick} 
        className={`group relative mx-2 mb-1 px-3 py-2.5 cursor-pointer transition-all duration-300 border border-transparent
        ${active 
            ? 'bg-tech-950/60 border-tech-500/30' 
            : 'hover:bg-tech-900/20 hover:border-tech-800/30'
        }`}
    >
        {/* Active Marker */}
        {active && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-tech-400 shadow-[0_0_10px_#2dd4bf]"></div>}
        
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`relative flex items-center justify-center w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'text-tech-400' : 'text-slate-600'}`}>
                     {Icon ? <Icon size={18} strokeWidth={1.5} /> : <Hexagon size={18} strokeWidth={1.5} />}
                </div>
                <div>
                    <div className={`text-[11px] font-tech font-bold uppercase tracking-wide leading-none transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-tech-200'}`}>
                        {label}
                    </div>
                    <div className="text-[8px] font-code text-slate-600 mt-0.5 group-hover:text-tech-600">
                        ::{id}
                    </div>
                </div>
            </div>
            
            {state === 'working' && (
                <div className="flex gap-0.5">
                    <div className="w-0.5 h-2 bg-neon-amber animate-pulse"></div>
                    <div className="w-0.5 h-3 bg-neon-amber animate-pulse delay-75"></div>
                    <div className="w-0.5 h-1.5 bg-neon-amber animate-pulse delay-150"></div>
                </div>
            )}
        </div>
    </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
  userProfile,
  onPulseClick,
  onTabChange,
  activeTab
}) => {
  const role = userProfile.role;
  const hasAccess = (allowedRoles: UserRole[]) => allowedRoles.includes(role);

  return (
    <div className="h-full w-full flex flex-col bg-void border-r border-tech-900/50 relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-grid-tech opacity-10 pointer-events-none"></div>

      {/* Header */}
      <div className="relative p-5 border-b border-tech-900/50 bg-void z-10">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={onPulseClick}>
            <div className="relative w-12 h-12 flex items-center justify-center bg-tech-950/50 rounded-lg border border-tech-800">
                <Anchor size={24} className="text-tech-400 relative z-10" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]"></div>
            </div>
            <div>
                <h2 className="text-xl font-tech font-bold tracking-widest text-white leading-none flex items-center gap-1">
                    ADA<span className="text-tech-500">.BBN</span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className="text-[9px] text-slate-500 font-code tracking-wider uppercase">
                        BAREBOAT.OS v5.5
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2 relative z-10">
          
          <SectionHeader title="BRIDGE :: NAV" color="text-cyan-400" />
          <NodeItem icon={Map} id="OPN-CPN" label="Chartplotter" state="idle" onClick={() => onTabChange('chartplotter')} active={activeTab === 'chartplotter'} />
          <NodeItem icon={Compass} id="NMEA-0183" label="Instruments" state="working" onClick={() => onTabChange('instruments')} active={activeTab === 'instruments'} />
          <NodeItem icon={Radio} id="AIS-VHF" label="Comms / AIS" state="idle" onClick={() => onTabChange('vhf')} active={activeTab === 'vhf'} />

          <SectionHeader title="VESSEL :: SYS" color="text-emerald-400" />
          <NodeItem icon={Cpu} id="RPI-CORE" label="System Monitor" state="idle" onClick={() => onTabChange('system')} active={activeTab === 'system'} />
          <NodeItem icon={Zap} id="PWR-MGMT" label="Power / Solar" state="idle" onClick={() => onTabChange('facility')} active={activeTab === 'facility'} />
          <NodeItem icon={Wind} id="GRIB-WX" label="Weather / GRIB" state="working" onClick={() => onTabChange('ops')} active={activeTab === 'ops'} />

          <SectionHeader title="LOGS :: DATA" color="text-purple-400" />
          <NodeItem icon={Terminal} id="SGN-K" label="SignalK Log" state="idle" onClick={() => onTabChange('observer')} active={activeTab === 'observer'} />
          <NodeItem icon={Settings} id="CFG-YAML" label="Configuration" state="idle" onClick={() => onTabChange('tech')} active={activeTab === 'tech'} />

      </div>

      {/* Footer / Tools */}
      <div className="p-3 border-t border-tech-900/50 bg-void z-10 space-y-2">
          
          {/* NEURAL OBSERVER BUTTON - HIGH VISIBILITY */}
          <button 
            onClick={() => onTabChange('observer')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded border transition-all duration-300 group relative overflow-hidden ${
                activeTab === 'observer' 
                ? 'bg-purple-900/40 border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                : 'bg-tech-950/80 border-tech-800 text-slate-400 hover:border-purple-500/50 hover:text-white'
            }`}
          >
             {/* Scanline effect inside button */}
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-[100%] group-hover:animate-[scan_1.5s_linear_infinite]"></div>
             
             <div className={`p-1.5 rounded-md ${activeTab === 'observer' ? 'bg-purple-500 text-white' : 'bg-zinc-800 group-hover:bg-purple-500/80 group-hover:text-white transition-colors'}`}>
                 <Brain size={16} />
             </div>
             <div className="flex flex-col items-start">
                 <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Neural Observer</span>
                 <span className="text-[8px] font-mono text-purple-400/80 mt-1">:: WATCH_THOUGHT_PROCESS</span>
             </div>
             <Activity size={14} className={`ml-auto ${activeTab === 'observer' ? 'text-purple-400 animate-pulse' : 'text-zinc-700 group-hover:text-purple-400'}`} />
          </button>

          <div className="flex items-center gap-2 px-3 py-2 bg-tech-950/50 rounded border border-tech-900 opacity-60">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
             <div className="flex flex-col">
                 <span className="text-[8px] text-slate-500 font-bold uppercase">SignalK Server</span>
                 <span className="text-[7px] text-tech-600 font-mono">192.168.1.4:3000</span>
             </div>
          </div>
      </div>
    </div>
  );
}
    