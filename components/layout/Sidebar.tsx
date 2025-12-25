
import React from 'react';
import { UserProfile } from '../../types';
import { 
    Anchor, Radio, CreditCard, Scale, Brain, Activity, Shield, Zap, Box, Terminal
} from 'lucide-react';

export type SidebarTabId = 'ops' | 'fleet' | 'facility' | 'congress' | 'guest_checkin' | 'vhf' | 'observer' | 'presenter' | 'crm' | 'tech' | 'hr' | 'analytics' | 'commercial' | 'berths' | 'none';

interface SidebarProps {
  userProfile: UserProfile;
  activeTab: SidebarTabId;
  onTabChange: (tab: SidebarTabId) => void;
  onRoleChange: (role: string) => void;
  onPulseClick?: () => void;
}

const SectionHeader = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
    <h3 className={`text-[10px] font-black ${color} uppercase tracking-widest mb-3 pl-2 border-l-2 border-current flex items-center gap-2 mt-6 first:mt-0`}>
        <Icon size={12} />
        {title}
    </h3>
);

const NodeItem = ({ id, label, state, onClick }: { id: string, label: string, state: string, onClick?: () => void }) => (
    <div onClick={onClick} className="flex items-center justify-between px-3 py-2 group cursor-pointer hover:bg-white/5 rounded-lg transition-all active:bg-white/10">
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${state === 'working' ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_orange]' : 'bg-emerald-500/50'}`}></div>
            <span className="text-[11px] font-mono text-slate-400 group-hover:text-slate-200">{label}</span>
        </div>
        <span className="text-[8px] font-mono text-slate-600 uppercase opacity-0 group-hover:opacity-100 transition-opacity">{id}</span>
    </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
  userProfile,
  onRoleChange,
  onPulseClick,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="h-full w-full flex flex-col bg-[#020617] border-r border-white/5 text-slate-400 select-none overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-[#050b14]/50">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={onPulseClick}>
            <div className="relative">
                <div className="w-12 h-12 bg-indigo-950/30 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-500/50 transition-all duration-500 shadow-[0_0_20px_rgba(79,70,229,0.1)]">
                    <Anchor size={24} className="text-indigo-400" />
                </div>
            </div>
            <div>
                <h2 className="text-xl font-display font-bold tracking-widest text-white leading-none">ADA<span className="text-indigo-500">STARGATE</span></h2>
                <div className="text-[9px] text-slate-600 font-mono tracking-wider mt-1 uppercase">v5.5 HYPERSCALE</div>
            </div>
        </div>
      </div>

      {/* BIG 4 SOVEREIGN DOMAINS */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-2">
          
          <SectionHeader title="ADA.MARINA (Operatör)" icon={Zap} color="text-cyan-400" />
          <NodeItem id="OPS" label="Operasyon Masası" state="idle" onClick={() => onTabChange('ops')} />
          <NodeItem id="TRAF" label="Trafik Kontrol" state="idle" onClick={() => onTabChange('ops')} />
          <NodeItem id="PEDA" label="Akıllı Pedestallar" state="idle" onClick={() => onTabChange('facility')} />
          <NodeItem id="BOAT" label="Çekek / Lift" state="idle" onClick={() => onTabChange('tech')} />

          <SectionHeader title="ADA.FINANCE (CFO)" icon={CreditCard} color="text-emerald-400" />
          <NodeItem id="COMM" label="Ticari Yönetim" state="idle" onClick={() => onTabChange('commercial')} />
          <NodeItem id="INVX" label="Fatura Otomasyonu" state="working" onClick={() => onTabChange('commercial')} />
          <NodeItem id="YIEL" label="Dinamik Fiyatlama" state="idle" onClick={() => onTabChange('berths')} />

          <SectionHeader title="ADA.LEGAL (Counsel)" icon={Scale} color="text-indigo-400" />
          <NodeItem id="HR" label="İnsan Kaynakları" state="idle" onClick={() => onTabChange('hr')} />
          <NodeItem id="RAGX" label="Hukuki RAG" state="idle" onClick={() => onTabChange('ops')} />
          <NodeItem id="ISPS" label="Güvenlik & ISPS" state="idle" onClick={() => onTabChange('ops')} />

          <SectionHeader title="ADA.STARGATE (Beyin)" icon={Brain} color="text-purple-400" />
          <NodeItem id="ROUT" label="Orkestrasyon" state="working" onClick={() => onTabChange('analytics')} />
          <NodeItem id="ANLY" label="TabPFN Analitik" state="idle" onClick={() => onTabChange('analytics')} />

      </div>

      {/* Footer System Controls */}
      <div className="p-4 border-t border-white/5 bg-[#050b14]">
          <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onTabChange('observer')} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 active:scale-95">
                <Activity size={16} className="text-slate-400" />
                <span className="text-[8px] font-black uppercase">Observer</span>
              </button>
              <button onClick={() => onTabChange('vhf')} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/20 active:scale-95">
                <Radio size={16} className="text-red-500" />
                <span className="text-[8px] font-black uppercase">Radio_Link</span>
              </button>
          </div>
      </div>
    </div>
  );
}
