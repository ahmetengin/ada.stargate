
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Activity, Brain, CheckCircle2, Code, Cpu, Eye, Filter, Server, Terminal, Workflow, X, ChevronRight, AlertTriangle, Zap, VenetianMask, Scale, Wrench, GitCommit, FileText } from 'lucide-react';
import { AgentTraceLog, NodeName } from '../../../types';

interface ObserverTabProps {
  traces: AgentTraceLog[];
}

const getStepInfo = (step: AgentTraceLog['step']) => {
    switch (step) {
        case 'THINKING': return { icon: Brain, color: 'text-purple-400',bgColor: 'bg-purple-900/50', borderColor: 'border-purple-500/30' };
        case 'ROUTING': return { icon: Workflow, color: 'text-indigo-400', bgColor: 'bg-indigo-900/50', borderColor: 'border-indigo-500/30' };
        case 'TOOL_CALL': return { icon: Wrench, color: 'text-sky-400', bgColor: 'bg-sky-900/50', borderColor: 'border-sky-500/30' };
        case 'TOOL_EXECUTION': return { icon: Zap, color: 'text-blue-400', bgColor: 'bg-blue-900/50', borderColor: 'border-blue-500/30' };
        case 'CODE_OUTPUT': return { icon: Code, color: 'text-zinc-400', bgColor: 'bg-zinc-800/50', borderColor: 'border-zinc-700/30' };
        case 'OUTPUT':
        case 'FINAL_ANSWER': return { icon: CheckCircle2, color: 'text-emerald-400', bgColor: 'bg-emerald-900/50', borderColor: 'border-emerald-500/30' };
        case 'ERROR':
        case 'CRITICAL': return { icon: AlertTriangle, color: 'text-red-400', bgColor: 'bg-red-900/50', borderColor: 'border-red-500/30' };
        case 'VOTING': return { icon: Scale, color: 'text-purple-400', bgColor: 'bg-purple-900/20', borderColor: 'border-purple-500/30' };
        default: return { icon: GitCommit, color: 'text-zinc-500', bgColor: 'bg-zinc-800', borderColor: 'border-zinc-700' };
    }
};

const AGENT_MOCK_DATA = [
    { name: 'build-header-pills', status: 'EXECUTING', template: 'build-agent', context: 196, maxContext: 200, stats: { llm: 7, tools: 11, files: 29 }, model: 'SONNET-4.5', cost: 0.007 },
    { name: 'scout-header-pills', status: 'IDLE', template: 'scout-report-suggest-fast', context: 6, maxContext: 200, stats: { llm: 0, tools: 11, files: 28 }, model: 'HAIKU-4.5', cost: 0.032 },
];


export const ObserverTab: React.FC<ObserverTabProps> = ({ traces }) => {
  const [autoFollow, setAutoFollow] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if(autoFollow && scrollRef.current) {
          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
  }, [traces, autoFollow]);


  return (
    <div className="h-full w-full bg-gunmetal-950 text-zinc-300 font-mono text-xs flex flex-col">
      {/* Header Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/5 bg-gunmetal-900/50">
        <div className="flex items-center gap-2">
            <h2 className="font-bold tracking-widest text-sm text-white">MULTI-AGENT ORCHESTRATION</h2>
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-bold rounded">LIVE LOG STREAM</span>
             <div className="flex items-center gap-1.5 text-emerald-400 text-[10px]"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>Connected</div>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex gap-1">
                <div className="px-2 py-1 bg-zinc-700/50 rounded text-zinc-400 text-[10px]">Active: <span className="font-bold text-white">2</span></div>
                <div className="px-2 py-1 bg-zinc-700/50 rounded text-zinc-400 text-[10px]">Running: <span className="font-bold text-white">1</span></div>
                <div className="px-2 py-1 bg-zinc-700/50 rounded text-zinc-400 text-[10px]">Logs: <span className="font-bold text-white">{traces.length}</span></div>
            </div>
             <button 
                onClick={() => setAutoFollow(!autoFollow)}
                className={`px-3 py-1 text-[10px] font-bold rounded border transition-colors ${autoFollow ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
            >
                AUTO-FOLLOW
            </button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* LEFT: AGENT MATRIX */}
        <div className="col-span-12 md:col-span-3 border-r border-white/5 bg-gunmetal-900/30 flex flex-col">
            <div className="p-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-white/5">AGENTS</div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {AGENT_MOCK_DATA.map(agent => (
                    <div key={agent.name} className="bg-gunmetal-800/50 border border-zinc-700/50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm text-white">{agent.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${agent.status === 'EXECUTING' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-700 text-zinc-400'}`}>
                                {agent.status}
                            </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 bg-black/30 p-2 rounded mb-3">Template: {agent.template}</div>
                        <div className="text-[10px] text-zinc-500 mb-1">Context Window</div>
                        <div className="w-full bg-zinc-700/50 h-1 rounded-full">
                            <div className="h-full bg-cyan-500 rounded-full" style={{width: `${(agent.context / agent.maxContext) * 100}%`}}></div>
                        </div>
                        <div className="flex justify-between text-[9px] text-zinc-500 mt-1">
                            <span>{agent.context}</span>
                            <span>{agent.maxContext}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* MIDDLE: LIVE EVENT STREAM */}
        <div ref={scrollRef} className="col-span-12 md:col-span-5 border-r border-white/5 overflow-y-auto custom-scrollbar">
            <div className="p-4 space-y-4">
                {traces.map(trace => {
                    const { icon: Icon, color, bgColor, borderColor } = getStepInfo(trace.step);
                    return (
                        <div key={trace.id} className="grid grid-cols-12 gap-3 animate-in fade-in duration-300">
                            <div className="col-span-2 text-zinc-600 text-[10px] pt-0.5 text-right">{trace.timestamp}</div>
                            <div className="col-span-10">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold border ${bgColor} ${borderColor} ${color}`}>
                                        <Icon size={10} /> {trace.step}
                                    </span>
                                    <span className="text-[10px] font-bold text-zinc-400">{trace.node}</span>
                                </div>
                                <div className={`text-zinc-300 p-3 rounded-lg border bg-gunmetal-900/50 ${borderColor.replace('border-','border-l-2 border-t-0 border-r-0 border-b-0')}`}>
                                    <pre className="whitespace-pre-wrap leading-relaxed"><code>{typeof trace.content === 'object' ? JSON.stringify(trace.content, null, 2) : trace.content}</code></pre>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* RIGHT: ORCHESTRATOR VIEW */}
        <div className="hidden md:flex col-span-4 bg-gunmetal-900/30 flex-col">
            <div className="p-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-white/5 flex items-center gap-2">
                <Brain size={12} className="text-indigo-400"/> ORCHESTRATOR
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {traces.filter(t => t.persona === 'ORCHESTRATOR').map((trace) => (
                    <div key={trace.id} className="p-3 rounded bg-indigo-900/10 border border-indigo-500/20 animate-in fade-in">
                        <div className="text-[9px] text-indigo-300 font-bold mb-1 flex justify-between">
                            <span>{trace.step}</span>
                            <span>{trace.timestamp}</span>
                        </div>
                        <div className="text-indigo-300/80 text-[11px] leading-snug">
                           {trace.content}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
