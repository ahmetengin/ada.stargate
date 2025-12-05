
import React, { useState, useEffect, useRef } from 'react';
import { 
    Activity, Brain, CheckCircle2, Code, Cpu, Workflow, X, 
    AlertTriangle, Zap, Scale, Wrench, GitCommit, Search, 
    Pause, Play, Download, Terminal, Database, LineChart, MessageSquare,
    Layers, ShieldCheck
} from 'lucide-react';
import { AgentTraceLog } from '../types';

interface ObserverOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  traces: AgentTraceLog[];
}

// Maps LangGraph Nodes to Visual Identity
const getNodeVisuals = (nodeName: string) => {
    const lowerName = nodeName.toLowerCase();
    
    // 1. ROUTER (The Switchboard)
    if (lowerName.includes('router') || lowerName.includes('orchestrator')) {
        return { icon: Workflow, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/30', label: 'ROUTING LOGIC' };
    }
    
    // 2. MAKER (The Engineer - Python Writer)
    if (lowerName.includes('maker') || lowerName.includes('finance') || lowerName.includes('marina')) {
        return { icon: Terminal, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', label: 'CODE GENERATION' };
    }
    
    // 3. EXECUTOR (The Worker - Sandbox)
    if (lowerName.includes('executor') || lowerName.includes('worker') || lowerName.includes('tool')) {
        return { icon: Play, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', label: 'EXECUTION OUTPUT' };
    }
    
    // 4. MEMORY / RAG (The Librarian)
    if (lowerName.includes('rag') || lowerName.includes('retriever') || lowerName.includes('legal')) {
        return { icon: Database, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', label: 'VECTOR RETRIEVAL' };
    }

    // 5. ANALYTICS (TabPFN)
    if (lowerName.includes('tabpfn') || lowerName.includes('analytics')) {
        return { icon: LineChart, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', label: 'PREDICTIVE MODEL' };
    }

    // 6. SEAL (Learner)
    if (lowerName.includes('seal') || lowerName.includes('learn')) {
        return { icon: Brain, color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30', label: 'SELF-ADAPTATION' };
    }

    // 7. GENERATOR (The Voice)
    if (lowerName.includes('generator') || lowerName.includes('final')) {
        return { icon: MessageSquare, color: 'text-white', bgColor: 'bg-zinc-800', borderColor: 'border-zinc-700', label: 'SYNTHESIS' };
    }

    // Default
    return { icon: Activity, color: 'text-zinc-400', bgColor: 'bg-zinc-900', borderColor: 'border-zinc-800', label: 'SYSTEM EVENT' };
};

const AGENT_STATS = [
    { name: 'router_node', status: 'ACTIVE', load: 12, memory: '150MB', type: 'LANGGRAPH' },
    { name: 'maker_agent', status: 'IDLE', load: 0, memory: '450MB', type: 'PYTHON' },
    { name: 'executor_node', status: 'STANDBY', load: 0, memory: '1.1GB', type: 'DOCKER' },
    { name: 'rag_retriever', status: 'ACTIVE', load: 45, memory: '8.2GB', type: 'QDRANT' },
    { name: 'seal_learner', status: 'SLEEP', load: 0, memory: '2.4GB', type: 'LLM' },
];

export const ObserverOverlay: React.FC<ObserverOverlayProps> = ({ isOpen, onClose, traces }) => {
  const [autoFollow, setAutoFollow] = useState(true);
  const [filter, setFilter] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if(autoFollow && scrollRef.current) {
          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
  }, [traces, autoFollow]);

  if (!isOpen) return null;

  const filteredTraces = traces.filter(t => 
    JSON.stringify(t).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[300] bg-[#050b14] text-zinc-300 font-mono text-xs flex flex-col animate-in zoom-in-95 duration-200">
      
      {/* Header Toolbar */}
      <div className="flex-shrink-0 h-14 flex items-center justify-between px-6 border-b border-white/10 bg-[#020617]">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-indigo-500">
                <Cpu className="animate-pulse" size={18} />
                <h2 className="font-bold tracking-[0.2em] text-sm text-white">COGNITIVE ENGINE OBSERVER</h2>
            </div>
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="font-bold">BIG 3 ARCHITECTURE</span>
                 </div>
                 <div className="text-zinc-500">LangGraph Active</div>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="relative">
                <Search size={14} className="absolute left-3 top-2 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Filter Trace..." 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-zinc-300 focus:outline-none focus:border-indigo-500/50 w-64 transition-all"
                />
            </div>
            
            <button 
                onClick={() => setAutoFollow(!autoFollow)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${autoFollow ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'}`}
            >
                {autoFollow ? <Pause size={14} /> : <Play size={14} />}
                {autoFollow ? 'LIVE' : 'PAUSED'}
            </button>

            <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-full text-zinc-400 hover:text-red-500 transition-colors ml-2">
                <X size={20} />
            </button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* LEFT: NODE MATRIX (System State) */}
        <div className="col-span-2 border-r border-white/10 bg-[#0a101d] flex flex-col">
            <div className="p-4 border-b border-white/5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                    <Layers size={14} /> Active Nodes
                </h3>
                <div className="space-y-3">
                    {AGENT_STATS.map(agent => (
                        <div key={agent.name} className="p-3 bg-white/5 rounded border border-white/5 group hover:border-indigo-500/30 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-white truncate w-24" title={agent.name}>{agent.name}</span>
                                <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'ACTIVE' || agent.status === 'WORKING' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                            </div>
                            <div className="flex justify-between text-[9px] text-zinc-500 mb-1">
                                <span>LOAD</span>
                                <span className={agent.load > 70 ? 'text-amber-500' : 'text-zinc-400'}>{agent.load}%</span>
                            </div>
                            <div className="w-full bg-black/50 h-1 rounded-full overflow-hidden">
                                <div className={`h-full ${agent.load > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{width: `${agent.load}%`}}></div>
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">{agent.type}</span>
                                <span className="text-[9px] text-zinc-600 font-mono">{agent.memory}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 mt-auto">
                <div className="p-3 bg-black/40 rounded border border-white/5 text-[10px] text-zinc-500 font-mono">
                    <div className="mb-1">Redis: <span className="text-emerald-500">CONNECTED</span></div>
                    <div className="mb-1">Qdrant: <span className="text-emerald-500">CONNECTED</span></div>
                    <div>Backend: <span className="text-emerald-500">ONLINE</span></div>
                </div>
            </div>
        </div>

        {/* MIDDLE: LIVE EVENT STREAM (The Feed) */}
        <div className="col-span-7 border-r border-white/10 flex flex-col bg-[#020617]">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4" ref={scrollRef}>
                {filteredTraces.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic gap-2">
                        <Activity size={32} className="opacity-20"/>
                        <span>Waiting for cognitive events...</span>
                    </div>
                )}
                {filteredTraces.map((trace, idx) => {
                    const visuals = getNodeVisuals(trace.node || trace.persona || 'unknown');
                    const Icon = visuals.icon;
                    
                    // Determine content formatting
                    const isCode = visuals.label === 'CODE GENERATION' || visuals.label === 'EXECUTION OUTPUT';
                    const isThinking = trace.step === 'THINKING';

                    return (
                        <div key={trace.id || idx} className="grid grid-cols-[80px_1fr] gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="text-right pt-1">
                                <div className="text-zinc-500 font-bold">{trace.timestamp?.split(' ')[0]}</div>
                                <div className="text-[9px] text-zinc-700">{trace.id.slice(-4)}</div>
                            </div>
                            
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${visuals.bgColor} ${visuals.borderColor} ${visuals.color}`}>
                                        <Icon size={10} /> {visuals.label}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-500">
                                        {trace.node}::{trace.step}
                                    </span>
                                </div>
                                
                                <div className={`relative group p-4 rounded-xl border bg-white/5 ${visuals.borderColor.replace('border-','border-l-2 border-t-0 border-r-0 border-b-0 hover:bg-white/10 transition-colors')}`}>
                                    {isCode ? (
                                        <>
                                            <div className="flex items-center gap-1.5 mb-2 opacity-50">
                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <span className="ml-2 text-[9px] text-zinc-500 font-mono">python3.11</span>
                                            </div>
                                            <pre className="whitespace-pre-wrap leading-relaxed font-mono text-[11px] text-zinc-300 overflow-x-auto custom-scrollbar">
                                                <code>{typeof trace.content === 'object' ? JSON.stringify(trace.content, null, 2) : trace.content}</code>
                                            </pre>
                                        </>
                                    ) : (
                                        <div className={`text-[11px] leading-relaxed ${isThinking ? 'italic text-zinc-400' : 'text-zinc-200'}`}>
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

        {/* RIGHT: THOUGHT PROCESS (Chain of Thought) */}
        <div className="col-span-3 bg-[#0a101d] flex flex-col">
            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                    <Brain size={14}/> Orchestrator Thoughts
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
                {filteredTraces.filter(t => t.step === 'THINKING' || t.step === 'ROUTING' || t.step === 'PLANNING').map((trace) => (
                    <div key={trace.id} className="relative pl-4 border-l border-indigo-500/30 pb-4 last:border-0 last:pb-0">
                        <div className="absolute left-[-4.5px] top-0 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
                        <div className="text-[9px] text-indigo-400/70 mb-1 font-mono">{trace.timestamp}</div>
                        <div className="text-indigo-200/90 text-[11px] leading-relaxed italic">
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
