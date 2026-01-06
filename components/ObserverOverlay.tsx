
import React, { useState, useEffect, useRef } from 'react';
import { 
    Activity, Brain, X, Terminal, Zap, Server, Layers,
    Shield, Anchor, CreditCard, Scale, Network, Sparkles, Globe, 
    Ship, Wrench, Building2, Box, Plane, CloudRain, Wallet, 
    ShoppingBag, Truck, FileCheck, Users, Radar, ScanFace, 
    Martini, Mic2, Cpu, Filter
} from 'lucide-react';
import { AgentTraceLog } from '../types';

interface ObserverOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  traces: AgentTraceLog[];
}

// ... Helper Icons ...
const SettingsIcon = (props: any) => <Terminal {...props} />;
const MicroscopeIcon = (props: any) => <Filter {...props} />;
const RadioIcon = (props: any) => <Activity {...props} />;
const TieIcon = (props: any) => <FileCheck {...props} />;
const TrendingUpIcon = (props: any) => <Activity {...props} />;
const CalendarIcon = (props: any) => <Box {...props} />;

// --- THE FULL 24-AGENT ROSTER ---
const AGENT_ROSTER = [
  // GROUP 1: ADA.STARGATE (THE BRAIN)
  { id: 'ada.stargate', label: 'CORE ORCHESTRATOR', icon: Brain, color: 'text-purple-400', group: 'STARGATE' },
  { id: 'ada.system', label: 'SYSTEM OPS', icon: SettingsIcon, color: 'text-purple-400', group: 'STARGATE' },
  { id: 'ada.federation', label: 'FEDERATION LINK', icon: Globe, color: 'text-purple-400', group: 'STARGATE' },
  { id: 'ada.it', label: 'IT / CYBER', icon: Cpu, color: 'text-purple-400', group: 'STARGATE' },
  { id: 'ada.analytics', label: 'PREDICTIVE AI', icon: Sparkles, color: 'text-purple-400', group: 'STARGATE' },
  { id: 'ada.science', label: 'DATA SCIENCE', icon: MicroscopeIcon, color: 'text-purple-400', group: 'STARGATE' },
  { id: 'ada.vhf', label: 'VOICE BRIDGE', icon: RadioIcon, color: 'text-purple-400', group: 'STARGATE' },
  { id: 'ada.executive', label: 'CHIEF OF STAFF', icon: TieIcon, color: 'text-purple-400', group: 'STARGATE' },

  // GROUP 2: ADA.MARINA (THE OPERATOR)
  { id: 'ada.marina', label: 'HARBOUR MASTER', icon: Anchor, color: 'text-cyan-400', group: 'MARINA' },
  { id: 'ada.sea', label: 'NAVIGATOR (AIS)', icon: Ship, color: 'text-cyan-400', group: 'MARINA' },
  { id: 'ada.technic', label: 'TECHNICAL OPS', icon: Wrench, color: 'text-cyan-400', group: 'MARINA' },
  { id: 'ada.facility', label: 'INFRASTRUCTURE', icon: Building2, color: 'text-cyan-400', group: 'MARINA' },
  { id: 'ada.berth', label: 'BERTH ALLOCATOR', icon: Box, color: 'text-cyan-400', group: 'MARINA' },
  { id: 'ada.robotics', label: 'ROBOTICS FLEET', icon: Plane, color: 'text-cyan-400', group: 'MARINA' },
  { id: 'ada.weather', label: 'METOCEAN', icon: CloudRain, color: 'text-cyan-400', group: 'MARINA' },

  // GROUP 3: ADA.FINANCE (THE CFO)
  { id: 'ada.finance', label: 'CFO LEDGER', icon: Wallet, color: 'text-emerald-400', group: 'FINANCE' },
  { id: 'ada.commercial', label: 'COMMERCIAL', icon: ShoppingBag, color: 'text-emerald-400', group: 'FINANCE' },
  { id: 'ada.yield', label: 'YIELD ENGINE', icon: TrendingUpIcon, color: 'text-emerald-400', group: 'FINANCE' },
  { id: 'ada.reservations', label: 'BOOKING ENGINE', icon: CalendarIcon, color: 'text-emerald-400', group: 'FINANCE' },

  // GROUP 4: ADA.LEGAL (THE COUNSEL)
  { id: 'ada.legal', label: 'GENERAL COUNSEL', icon: Scale, color: 'text-indigo-400', group: 'LEGAL' },
  { id: 'ada.hr', label: 'HUMAN RESOURCES', icon: Users, color: 'text-indigo-400', group: 'LEGAL' },
  { id: 'ada.security', label: 'SECURITY CHIEF', icon: Shield, color: 'text-red-500', group: 'LEGAL' },
  { id: 'ada.shield', label: 'DOME DEFENSE', icon: Radar, color: 'text-red-500', group: 'LEGAL' },
  { id: 'ada.passkit', label: 'IDENTITY', icon: ScanFace, color: 'text-indigo-400', group: 'LEGAL' },

  // GROUP 5: SERVICES (FRONT OF HOUSE)
  { id: 'ada.concierge', label: 'GUEST EXPERIENCE', icon: Martini, color: 'text-pink-400', group: 'SERVICES' },
  { id: 'ada.congress', label: 'EVENT MANAGER', icon: Mic2, color: 'text-pink-400', group: 'SERVICES' },
  { id: 'ada.travel', label: 'LOGISTICS', icon: Truck, color: 'text-pink-400', group: 'SERVICES' },
];

