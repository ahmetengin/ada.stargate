
import React, { useState, useEffect, useRef } from 'react';
import { 
    Activity, Brain, X, Terminal, Zap, Server, 
    Shield, Anchor, Wallet, Scale, Network, Sparkles, Globe, 
    Ship, Wrench, Building2, Box, Plane, CloudRain, 
    ShoppingBag, Truck, FileCheck, Users, Radar, ScanFace, 
    Martini, Mic2, Cpu, Filter, FolderOpen, FileCode
} from 'lucide-react';
import { AgentTraceLog } from '../../types';

interface ObserverOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  traces: AgentTraceLog[];
}

// --- SKILL REGISTRY (THE NEW PARADIGM) ---
const SKILL_REGISTRY = [
  // CORE OS SKILLS
  { id: 'ada-system-ops', name: 'System Operations', version: '1.0.0', type: 'CORE', icon: Cpu, desc: 'Rule patching & asset registry.' },
  { id: 'ada-stargate-router', name: 'Semantic Router', version: '4.2.1', type: 'CORE', icon: Network, desc: 'Intent classification & routing.' },
  
  // MARINA SKILLS
  { id: 'ada-marina-ops', name: 'Marina Operations', version: '2.1.0', type: 'DOMAIN', icon: Anchor, desc: 'Berthing physics & traffic control.' },
  { id: 'ada-sea-nav', name: 'Sea Navigation', version: '3.0.5', type: 'DOMAIN', icon: Ship, desc: 'COLREGs & Route optimization.' },
  { id: 'ada-technic-maint', name: 'Technical Maint.', version: '1.2.0', type: 'DOMAIN', icon: Wrench, desc: 'Lift scheduling & Blue Card.' },
  
  // FINANCE SKILLS
  { id: 'ada-finance-ledger', name: 'Finance Ledger', version: '5.0.0', type: 'DOMAIN', icon: Wallet, desc: 'Invoicing & Tax calculation.' },
  { id: 'ada-commercial-lease', name: 'Commercial Lease', version: '1.1.0', type: 'DOMAIN', icon: ShoppingBag, desc: 'Tenant management.' },
  
  // LEGAL & COMPLIANCE
  { id: 'ada-legal-compliance', name: 'Legal Compliance', version: '2.0.0', type: 'DOMAIN', icon: Scale, desc: 'RAG Search & Contract analysis.' },
  { id: 'ada-security-shield', name: 'Shield Defense', version: '4.1.0', type: 'DOMAIN', icon: Shield, desc: 'Perimeter drone & sonar watch.' },
  
  // SERVICES
  { id: 'ada-concierge-svc', name: 'Guest Services', version: '1.5.0', type: 'DOMAIN', icon: Martini, desc: 'Provisions & Transport.' }
];

