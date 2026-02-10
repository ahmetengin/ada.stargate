
import React, { useState, useEffect, useRef } from 'react';
import { 
    Activity, X, Terminal, Shield, Anchor, Wallet, Scale, Network, Sparkles, Globe, 
    Ship, Wrench, Building2, Box, Plane, CloudRain, 
    ShoppingBag, Truck, FileCheck, Users, Radar, ScanFace, 
    Martini, Mic2, Cpu, Filter, FolderOpen, FileCode, Layers
} from 'lucide-react';
import { AgentTraceLog } from '../../types';

interface ObserverOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  traces: AgentTraceLog[];
}

const SKILL_REGISTRY = [
  { id: 'ada-system-ops', name: 'System Operations', version: '1.0.0', type: 'CORE', icon: Cpu, desc: 'Rule patching & asset registry.', nodePrefix: 'ada.system' },
  { id: 'ada-stargate-router', name: 'Semantic Router', version: '4.2.1', type: 'CORE', icon: Network, desc: 'Intent classification & routing.', nodePrefix: 'ada.stargate' },
  { id: 'ada-marina-ops', name: 'Marina Operations', version: '2.1.0', type: 'DOMAIN', icon: Anchor, desc: 'Berthing physics & traffic control.', nodePrefix: 'ada.marina' },
  { id: 'ada-sea-nav', name: 'Sea Navigation', version: '3.0.5', type: 'DOMAIN', icon: Ship, desc: 'COLREGs & Route optimization.', nodePrefix: 'ada.sea' },
  { id: 'ada-technic-maint', name: 'Technical Maint.', version: '1.2.0', type: 'DOMAIN', icon: Wrench, desc: 'Lift scheduling & Blue Card.', nodePrefix: 'ada.technic' },
  { id: 'ada-finance-ledger', name: 'Finance Ledger', version: '5.0.0', type: 'DOMAIN', icon: Wallet, desc: 'Invoicing & Tax calculation.', nodePrefix: 'ada.finance' },
  { id: 'ada-commercial-lease', name: 'Commercial Lease', version: '1.1.0', type: 'DOMAIN', icon: ShoppingBag, desc: 'Tenant management.', nodePrefix: 'ada.commercial' },
  { id: 'ada-legal-compliance', name: 'Legal Compliance', version: '2.0.0', type: 'DOMAIN', icon: Scale, desc: 'RAG Search & Contract analysis.', nodePrefix: 'ada.legal' },
  { id: 'ada-security-shield', name: 'Shield Defense', version: '4.1.0', type: 'DOMAIN', icon: Shield, desc: 'Perimeter drone & sonar watch.', nodePrefix: 'ada.shield' },
  { id: 'ada-concierge-svc', name: 'Guest Services', version: '1.5.0', type: 'DOMAIN', icon: Martini, desc: 'Provisions & Transport.', nodePrefix: 'ada.concierge' }
];