export const ObserverOverlay: React.FC<ObserverOverlayProps> = ({ isOpen, onClose, traces }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeAgents, setActiveAgents] = useState<Record<string, number>>({});
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
      if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [traces, activeFilter]);

  useEffect(() => {
      const now = Date.now();
      const recentLogs = traces.slice(-5);
      const currentlyActive: Record<string, number> = { ...activeAgents };
      
      recentLogs.forEach(l => {
          const matchedAgent = AGENT_ROSTER.find(a => l.node.includes(a.id));
          if (matchedAgent) currentlyActive[matchedAgent.id] = now;
      });

      Object.keys(currentlyActive).forEach(key => {
          if (now - currentlyActive[key] > 2000) delete currentlyActive[key];
      });

      setActiveAgents(currentlyActive);
  }, [traces]);

  if (!isOpen) return null;

  const filteredTraces = traces.filter(trace => {
      if (activeFilter === 'ALL') return true;
      const matchedAgent = AGENT_ROSTER.find(a => trace.node.includes(a.id));
      return matchedAgent?.group === activeFilter;
  });

  const getLogStyle = (step: string) => {
      switch(step) {
          case 'THINKING': return { border: 'border-l-purple-500', bg: 'bg-purple-500/5', text: 'text-purple-300', badge: 'bg-purple-500/20 text-purple-300' };
          case 'TOOL_EXECUTION': return { border: 'border-l-amber-500', bg: 'bg-amber-500/5', text: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300' };
          case 'OUTPUT': return { border: 'border-l-emerald-500', bg: 'bg-emerald-500/5', text: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300' };
          case 'CRITICAL': return { border: 'border-l-red-500', bg: 'bg-red-500/10', text: 'text-red-300', badge: 'bg-red-500/20 text-red-300' };
          default: return { border: 'border-l-zinc-700', bg: 'bg-zinc-900', text: 'text-zinc-400', badge: 'bg-zinc-800 text-zinc-500' };
      }
  };

  const groups = ['STARGATE', 'MARINA', 'FINANCE', 'LEGAL', 'SERVICES'];

  return (
    <div className="fixed inset-0 z-[300] bg-[#050b14] text-zinc-300 font-mono text-xs flex flex-col animate-in fade-in duration-200 backdrop-blur-sm">
      <div className="h-14 border-b border-white/10 bg-[#020617] flex items-center justify-between px-6 shrink-0 shadow-lg z-20">
          <div className="flex items-center gap-4">
              <Activity className="text-emerald-500 animate-pulse" size={18} />
              <h1 className="font-bold tracking-widest text-white uppercase text-sm">Ada Cognitive Observer <span className="text-zinc-600">v5.5</span></h1>
          </div>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                  <span className="text-[10px] font-bold text-emerald-400">{AGENT_ROSTER.length} AGENTS ONLINE</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={18} /></button>
          </div>
      </div>

      <div className="flex-1 grid grid-cols-12 overflow-hidden">
          <div className="col-span-3 border-r border-white/10 bg-[#020617] p-0 flex flex-col overflow-y-auto custom-scrollbar">
              {groups.map(group => (
                  <div key={group} className="border-b border-white/5 last:border-0">
                      <div className="px-4 py-2 bg-white/5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest sticky top-0 backdrop-blur-sm z-10 flex justify-between">
                          <span>ADA.{group}</span>
                          <span className="text-[8px] opacity-50">{AGENT_ROSTER.filter(a => a.group === group).length} NODES</span>
                      </div>
                      <div className="p-2 space-y-1">
                          {AGENT_ROSTER.filter(a => a.group === group).map(agent => {
                              const isActive = !!activeAgents[agent.id];
                              const Icon = agent.icon;
                              return (
                                  <div key={agent.id} className={`px-3 py-2 rounded-lg border transition-all duration-200 flex items-center justify-between ${isActive ? 'bg-white/10 border-white/20 shadow-glow translate-x-1' : 'bg-transparent border-transparent opacity-60'}`}>
                                      <div className="flex items-center gap-3">
                                          <div className={`p-1.5 rounded bg-black/40 ${isActive ? 'text-white' : agent.color}`}><Icon size={12} /></div>
                                          <div className={`font-bold text-[10px] ${isActive ? 'text-white' : 'text-zinc-400'}`}>{agent.id}</div>
                                      </div>
                                      <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-800'}`}></div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              ))}
          </div>

          <div className="col-span-6 bg-[#050b14] flex flex-col relative border-r border-white/10">
              <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-[#020617]/80 backdrop-blur z-10">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      <button onClick={() => setActiveFilter('ALL')} className={`px-3 py-1 rounded text-[9px] font-bold border ${activeFilter === 'ALL' ? 'bg-white text-black' : 'border-transparent text-zinc-500'}`}>ALL</button>
                      {groups.map(g => (
                          <button key={g} onClick={() => setActiveFilter(g)} className={`px-2 py-1 rounded text-[9px] font-bold border transition-all ${activeFilter === g ? 'bg-white/10 text-white border-white/20' : 'border-transparent text-zinc-600'}`}>{g}</button>
                      ))}
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3" ref={scrollRef}>
                  {filteredTraces.map((trace, idx) => {
                      const style = getLogStyle(trace.step);
                      return (
                          <div key={idx} className="flex gap-4 group animate-in slide-in-from-bottom-2">
                              <div className="flex flex-col items-center pt-2 opacity-50">
                                  <div className={`w-1.5 h-1.5 rounded-full ${style.text.replace('text-', 'bg-')}`}></div>
                                  <div className="w-px h-full bg-white/5 my-1"></div>
                              </div>
                              <div className={`flex-1 rounded-lg border-l-2 p-2.5 ${style.border} ${style.bg} border-t border-r border-b border-white/5`}>
                                  <div className="flex justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                          <span className={`px-1.5 py-px rounded text-[9px] font-bold ${style.badge}`}>{trace.step}</span>
                                          <span className="text-indigo-400 font-bold text-[10px]">@{trace.node}</span>
                                      </div>
                                      <span className="text-zinc-600 text-[9px]">{trace.timestamp.split(' ')[0]}</span>
                                  </div>
                                  <div className={`text-xs font-mono ${style.text}`}>{typeof trace.content === 'object' ? JSON.stringify(trace.content) : trace.content}</div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
          
          <div className="col-span-3 bg-[#020617] p-5">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[9px] text-zinc-500 uppercase mb-2 font-bold tracking-wider">System Load</div>
                  <div className="flex items-end gap-1 h-16 border-b border-white/10 pb-1">
                      {AGENT_ROSTER.map((a, i) => (
                          <div key={i} className={`flex-1 rounded-t-sm transition-all duration-500 ${activeAgents[a.id] ? 'bg-emerald-500' : 'bg-indigo-500/20'}`} style={{ height: `${Math.random() * 80 + 20}%` }} title={a.id}></div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};