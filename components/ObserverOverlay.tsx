
// components/ObserverOverlay.tsx

import React, { useState, useEffect, useRef } from 'react';
import { 
    Activity, Brain, X, Terminal, Cpu, Code, Zap, Sparkles, Layers, Play, CheckCircle, Database, BookOpen, GitBranch, Share2
} from 'lucide-react';
import { AgentTraceLog } from '../types';
import { aceService } from '../services/aceService';

interface ObserverOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  traces: AgentTraceLog[];
}

export const ObserverOverlay: React.FC<ObserverOverlayProps> = ({ isOpen, onClose, traces }) => {
  const [activeView, setActiveView] = useState<'stream' | 'network' | 'playbook'>('stream');
  const scrollRef = useRef<HTMLDivElement>(null);
  const strategies = aceService.getAll();

  useEffect(() => {
      if(scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [traces, activeView]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-[#020617] text-zinc-300 font-mono text-xs flex flex-col animate-in fade-in duration-200">
      
      {/* Navbar */}
      <div className="flex-shrink-0 h-14 flex items-center justify-between px-6 border-b border-white/10 bg-[#0b101b]">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-indigo-500">
                <Cpu size={18} />
                <h2 className="font-bold tracking-widest text-white text-sm uppercase">Cognitive Observer <span className="text-zinc-600">v5.5</span></h2>
            </div>
            
            <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                {[
                    { id: 'stream', label: 'Event_Stream', icon: Activity },
                    { id: 'network', label: 'Neural_Mesh', icon: Share2 },
                    { id: 'playbook', label: 'ACE_Playbook', icon: BookOpen }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveView(tab.id as any)}
                        className={`px-4 py-1.5 rounded-md transition-all flex items-center gap-2 font-bold ${activeView === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <tab.icon size={12} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-full text-zinc-500 hover:text-red-400">
            <X size={18} />
        </button>
      </div>

      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* Memory Module Sidebar */}
        <div className="col-span-3 border-r border-white/10 bg-[#050b14] p-5 space-y-6">
            <section className="space-y-4">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Memory Modules</div>
                {[
                    { id: 'working', label: 'Working Memory', color: 'bg-cyan-500', desc: 'Short-term context' },
                    { id: 'semantic', label: 'Semantic Memory', color: 'bg-indigo-500', desc: 'Knowledge & RAG' },
                    { id: 'episodic', label: 'Episodic Memory', color: 'bg-emerald-500', desc: 'Historical traces' },
                    { id: 'procedural', label: 'Procedural Memory', color: 'bg-amber-500', desc: 'Skills & MAKER' }
                ].map(mod => (
                    <div key={mod.id} className="p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-1">
                            <div className={`w-2 h-2 rounded-full ${mod.color}`}></div>
                            <span className="font-bold text-white uppercase text-[9px]">{mod.label}</span>
                        </div>
                        <p className="text-[9px] text-zinc-500">{mod.desc}</p>
                    </div>
                ))}
            </section>
        </div>

        {/* Viewport */}
        <div className="col-span-9 bg-[#020617] overflow-hidden relative flex flex-col">
            
            {activeView === 'stream' && (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0" ref={scrollRef}>
                    {traces.map((trace, idx) => (
                        <div key={idx} className="flex border-b border-white/5 hover:bg-white/5 transition-colors group">
                            <div className="w-24 p-3 text-zinc-600 text-right border-r border-white/5 bg-[#050b14]/50 text-[10px]">{trace.timestamp}</div>
                            <div className="flex-1 p-3">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                                        trace.step === 'ACT' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                                        trace.step === 'REFLECT' ? 'text-purple-400 border-purple-500/30 bg-purple-500/10' :
                                        'text-blue-400 border-blue-500/30'
                                    }`}>
                                        {trace.step}
                                    </span>
                                    <span className="text-indigo-400 font-bold">@{trace.node}</span>
                                </div>
                                <div className="text-zinc-400 text-sm leading-relaxed">{typeof trace.content === 'string' ? trace.content : JSON.stringify(trace.content)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeView === 'network' && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
                    
                    <div className="relative z-10 w-full max-w-2xl h-96 flex items-center justify-center">
                        {/* Domain Nodes Viz */}
                        <div className="grid grid-cols-2 gap-24 relative">
                            {[
                                { id: 'ada.marina', label: 'OPERATOR', color: 'bg-cyan-500' },
                                { id: 'ada.finance', label: 'CFO', color: 'bg-emerald-500' },
                                { id: 'ada.legal', label: 'COUNSEL', color: 'bg-indigo-500' },
                                { id: 'ada.stargate', label: 'ORCHESTRATOR', color: 'bg-purple-500' }
                            ].map(node => (
                                <div key={node.id} className="flex flex-col items-center gap-3">
                                    <div className={`w-16 h-16 rounded-2xl ${node.color} flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] border border-white/20 animate-pulse`}>
                                        <Cpu size={32} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-white">{node.id}</div>
                                        <div className="text-[8px] text-zinc-500 uppercase tracking-widest">{node.label}</div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Animated Connection Lines (Simulated) */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-full h-px bg-indigo-500/20 absolute rotate-45 animate-pulse"></div>
                                <div className="w-full h-px bg-indigo-500/20 absolute -rotate-45 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-12 max-w-lg">
                        <h4 className="text-indigo-400 font-bold mb-2">Omni-Presence Matrix Active</h4>
                        <p className="text-zinc-500 text-[10px] leading-relaxed uppercase tracking-wider">
                            Real-time federated communication detected across 4 sovereign domains. 
                            COLREGs & ACE Playbooks synchronized.
                        </p>
                    </div>
                </div>
            )}

            {activeView === 'playbook' && (
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <h3 className="text-2xl font-black text-white tracking-tight border-b border-white/10 pb-4">Agentic Context Playbook (ACE)</h3>
                        {strategies.map(strat => (
                            <div key={strat.id} className="bg-[#0b101b] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-lg font-bold text-indigo-400">{strat.title}</h4>
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                                        {(strat.successRate * 100).toFixed(0)}% CONFIDENCE
                                    </span>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed italic">"{strat.content}"</p>
                                <div className="mt-4 flex items-center gap-4 text-[9px] font-bold text-zinc-600 uppercase">
                                    <span>Usage Count: {strat.usageCount}</span>
                                    <span>Module: Episodic -> Procedural</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