export const ObserverOverlay: React.FC<ObserverOverlayProps> = ({ isOpen, onClose, traces }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSkills, setActiveSkills] = useState<Record<string, number>>({});
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  useEffect(() => {
      if(scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [traces, selectedSkill]);

  useEffect(() => {
      const now = Date.now();
      const recentLogs = traces.slice(-5);
      const currentlyActive: Record<string, number> = { ...activeSkills };
      
      recentLogs.forEach(l => {
          const matchedSkill = SKILL_REGISTRY.find(s => l.node.includes(s.nodePrefix));
          if (matchedSkill) {
              currentlyActive[matchedSkill.id] = now;
          }
      });

      Object.keys(currentlyActive).forEach(key => {
          if (now - currentlyActive[key] > 2000) delete currentlyActive[key];
      });

      setActiveSkills(currentlyActive);
  }, [traces]);

  // Filter traces based on selection
  const filteredTraces = selectedSkill 
    ? traces.filter(t => {
        const skill = SKILL_REGISTRY.find(s => s.id === selectedSkill);
        return skill && t.node.includes(skill.nodePrefix);
      })
    : traces;

  if (!isOpen) return null;

  const getLogStyle = (step: string) => {
    switch(step) {
        case 'THINKING': return { border: 'border-l-purple-500', bg: 'bg-purple-500/5', text: 'text-purple-300', badge: 'bg-purple-500/20 text-purple-300' };
        case 'TOOL_EXECUTION': return { border: 'border-l-amber-500', bg: 'bg-amber-500/5', text: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300' };
        case 'OUTPUT': return { border: 'border-l-emerald-500', bg: 'bg-emerald-500/5', text: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300' };
        case 'CRITICAL': return { border: 'border-l-red-500', bg: 'bg-red-500/10', text: 'text-red-300', badge: 'bg-red-500/20 text-red-300' };
        default: return { border: 'border-l-zinc-700', bg: 'bg-zinc-900', text: 'text-zinc-400', badge: 'bg-zinc-800 text-zinc-500' };
    }
  };

  const getStepIcon = (step: string) => {
    switch(step) {
        case 'THINKING': return <Brain size={12} />;
        case 'TOOL_EXECUTION': return <Terminal size={12} />;
        case 'OUTPUT': return <MessageSquare size={12} />;
        default: return <Zap size={12} />;
    }
  };

  // Helper icons for dynamic import issue
  const Brain = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
  const MessageSquare = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
  const Zap = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

  return (
    <div className="fixed inset-0 z-[300] bg-[#050b14] text-zinc-300 font-mono text-xs flex flex-col animate-in fade-in duration-200 backdrop-blur-sm">
      <div className="h-14 border-b border-white/10 bg-[#020617] flex items-center justify-between px-6 shrink-0 shadow-lg z-20">
          <div className="flex items-center gap-4">
              <Activity className="text-emerald-500 animate-pulse" size={18} />
              <h1 className="font-bold tracking-widest text-white uppercase text-sm flex items-center gap-2">
                  Ada Kernel Observer
                  <span className="bg-zinc-800 text-zinc-400 px-1.5 rounded text-[10px] py-0.5">Runtime v5.6</span>
              </h1>
          </div>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded border border-purple-500/20">
                  <FolderOpen size={12} className="text-purple-400" />
                  <span className="text-[10px] font-bold text-purple-300">{SKILL_REGISTRY.length} SKILLS MOUNTED</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-500 hover:text-white">
                  <X size={18} />
              </button>
          </div>
      </div>

      <div className="flex-1 grid grid-cols-12 overflow-hidden">
          <div className="col-span-3 border-r border-white/10 bg-[#020617] flex flex-col">
              <div className="p-3 bg-white/5 border-b border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex justify-between items-center">
                  <span>/var/lib/ada/skills</span>
                  <Layers size={10} className="opacity-50"/>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {SKILL_REGISTRY.map(skill => {
                      const isActive = !!activeSkills[skill.id];
                      return (
                          <div 
                            key={skill.id}
                            onClick={() => setSelectedSkill(selectedSkill === skill.id ? null : skill.id)}
                            className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                                selectedSkill === skill.id 
                                ? 'bg-white/10 border-white/30 text-white' 
                                : isActive 
                                    ? 'bg-emerald-900/10 border-emerald-500/30 text-emerald-100'
                                    : 'bg-transparent border-transparent hover:bg-white/5 text-zinc-400'
                            }`}
                          >
                              <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center gap-2">
                                      <skill.icon size={14} className={isActive ? 'text-emerald-400' : 'text-zinc-500'} />
                                      <span className="font-bold">{skill.name}</span>
                                  </div>
                                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>}
                              </div>
                              <div className="text-[9px] opacity-60 flex justify-between">
                                  <span>{skill.nodePrefix}</span>
                                  <span className="font-mono">v{skill.version}</span>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>

          <div className="col-span-6 bg-[#050b14] flex flex-col relative border-r border-white/10">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
              
              <div className="h-8 border-b border-white/10 flex items-center justify-between px-4 bg-[#020617]/90 backdrop-blur z-10">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Terminal size={10} /> {selectedSkill ? `Filtered Stream: ${selectedSkill}` : 'Unified Event Stream'}
                  </span>
                  {selectedSkill && (
                      <button onClick={() => setSelectedSkill(null)} className="text-[9px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1">
                          <X size={8} /> CLEAR FILTER
                      </button>
                  )}
                  {!selectedSkill && (
                      <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      </div>
                  )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3" ref={scrollRef}>
                  {filteredTraces.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-zinc-600">
                          <div className="text-center">
                              <Filter size={32} className="mx-auto mb-2 opacity-20" />
                              <p>No traces found for filter.</p>
                          </div>
                      </div>
                  ) : (
                      filteredTraces.map((trace, idx) => {
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
                                            <span className={`px-1.5 py-px rounded text-[9px] font-bold ${style.badge} flex items-center gap-1`}>
                                                {getStepIcon(trace.step)}
                                                {trace.step}
                                            </span>
                                            <span className="text-indigo-400 font-bold text-[10px]">{trace.node}</span>
                                        </div>
                                        <span className="text-zinc-600 text-[9px]">{trace.timestamp.split(' ')[0]}</span>
                                    </div>
                                    <div className={`text-xs font-mono ${style.text} whitespace-pre-wrap`}>
                                        {typeof trace.content === 'object' ? JSON.stringify(trace.content, null, 2) : trace.content}
                                    </div>
                                </div>
                            </div>
                        );
                      })
                  )}
              </div>
          </div>

          <div className="col-span-3 bg-[#020617] flex flex-col">
              <div className="p-3 bg-white/5 border-b border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Inspector
              </div>
              
              <div className="p-6">
                  {selectedSkill ? (
                      <div className="space-y-6 animate-in fade-in">
                          <div className="flex items-center gap-4">
                              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                                  <FileCode size={24} />
                              </div>
                              <div>
                                  <h2 className="text-lg font-bold text-white">{SKILL_REGISTRY.find(s => s.id === selectedSkill)?.name}</h2>
                                  <div className="text-zinc-500 font-mono text-[10px]">{selectedSkill}</div>
                              </div>
                          </div>

                          <div className="space-y-2">
                              <div className="text-[10px] uppercase font-bold text-zinc-500">Description</div>
                              <p className="text-zinc-400 leading-relaxed text-xs">
                                  {SKILL_REGISTRY.find(s => s.id === selectedSkill)?.desc}
                              </p>
                          </div>
                          
                          <div className="space-y-2">
                              <div className="text-[10px] uppercase font-bold text-zinc-500">Node Binding</div>
                              <div className="bg-white/5 p-2 rounded text-emerald-400 font-mono text-[10px]">
                                  {SKILL_REGISTRY.find(s => s.id === selectedSkill)?.nodePrefix}
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center mt-20 text-zinc-700">
                          <FolderOpen size={32} className="mx-auto mb-2 opacity-20" />
                          <p>Select a skill to filter logs</p>
                      </div>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
};
