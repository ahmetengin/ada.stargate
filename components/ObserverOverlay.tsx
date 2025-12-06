
import React, { useState, useEffect, useRef } from 'react';
import { 
    Activity, Brain, Workflow, X, 
    Search, Pause, Play, Terminal, Database, LineChart,
    Layers, Cpu, Zap, Shield, Anchor, CreditCard, Scale
} from 'lucide-react';
import { AgentTraceLog } from '../types';

interface ObserverOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  traces: AgentTraceLog[];
}

// --- CONFIG ---
// Maps agent identities to visual themes for the dashboard
const NODE_CONFIG: Record<string, { label: string, icon: any, color: string, bgColor: string, borderColor: string }> = {
    'ada.stargate':     { label: 'ORCHESTRATOR', icon: Brain, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/30' },
    'ada.marina':       { label: 'MARINA OPS', icon: Anchor, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
    'ada.finance':      { label: 'FINANCE CORE', icon: CreditCard, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
    'ada.legal':        { label: 'LEGAL COUNSEL', icon: Scale, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
    'ada.security':     { label: 'SECURITY GRID', icon: Shield, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30' },
    'ada.analytics':    { label: 'TABPFN ENGINE', icon: LineChart, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
    'ada.memory':       { label: 'QDRANT RAG', icon: Database, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
};

const AGENT_STATS = [
    { name: 'ada.stargate', status: 'ACTIVE', load: 45, memory: '1.2GB', task: 'ROUTING' },
    { name: 'ada.marina', status: 'IDLE', load: 12, memory: '450MB', task: 'MONITORING' },
    { name: 'ada.finance', status: 'STANDBY', load: 5, memory: '800MB', task: 'LEDGER' },
    { name: 'ada.legal', status: 'STANDBY', load: 2, memory: '600MB', task: 'READY' },
];

export const ObserverOverlay: React.FC<ObserverOverlayProps> = ({ isOpen, onClose, traces }) => {
  const [autoFollow, setAutoFollow] = useState(true);
  const [filter, setFilter] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic to keep the latest "thought" in view
  useEffect(() => {
      if(autoFollow && scrollRef.current) {
          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
  }, [traces, autoFollow]);

  if (!isOpen) return null;

  const filteredTraces = traces.filter(t => 
    JSON.stringify(t).toLowerCase().includes(filter.toLowerCase())
  );

  const getNodeVisuals = (nodeName: string) => {
      // Fuzzy match for node name to config
      const key = Object.keys(NODE_CONFIG).find(k => nodeName.toLowerCase().includes(k.split('.')[1]));
      return key ? NODE_CONFIG[key] : { label: 'SYSTEM', icon: Activity, color: 'text-zinc-400', bgColor: 'bg-zinc-900', borderColor: 'border-zinc-700' };
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#020617] text-zinc-300 font-mono text-xs flex flex-col animate-in zoom-in-95 duration-200">
      
      {/* 1. Header Toolbar */}
      <div className="flex-shrink-0 h-14 flex items-center justify-between px-6 border-b border-white/10 bg-[#020617]/95 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-indigo-500">
                <Cpu className="animate-pulse" size={18} />
                <h2 className="font-bold tracking-[0.2em] text-sm text-white">COGNITIVE OBSERVER</h2>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                 <span>ARCH:</span>
                 <span className="text-emerald-500 font-bold">HYPERSCALE (v4.6)</span>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="relative">
                <Search size={12} className="absolute left-3 top-2 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Filter Trace..." 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-full pl-8 pr-4 py-1.5 text-zinc-300 focus:outline-none focus:border-indigo-500/50 w-48 transition-all text-[10px]"
                />
            </div>
            
            <button 
                onClick={() => setAutoFollow(!autoFollow)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[10px] font-bold ${autoFollow ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-zinc-400 border-white/10'}`}
            >
                {autoFollow ? <Pause size={10} /> : <Play size={10} />}
                {autoFollow ? 'LIVE FEED' : 'PAUSED'}
            </button>

            <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-full text-zinc-400 hover:text-red-500 transition-colors ml-2">
                <X size={18} />
            </button>
        </div>
      </div>

      {/* 2. Main 3-Column Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden relative">
        
        {/* Background Matrix Rain Effect (Simulated via CSS/Divs) */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none bg-[length:100%_4px,6px_100%] z-0"></div>

        {/* LEFT: SYSTEM STATE (The Rack) */}
        <div className="col-span-2 border-r border-white/10 bg-[#050b14]/80 flex flex-col p-4 backdrop-blur-sm z-10">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                <Layers size={14} /> Active Nodes
            </h3>
            <div className="space-y-3">
                {AGENT_STATS.map(agent => {
                    const visuals = getNodeVisuals(agent.name);
                    const isActive = agent.status === 'ACTIVE';
                    return (
                        <div key={agent.name} className={`p-3 rounded border transition-all ${isActive ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent opacity-50'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className={`font-bold text-[10px] truncate w-20 ${visuals.color}`}>{visuals.label}</span>
                                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                            </div>
                            <div className="w-full bg-black/50 h-1 rounded-full overflow-hidden mb-2">
                                <div className={`h-full ${visuals.bgColor.replace('bg-', 'bg-')}`} style={{width: `${agent.load}%`}}></div>
                            </div>
                            <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                                <span>{agent.task}</span>
                                <span>{agent.memory}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-auto p-3 bg-black/40 rounded border border-white/5 text-[9px] text-zinc-500 font-mono space-y-1">
                <div className="flex justify-between"><span>Redis:</span> <span className="text-emerald-500">CONNECTED</span></div>
                <div className="flex justify-between"><span>Qdrant:</span> <span className="text-emerald-500">CONNECTED</span></div>
                <div className="flex justify-between"><span>TabPFN:</span> <span className="text-amber-500">STANDBY</span></div>
                <div className="flex justify-between"><span>FastRTC:</span> <span className="text-emerald-500">LISTENING</span></div>
            </div>
        </div>

        {/* MIDDLE: THE FEED (The Matrix) */}
        <div className="col-span-7 border-r border-white/10 flex flex-col bg-transparent relative z-10">
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4" ref={scrollRef}>
                {filteredTraces.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-4">
                        <Activity size={48} className="opacity-20 animate-pulse"/>
                        <span className="text-xs uppercase tracking-widest">Awaiting Neural Signals...</span>
                    </div>
                )}
                
                {filteredTraces.map((trace, idx) => {
                    const visuals = getNodeVisuals(trace.node || trace.persona || 'unknown');
                    const Icon = visuals.icon;
                    const isCode = trace.step === 'CODE_OUTPUT' || trace.step === 'TOOL_EXECUTION';
                    const isThinking = trace.step === 'THINKING' || trace.step === 'PLANNING';
                    const isError = trace.step === 'ERROR';

                    return (
                        <div key={trace.id || idx} className="grid grid-cols-[60px_1fr] gap-4 animate-in slide-in-from-bottom-2 duration-300 group">
                            {/* Timestamp Column */}
                            <div className="text-right pt-1">
                                <div className="text-[10px] text-zinc-600 font-mono group-hover:text-zinc-400 transition-colors">
                                    {trace.timestamp?.split(' ')[0]}
                                </div>
                            </div>
                            
                            {/* Content Column */}
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${visuals.bgColor} ${visuals.borderColor} ${visuals.color}`}>
                                        <Icon size={10} /> {visuals.label}
                                    </span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isError ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-zinc-500'}`}>
                                        {trace.step}
                                    </span>
                                </div>
                                
                                <div className={`relative p-3 rounded-lg border text-[11px] leading-relaxed 
                                    ${isCode ? 'bg-[#0a0a0a] border-zinc-800 font-mono text-zinc-400' : 
                                      isThinking ? 'bg-transparent border-transparent text-zinc-500 italic' : 
                                      'bg-white/5 border-white/10 text-zinc-300'}
                                    ${isError ? 'border-red-500/30 bg-red-900/10 text-red-300' : ''}
                                `}>
                                    {isCode ? (
                                        <>
                                            <div className="flex gap-1.5 mb-2 opacity-30">
                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            </div>
                                            <pre className="whitespace-pre-wrap overflow-x-auto custom-scrollbar">
                                                <code>{typeof trace.content === 'object' ? JSON.stringify(trace.content, null, 2) : trace.content}</code>
                                            </pre>
                                        </>
                                    ) : (
                                        <div>
                                            {typeof trace.content === 'string' ? trace.content : JSON.stringify(trace.content, null, 2)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* RIGHT: CHAIN OF THOUGHT (The Plan) */}
        <div className="col-span-3 bg-[#050b14]/80 flex flex-col z-10 backdrop-blur-sm">
            <div className="p-3 border-b border-white/10 bg-[#020617]/50 flex justify-between items-center">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                    <Workflow size={14}/> Active Strategy
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                {filteredTraces.filter(t => ['ROUTING', 'PLANNING', 'FINAL_ANSWER'].includes(t.step)).map((trace, i) => (
                    <div key={i} className="relative pl-4 border-l border-indigo-500/20 pb-2">
                        <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full border-2 ${trace.step === 'FINAL_ANSWER' ? 'bg-emerald-500 border-emerald-900' : 'bg-[#020617] border-indigo-500'}`}></div>
                        <div className="text-[9px] text-indigo-500/50 font-mono mb-1">{trace.timestamp}</div>
                        <div className={`text-[11px] leading-relaxed ${trace.step === 'FINAL_ANSWER' ? 'text-white font-bold' : 'text-zinc-400'}`}>
                           "{typeof trace.content === 'string' ? trace.content : 'Complex Object'}"
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};
