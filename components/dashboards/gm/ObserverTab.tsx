
import React, { useState, useEffect, useRef } from 'react';
import { 
    Activity, Brain, CheckCircle2, Code, Cpu, Workflow, X, 
    AlertTriangle, Zap, Scale, Wrench, GitCommit, Search, 
    Pause, Play, Download, Terminal, Database, LineChart, MessageSquare 
} from 'lucide-react';
import { AgentTraceLog } from '../../../types';

interface ObserverTabProps {
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
];

export const ObserverTab: React.FC<ObserverTabProps> = ({ traces }) => {
  const [autoFollow, setAutoFollow] = useState(true);
  const [filter, setFilter] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if(autoFollow && scrollRef.current) {
          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
  }, [traces, autoFollow]);

  const filteredTraces = traces.filter(t => 
    JSON.stringify(t).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="h-full w-full bg-gunmetal-950 text-zinc-300 font-mono text-xs flex flex-col">
      {/* Header Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/5 bg-gunmetal-900/50">
        <div className="flex items-center gap-2">
            <h2 className="font-bold tracking-widest text-sm text-white flex items-center gap-2">
                <Cpu size={14} className="text-indigo-500" />
                COGNITIVE ENGINE
            </h2>
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[9px] font-bold rounded border border-indigo-500/30">LANGGRAPH VISUALIZER</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search size={10} className="absolute left-2 top-1.5 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Filter Trace..." 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-black/30 border border-white/10 rounded-full pl-6 pr-3 py-1 text-[10px] text-zinc-300 focus:outline-none focus:border-indigo-500 w-32 transition-all"
                />
            </div>
             <button 
                onClick={() => setAutoFollow(!autoFollow)}
                className={`px-3 py-1 text-[9px] font-bold rounded border transition-colors flex items-center gap-1 ${autoFollow ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
            >
                {autoFollow ? <Pause size={10}/> : <Play size={10}/>}
                {autoFollow ? 'LIVE' : 'PAUSED'}
            </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* LEFT: NODE TOPOLOGY (Static Mock of Graph) */}
        <div className="hidden md:flex col-span-3 border-r border-white/5 bg-gunmetal-900/30 flex-col">
            <div className="p-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-white/5">ACTIVE NODES</div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {AGENT_STATS.map(agent => (
                    <div key={agent.name} className="bg-gunmetal-800/50 border border-zinc-700/50 rounded-lg p-3 group hover:border-indigo-500/30 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-xs text-zinc-200 font-mono">{agent.name}</span>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'ACTIVE' || agent.status === 'EXECUTING' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                                <span className="text-[9px] text-zinc-500">{agent.status}</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-[9px] text-zinc-500 mt-1 font-mono">
                            <span className="text-indigo-400">{agent.type}</span>
                            <span>{agent.memory}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* MIDDLE: EXECUTION TRACE */}
        <div ref={scrollRef} className="col-span-12 md:col-span-9 overflow-y-auto custom-scrollbar bg-[#030711]">
            <div className="p-4 space-y-6">
                {filteredTraces.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-600 gap-2">
                        <Activity size={32} className="opacity-20"/>
                        <span className="text-xs">Waiting for cognitive events...</span>
                    </div>
                )}
                
                {filteredTraces.map((trace, idx) => {
                    const visuals = getNodeVisuals(trace.node || trace.persona || 'unknown');
                    const Icon = visuals.icon;
                    
                    // Determine content formatting
                    const isCode = visuals.label === 'CODE GENERATION' || visuals.label === 'EXECUTION OUTPUT';
                    const isThinking = trace.step === 'THINKING';

                    return (
                        <div key={trace.id || idx} className="grid grid-cols-[60px_1fr] gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Timeline Info */}
                            <div className="flex flex-col items-end pt-1">
                                <span className="text-[10px] font-mono text-zinc-600">{trace.timestamp?.split(' ')[0]}</span>
                                <div className="h-full w-px bg-zinc-800 my-2 relative">
                                    <div className={`absolute top-0 -left-[3px] w-2 h-2 rounded-full ${visuals.bgColor} ${visuals.color}`}></div>
                                </div>
                            </div>

                            {/* Card */}
                            <div className="pb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${visuals.bgColor} ${visuals.borderColor} ${visuals.color}`}>
                                        <Icon size={10} /> {visuals.label}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-500">
                                        {trace.node}::{trace.step}
                                    </span>
                                </div>

                                <div className={`relative rounded-lg border overflow-hidden ${isCode ? 'bg-[#0d1117] border-zinc-800' : 'bg-white/5 border-white/5'}`}>
                                    {/* Decor Header for Code/Terminals */}
                                    {isCode && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border-b border-white/5">
                                            <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                                            <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                                            <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                                            <span className="ml-2 text-[9px] text-zinc-500 font-mono">python3.11</span>
                                        </div>
                                    )}
                                    
                                    <div className="p-3 overflow-x-auto">
                                        {isCode ? (
                                            <pre className="font-mono text-[10px] leading-relaxed text-zinc-300">
                                                <code>{typeof trace.content === 'object' ? JSON.stringify(trace.content, null, 2) : trace.content}</code>
                                            </pre>
                                        ) : (
                                            <div className={`text-[11px] leading-relaxed ${isThinking ? 'italic text-zinc-400' : 'text-zinc-200'}`}>
                                                {typeof trace.content === 'string' ? trace.content : JSON.stringify(trace.content, null, 2)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {/* Scroll Anchor */}
                <div className="h-4"></div>
            </div>
        </div>

      </div>
    </div>
  );
};
