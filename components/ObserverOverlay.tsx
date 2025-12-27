
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

// --- THE FULL 24-AGENT ROSTER ---
const AGENT_REGISTRY = [
  // GROUP 1: ADA.STARGATE (THE BRAIN)
  { id: 'ada.stargate', label: 'CORE ORCHESTRATOR', icon: Brain, color: 'text-purple-400', group: 'STARGATE' },
  { id: 'ada.router', label: 'SEMANTIC ROUTER', icon: Network, color: 'text-purple-400', group: 'STARGATE' },
  { id: 'ada.seal', label: 'SEAL LEARNER', icon: Sparkles, color: 'text-purple-400', group: 'STARGATE' },
  { id: 'ada.maker', label: 'PYTHON WORKER', icon: Terminal, color: 'text-purple-400', group: 'STARGATE' },
  { id: 'ada.federation', label: 'FEDERATION LINK', icon: Globe, color: 'text-purple-400', group: 'STARGATE' },
  { id: 'ada.it', label: 'SYSTEM ADMIN', icon: Cpu, color: 'text-purple-400', group: 'STARGATE' },

  // GROUP 2: ADA.MARINA (THE OPERATOR)
  { id: 'ada.marina', label: 'HARBOUR MASTER', icon: Anchor, color: 'text-cyan-400', group: 'MARINA' },
  { id: 'ada.sea', label: 'NAVIGATOR (AIS)', icon: Ship, color: 'text-cyan-400', group: 'MARINA' },
  { id: 'ada.technic', label: 'TECHNICAL OPS', icon: Wrench, color: 'text-cyan-400', group: 'MARINA' },
  { id: 'ada.facility', label: 'INFRASTRUCTURE', icon: Building2, color: 'text-cyan-400', group: 'MARINA' },
  { id: 'ada.berth', label: 'YIELD ENGINE', icon: Box, color: 'text-cyan-400', group: 'MARINA' },
  { id: 'ada.robotics', label: 'DRONE FLEET', icon: Plane, color: 'text-cyan-400', group: 'MARINA' },
  { id: 'ada.weather', label: 'METOCEAN', icon: CloudRain, color: 'text-cyan-400', group: 'MARINA' },

  // GROUP 3: ADA.FINANCE (THE CFO)
  { id: 'ada.finance', label: 'CFO LEDGER', icon: Wallet, color: 'text-emerald-400', group: 'FINANCE' },
  { id: 'ada.commercial', label: 'COMMERCIAL', icon: ShoppingBag, color: 'text-emerald-400', group: 'FINANCE' },
  { id: 'ada.procurement', label: 'PURCHASING', icon: Truck, color: 'text-emerald-400', group: 'FINANCE' },
  { id: 'ada.audit', label: 'COMPLIANCE AUDIT', icon: FileCheck, color: 'text-emerald-400', group: 'FINANCE' },

  // GROUP 4: ADA.LEGAL (THE COUNSEL)
  { id: 'ada.legal', label: 'GENERAL COUNSEL', icon: Scale, color: 'text-indigo-400', group: 'LEGAL' },
  { id: 'ada.hr', label: 'HUMAN RESOURCES', icon: Users, color: 'text-indigo-400', group: 'LEGAL' },
  { id: 'ada.security', label: 'SECURITY CHIEF', icon: Shield, color: 'text-red-500', group: 'LEGAL' },
  { id: 'ada.shield', label: 'DOME DEFENSE', icon: Radar, color: 'text-red-500', group: 'LEGAL' },
  { id: 'ada.passkit', label: 'IDENTITY', icon: ScanFace, color: 'text-indigo-400', group: 'LEGAL' },

  // GROUP 5: SERVICES (FRONT OF HOUSE)
  { id: 'ada.concierge', label: 'GUEST EXPERIENCE', icon: Martini, color: 'text-pink-400', group: 'SERVICES' },
  { id: 'ada.congress', label: 'EVENT MANAGER', icon: Mic2, color: 'text-pink-400', group: 'SERVICES' },
];

