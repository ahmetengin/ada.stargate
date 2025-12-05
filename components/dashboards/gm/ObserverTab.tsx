import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Activity, Brain, CheckCircle2, Code, Cpu, Eye, Filter, Server, Terminal, Workflow, X, ChevronRight, AlertTriangle, Zap, VenetianMask } from 'lucide-react';
import { AgentTraceLog, NodeName } from '../../../types';

interface ObserverTabProps {
  traces: AgentTraceLog[];
}

interface NodeStat {
  count: number;
  lastActive: string;
  status: 'WORKING' | 'IDLE' | 'ERROR';
}

const getStepInfo = (step: AgentTraceLog['step']) => {
    switch (step) {
        case 'THINKING': return { icon: Brain, color: 'text-purple-400 bg-purple-900/50 border-purple-500/30' };
        case 'ROUTING': return { icon: Workflow, color: 'text-indigo-400 bg-indigo-900/50 border-indigo-500/30' };
        case 'TOOL_CALL': return { icon: Zap, color: 'text-sky-400 bg-sky-900/50 border-sky-500/30' };
        case 'TOOL_EXECUTION': return { icon: Terminal, color: 'text-blue-400 bg-blue-900/50 border-blue-500/30' };
        case 'CODE_OUTPUT': return { icon: Code, color: 'text-zinc-400 bg-zinc-800/50 border-zinc-700/30' };
        case 'OUTPUT':
        case 'FINAL_ANSWER': return { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-900/50 border-emerald-500/30' };
        case 'ERROR':
        case 'CRITICAL': return { icon: AlertTriangle, color: 'text-red-400 bg-red-900/50 border-red-500/30' };
        default: return { icon: VenetianMask, color: 'text-zinc-500 bg-zinc-800 border-zinc-700' };
    }
};

export const ObserverTab: React.FC<ObserverTabProps> = ({ traces }) => {
  const [filterNode, setFilterNode] = useState<NodeName | null>(null);
  const [autoFollow, setAutoFollow] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { filteredTraces, orchestratorTraces, nodeStats, allNodes } = useMemo(() => {
    const stats: Record<string, NodeStat> = {};
    traces.forEach(t => {
        if (!stats[t.node]) stats[t.node] = { count: 0, lastActive: 'N/A', status: 'IDLE' };
        stats[t.node].count++;
        stats[t.node].lastActive = t.timestamp;
        if (t.isError || t.step === 'CRITICAL') stats[t.node].status = 'ERROR';
        else stats[t.node].status = 'WORKING';
    });

    const allNodesList = Array.from(new Set(traces.map(t => t.node))).sort();
    
    return {
        filteredTraces: filterNode ? traces.filter(t => t.node === filterNode) : traces,
        orchestratorTraces: traces.filter(t => t.node.includes('stargate')),
        nodeStats: stats,
        allNodes: allNodesList,
    };
  }, [traces, filterNode]);
  
  useEffect(() => {
      if(autoFollow) {
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
  }, [filteredTraces, autoFollow]);


  return (
    <div className="h-full w-full bg-black text-zinc-300 font-mono text-xs flex flex-col">
      {/* Header Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/5 bg-zinc-900/50">
        <div className="flex items-center gap-2">
            <Eye size={14} className="text-cyan-400"/>
            <span className="font-bold tracking-widest text-sm">OBSERVER</span>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setAutoFollow(!autoFollow)}
                className={`px-3 py-1 text-[10px] font-bold rounded flex items-center gap-2 border transition-colors ${autoFollow ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
            >
                AUTO-FOLLOW {autoFollow ? 'ON' : 'OFF'}
            </button>
            <div className="flex items-center gap-2 text-zinc-500 text-[10px]">
                <Server size={12}/>
                <span>{traces.length} EVENTS</span>
            </div>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* LEFT: AGENT MATRIX */}
        <div className="col-span-2 border-r border-white/5 bg-zinc-950/30 flex flex-col">
            <div className="p-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 border-b border-white/5">AGENT MATRIX</div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                <button 
                    onClick={() => setFilterNode(null)}
                    className={`w-full text-left p-2 rounded transition-colors text-[10px] flex items-center gap-2 ${!filterNode ? 'bg-cyan-500/10 text-cyan-300' : 'hover:bg-white/5'}`}
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div> ALL NODES
                </button>
                {allNodes.map((node) => (
                    <button key={node} onClick={() => setFilterNode(node as NodeName)} className={`w-full text-left p-2 rounded transition-colors text-[10px] flex items-center gap-2 ${filterNode === node ? 'bg-cyan-500/10 text-cyan-300' : 'text-zinc-400 hover:bg-white/5'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${nodeStats[node]?.status === 'ERROR' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        {node}
                    </button>
                ))}
            </div>
        </div>

        {/* MIDDLE: LIVE EVENT STREAM */}
        <div ref={scrollRef} className="col-span-7 border-r border-white/5 overflow-y-auto custom-scrollbar">
            <div className="p-4 space-y-4">
                {filteredTraces.map(trace => (
                    <div key={trace.id} className="grid grid-cols-12 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="col-span-2 text-zinc-600 text-[10px] pt-0.5">{trace.timestamp}</div>
                        <div className="col-span-10">
                            <div className="flex items-center gap-3 mb-1">
                                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStepInfo(trace.step).color}`}>
                                    {React.createElement(getStepInfo(trace.step).icon, { size: 10 })} {trace.step}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-400">{trace.node}</span>
                            </div>
                            <div className={`text-zinc-300 p-3 rounded-lg border bg-zinc-900/50 ${getStepInfo(trace.step).color.split(' ')[2].replace('border-','border-l-2 border-t-0 border-r-0 border-b-0')}`}>
                                <pre className="whitespace-pre-wrap leading-relaxed"><code>{typeof trace.content === 'object' ? JSON.stringify(trace.content, null, 2) : trace.content}</code></pre>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* RIGHT: ORCHESTRATOR VIEW */}
        <div className="col-span-3 bg-zinc-950/30 flex flex-col">
            <div className="p-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 border-b border-white/5 flex items-center gap-2">
                <Brain size={12} className="text-indigo-400"/> ORCHESTRATOR
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {orchestratorTraces.map(trace => (
                    <div key={trace.id} className="p-2 rounded bg-indigo-900/10 border border-indigo-500/20">
                        <div className="text-[9px] text-zinc-500 mb-1">{trace.timestamp}</div>
                        <div className="text-indigo-300 text-[11px] leading-snug">{trace.content}</div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};