export const ObserverOverlay: React.FC<ObserverOverlayProps> = ({ isOpen, onClose, traces }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSkills, setActiveSkills] = useState<Record<string, number>>({});
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Auto-scroll
  useEffect(() => {
      if(scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [traces]);

  // Visualize Active Skills based on Trace Node Names
  useEffect(() => {
      const now = Date.now();
      const recentLogs = traces.slice(-5);
      const currentlyActive: Record<string, number> = { ...activeSkills };
      
      recentLogs.forEach(l => {
          // Map "ada.marina" node to "ada-marina-ops" skill for visualization
          const skillMap: Record<string, string> = {
              'ada.marina': 'ada-marina-ops',
              'ada.finance': 'ada-finance-ledger',
              'ada.legal': 'ada-legal-compliance',
              'ada.stargate': 'ada-system-ops',
              'ada.sea': 'ada-sea-nav',
              'ada.technic': 'ada-technic-maint',
              'ada.shield': 'ada-security-shield',
              'ada.concierge': 'ada-concierge-svc'
          };
          
          const skillId = Object.keys(skillMap).find(key => l.node.includes(key));
          if (skillId) {
              currentlyActive[skillMap[skillId]] = now;
          }
      });

      // Cleanup old
      Object.keys(currentlyActive).forEach(key => {
          if (now - currentlyActive[key] > 2000) delete currentlyActive[key];
      });

      setActiveSkills(currentlyActive);
  }, [traces]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-[#050b14] text-zinc-300 font-mono text-xs flex flex-col animate-in fade-in duration-200 backdrop-blur-sm">
      
      {/* HEADER */}
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

      {/* MAIN LAYOUT */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
          
          {/* LEFT: SKILL LIBRARY (File System Metaphor) */}
          <div className="col-span-3 border-r border-white/10 bg-[#020617] flex flex-col">
              <div className="p-3 bg-white/5 border-b border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  /var/lib/ada/skills
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {SKILL_REGISTRY.map(skill => {
                      const isActive = !!activeSkills[skill.id];
                      return (
                          <div 
                            key={skill.id}
                            onClick={() => setSelectedSkill(skill.id)}
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
                                  <span>{skill.id}</span>
                                  <span className="font-mono">v{skill.version}</span>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* CENTER: EXECUTION STREAM */}
          <div className="col-span-6 bg-[#050b14] flex flex-col relative border-r border-white/10">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
              
              <div className="h-8 border-b border-white/10 flex items-center justify-between px-4 bg-[#020617]/90 backdrop-blur z-10">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Terminal size={10} /> Runtime Logs
                  </span>
                  <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3" ref={scrollRef}>
                  {traces.map((trace, idx) => (
                      <div key={idx} className="font-mono text-xs animate-in fade-in slide-in-from-left-2">
                          <div className="flex items-center gap-2 mb-1 opacity-50">
                              <span className="text-zinc-500">[{trace.timestamp.split(' ')[0]}]</span>
                              <span className="text-indigo-400 font-bold">root@{trace.node}:~$</span>
                              <span className="text-zinc-300">{trace.step}</span>
                          </div>
                          <div className={`pl-4 border-l-2 ${trace.step === 'ERROR' ? 'border-red-500/50 text-red-300' : 'border-zinc-800 text-zinc-400'}`}>
                              {typeof trace.content === 'string' ? trace.content : JSON.stringify(trace.content)}
                          </div>
                      </div>
                  ))}
                  {traces.length === 0 && (
                      <div className="text-center mt-20 text-zinc-700">
                          <Terminal size={32} className="mx-auto mb-2 opacity-20" />
                          <p>Ready for input...</p>
                      </div>
                  )}
              </div>
          </div>

          {/* RIGHT: SKILL INSPECTOR */}
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
                              <div className="text-[10px] uppercase font-bold text-zinc-500">Manifest</div>
                              <div className="bg-black/40 rounded p-3 font-mono text-[10px] text-zinc-400 border border-white/5">
                                  <div className="flex justify-between"><span>Type:</span> <span className="text-emerald-400">NodeJS/ESM</span></div>
                                  <div className="flex justify-between"><span>Perms:</span> <span className="text-amber-400">Read/Write</span></div>
                                  <div className="flex justify-between"><span>Hot Reload:</span> <span className="text-emerald-400">Active</span></div>
                              </div>
                          </div>

                          <div className="space-y-2">
                              <div className="text-[10px] uppercase font-bold text-zinc-500">Description</div>
                              <p className="text-zinc-400 leading-relaxed text-xs">
                                  {SKILL_REGISTRY.find(s => s.id === selectedSkill)?.desc}
                              </p>
                          </div>

                          <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider transition-colors text-zinc-400 hover:text-white">
                              View Source Code
                          </button>
                      </div>
                  ) : (
                      <div className="text-center mt-20 text-zinc-700">
                          <FolderOpen size={32} className="mx-auto mb-2 opacity-20" />
                          <p>Select a skill to inspect</p>
                      </div>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
};