export const ObserverOverlay: React.FC<ObserverOverlayProps> = ({ isOpen, onClose, traces }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeAgents, setActiveAgents] = useState<Record<string, number>>({});
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Auto-scroll to bottom of logs
  useEffect(() => {
      if(scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [traces, activeFilter]); // Scroll when filter changes too

  // Update active agents based on recent traces (last 3 seconds)
  useEffect(() => {
      const now = Date.now();
      const recentLogs = traces.slice(-5); // Look at last 5 logs
      const currentlyActive: Record<string, number> = { ...activeAgents };
      
      recentLogs.forEach(l => {
          // Normalize node name to match ID (e.g. "ada.marina.wim" -> "ada.marina")
          // Check if any agent ID is a substring of the trace node
          const matchedAgent = AGENT_REGISTRY.find(a => l.node.includes(a.id));
          if (matchedAgent) {
              currentlyActive[matchedAgent.id] = now;
          }
      });

      // Cleanup old actives (older than 2 seconds)
      Object.keys(currentlyActive).forEach(key => {
          if (now - currentlyActive[key] > 2000) {
              delete currentlyActive[key];
          }
      });

      setActiveAgents(currentlyActive);
  }, [traces]);

  if (!isOpen) return null;

  const getLogStyle = (step: string) => {
      switch(step) {
          case 'THINKING': return { border: 'border-l-purple-500', bg: 'bg-purple-500/5', text: 'text-purple-300', badge: 'bg-purple-500/20 text-purple-300' };
          case 'TOOL_EXECUTION': 
          case 'TOOL_CALL': return { border: 'border-l-amber-500', bg: 'bg-amber-500/5', text: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300' };
          case 'OUTPUT': 
          case 'FINAL_ANSWER': return { border: 'border-l-emerald-500', bg: 'bg-emerald-500/5', text: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300' };
          case 'ERROR': 
          case 'CRITICAL': return { border: 'border-l-red-500', bg: 'bg-red-500/10', text: 'text-red-300', badge: 'bg-red-500/20 text-red-300' };
          default: return { border: 'border-l-zinc-700', bg: 'bg-zinc-900', text: 'text-zinc-400', badge: 'bg-zinc-800 text-zinc-500' };
      }
  };

  const getGroupColor = (group: string) => {
      switch(group) {
          case 'STARGATE': return 'text-purple-400 border-purple-500/30 hover:bg-purple-500/10';
          case 'MARINA': return 'text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10';
          case 'FINANCE': return 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10';
          case 'LEGAL': return 'text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10';
          case 'SERVICES': return 'text-pink-400 border-pink-500/30 hover:bg-pink-500/10';
          default: return 'text-zinc-400 border-zinc-700 hover:bg-zinc-800';
      }
  };

  // Group agents for rendering
  const groups = ['STARGATE', 'MARINA', 'FINANCE', 'LEGAL', 'SERVICES'];

  // FILTER LOGIC
  const filteredTraces = traces.filter(trace => {
      if (activeFilter === 'ALL') return true;
      const matchedAgent = AGENT_REGISTRY.find(a => trace.node.includes(a.id));
      return matchedAgent?.group === activeFilter;
  });

  return (
    <div className="fixed inset-0 z-[300] bg-[#050b14] text-zinc-300 font-mono text-xs flex flex-col animate-in fade-in duration-200 backdrop-blur-sm">
      
      {/* HEADER */}
      <div className="h-14 border-b border-white/10 bg-[#020617] flex items-center justify-between px-6 shrink-0 shadow-lg z-20">
          <div className="flex items-center gap-4">
              <Activity className="text-emerald-500 animate-pulse" size={18} />
              <h1 className="font-bold tracking-widest text-white uppercase text-sm flex items-center gap-2">
                  Ada Cognitive Observer 
                  <span className="bg-zinc-800 text-zinc-400 px-1.5 rounded text-[10px] py-0.5">v5.5</span>
              </h1>
          </div>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                  <span className="text-[10px] font-bold text-emerald-400">24 NODES ONLINE</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-500 hover:text-white">
                  <X size={18} />
              </button>
          </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
          
          {/* LEFT: AGENT MATRIX (3 Columns) - THE ROSTER */}
          <div className="col-span-3 border-r border-white/10 bg-[#020617] p-0 flex flex-col overflow-y-auto custom-scrollbar">
              {groups.map(group => (
                  <div key={group} className="border-b border-white/5 last:border-0">
                      <div className="px-4 py-2 bg-white/5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest sticky top-0 backdrop-blur-sm z-10 flex justify-between items-center">
                          <span>ADA.{group}</span>
                          <span className="text-[8px] opacity-50">{AGENT_REGISTRY.filter(a => a.group === group).length} NODES</span>
                      </div>
                      <div className="p-2 space-y-1">
                          {AGENT_REGISTRY.filter(a => a.group === group).map(agent => {
                              const isActive = !!activeAgents[agent.id];
                              const Icon = agent.icon;
                              return (
                                  <div key={agent.id} className={`px-3 py-2 rounded-lg border transition-all duration-200 flex items-center justify-between group ${isActive ? 'bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)] translate-x-1' : 'bg-transparent border-transparent hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
                                      <div className="flex items-center gap-3">
                                          <div className={`p-1.5 rounded bg-black/40 ${isActive ? 'text-white' : agent.color}`}>
                                              <Icon size={12} />
                                          </div>
                                          <div>
                                              <div className={`font-bold text-[10px] ${isActive ? 'text-white' : 'text-zinc-400'}`}>{agent.id}</div>
                                              <div className="text-[8px] text-zinc-600">{agent.label}</div>
                                          </div>
                                      </div>
                                      <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-zinc-800'}`}></div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              ))}
          </div>

          {/* CENTER: EVENT STREAM (6 Columns) */}
          <div className="col-span-6 bg-[#050b14] flex flex-col relative border-r border-white/10">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
              
              {/* Stream Header & Filters */}
              <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-[#020617]/80 backdrop-blur z-10 sticky top-0">
                  <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
                      <button 
                        onClick={() => setActiveFilter('ALL')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded text-[9px] font-bold border transition-all ${activeFilter === 'ALL' ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-transparent hover:bg-white/5'}`}
                      >
                          <Filter size={10} />
                          ALL
                      </button>
                      <div className="w-px h-4 bg-white/10 shrink-0"></div>
                      {groups.map(group => {
                          const isActive = activeFilter === group;
                          const colorClass = getGroupColor(group);
                          return (
                              <button
                                key={group}
                                onClick={() => setActiveFilter(group)}
                                className={`px-2 py-1 rounded text-[9px] font-bold border transition-all uppercase ${isActive ? `bg-white/10 ${colorClass.split(' ')[0]} border-${colorClass.split('-')[1]}-500/50` : 'text-zinc-600 border-transparent hover:text-zinc-400 hover:bg-white/5'}`}
                              >
                                  {group}
                              </button>
                          );
                      })}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600 flex items-center gap-2 shrink-0">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                      {filteredTraces.length} EVTS
                  </span>
              </div>

              {/* Logs */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3" ref={scrollRef}>
                  {filteredTraces.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-700 opacity-50">
                          {activeFilter === 'ALL' ? <Activity size={48} className="mb-4 stroke-1"/> : <Filter size={48} className="mb-4 stroke-1"/>}
                          <p className="text-xs uppercase tracking-widest">
                              {activeFilter === 'ALL' ? 'Awaiting Neural Activity...' : `No activity for ${activeFilter}`}
                          </p>
                      </div>
                  ) : (
                      filteredTraces.map((trace, idx) => {
                          const style = getLogStyle(trace.step);
                          return (
                              <div key={idx} className="flex gap-4 group animate-in slide-in-from-bottom-2 fade-in duration-300">
                                  <div className="flex flex-col items-center pt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                      <div className={`w-1.5 h-1.5 rounded-full ${style.text.replace('text-', 'bg-')}`}></div>
                                      <div className="w-px h-full bg-white/5 my-1 group-last:bg-transparent"></div>
                                  </div>
                                  
                                  <div className={`flex-1 rounded-lg border-l-2 p-2.5 ${style.border} ${style.bg} border-t border-r border-b border-white/5 shadow-sm`}>
                                      <div className="flex justify-between items-start mb-1">
                                          <div className="flex items-center gap-2">
                                              <span className={`px-1.5 py-px rounded text-[9px] font-bold ${style.badge}`}>{trace.step}</span>
                                              <span className="text-indigo-400 font-bold tracking-wide text-[10px]">@{trace.node}</span>
                                          </div>
                                          <span className="text-zinc-600 font-mono text-[9px]">{trace.timestamp.split(' ')[0]}</span>
                                      </div>
                                      
                                      <div className={`text-xs leading-relaxed whitespace-pre-wrap font-mono ${style.text}`}>
                                          {typeof trace.content === 'object' ? (
                                              <pre className="bg-black/30 p-2 rounded text-[10px] overflow-x-auto custom-scrollbar border border-white/5 mt-2">
                                                  {JSON.stringify(trace.content, null, 2)}
                                              </pre>
                                          ) : (
                                              trace.content
                                          )}
                                      </div>
                                  </div>
                              </div>
                          );
                      })
                  )}
              </div>
          </div>

          {/* RIGHT: CONTEXT & DETAILS (3 Columns) */}
          <div className="col-span-3 bg-[#020617] p-5 overflow-y-auto">
              <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Activity size={12} />
                  Cognitive State
              </h3>
              
              <div className="space-y-6">
                  {/* System Health */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-20"><Server size={40} /></div>
                      <div className="text-[9px] text-zinc-500 uppercase mb-2 font-bold tracking-wider">Infrastructure</div>
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
                          <Zap size={14} className="fill-current" />
                          HYPERSCALE ACTIVE
                      </div>
                      <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-zinc-400">
                              <span>Docker Mesh</span>
                              <span className="text-emerald-500">Online</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-zinc-400">
                              <span>Redis Bus</span>
                              <span className="text-emerald-500">Connected</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-zinc-400">
                              <span>Vector Mem</span>
                              <span className="text-emerald-500">Synced</span>
                          </div>
                      </div>
                  </div>

                  {/* Active Intent */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-[9px] text-zinc-500 uppercase mb-2 font-bold tracking-wider">Latest Intent</div>
                      <code className="text-xs text-indigo-300 block bg-black/30 p-2 rounded break-all border border-indigo-500/20">
                          {traces.length > 0 ? traces[traces.length - 1].step : 'IDLE'}
                      </code>
                  </div>

                  {/* Load Balancer */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-[9px] text-zinc-500 uppercase mb-2 font-bold tracking-wider">Agent Load Distribution</div>
                      <div className="flex items-end gap-1 h-16 border-b border-white/10 pb-1">
                          {AGENT_REGISTRY.map((a, i) => {
                              // Simulate load based on index for visual effect
                              const height = Math.max(10, Math.min(100, (Math.sin(i + Date.now()/1000) * 50 + 50)));
                              return (
                                  <div 
                                    key={i} 
                                    className={`flex-1 rounded-t-sm transition-all duration-500 ${activeAgents[a.id] ? 'bg-emerald-500' : 'bg-indigo-500/20'}`} 
                                    style={{ height: `${height}%` }}
                                    title={a.id}
                                  ></div>
                              )
                          })}
                      </div>
                      <div className="flex justify-between mt-2 text-[8px] text-zinc-600 uppercase">
                          <span>Star</span>
                          <span>Mar</span>
                          <span>Fin</span>
                          <span>Leg</span>
                          <span>Svc</span>
                      </div>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};
