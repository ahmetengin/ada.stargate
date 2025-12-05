
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Brain, CheckCircle2, Code, Cpu, Workflow, X, AlertTriangle, Zap, Scale, Wrench, GitCommit, Search, Pause, Play, Download } from 'lucide-react';
import { AgentTraceLog } from '../types';

interface ObserverOverlayProps {
  isOpen: boolean;
  onClose: () => void;
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
        case 'VOTING': return { icon: Scale, color: 'text-pink-400', bgColor: 'bg-pink-900/20', borderColor: 'border-pink-500/30' };
        default: return { icon: GitCommit, color: 'text-zinc-500', bgColor: 'bg-zinc-800', borderColor: 'border-zinc-700' };
    }
};

const AGENT_STATS = [
    { name: 'ada.orchestrator', status: 'ACTIVE', load: 45, memory: '1.2GB', type: 'ROUTER' },
    { name: 'ada.marina', status: 'IDLE', load: 12, memory: '850MB', type: 'EXPERT' },
    { name: 'ada.finance', status: 'WORKING', load: 78, memory: '2.1GB', type: 'EXPERT' },
    { name: 'ada.legal', status: 'IDLE', load: 5, memory: '600MB', type: 'EXPERT' },
    { name: 'ada.maker', status: 'STANDBY', load: 0, memory: '120MB', type: 'WORKER' },
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
    t.content.toLowerCase().includes(filter.toLowerCase()) || 
    t.node.toLowerCase().includes(filter.toLowerCase()) ||
    t.step.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[300] bg-[#050b14] text-zinc-300 font-mono text-xs flex flex-col animate-in zoom-in-95 duration-200">
      
      {/* Header Toolbar */}
      <div className="flex-shrink-0 h-14 flex items-center justify-between px-6 border-b border-white/10 bg-[#020617]">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-cyan-500">
                <Activity className="animate-pulse" size={18} />
                <h2 className="font-bold tracking-[0.2em] text-sm text-white">NEURAL OBSERVER</h2>
            </div>
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="font-bold">SYSTEM ONLINE</span>
                 </div>
                 <div className="text-zinc-500">Uplink: 12ms</div>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="relative">
                <Search size={14} className="absolute left-3 top-2 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Filter logs..." 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-zinc-300 focus:outline-none focus:border-cyan-500/50 w-64 transition-all"
                />
            </div>
            
            <button 
                onClick={() => setAutoFollow(!autoFollow)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${autoFollow ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'}`}
            >
                {autoFollow ? <Pause size={14} /> : <Play size={14} />}
                {autoFollow ? 'PAUSE' : 'RESUME'}
            </button>

            <button className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors" title="Export Logs">
                <Download size={18} />
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
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Active Nodes</h3>
                <div className="space-y-3">
                    {AGENT_STATS.map(agent => (
                        <div key={agent.name} className="p-3 bg-white/5 rounded border border-white/5 group hover:border-cyan-500/30 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-white truncate w-24" title={agent.name}>{agent.name}</span>
                                <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'WORKING' || agent.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                            </div>
                            <div className="flex justify-between text-[9px] text-zinc-500 mb-1">
                                <span>LOAD</span>
                                <span className={agent.load > 70 ? 'text-amber-500' : 'text-zinc-400'}>{agent.load}%</span>
                            </div>
                            <div className="w-full bg-black/50 h-1 rounded-full overflow-hidden">
                                <div className={`h-full ${agent.load > 70 ? 'bg-amber-500' : 'bg-cyan-500'}`} style={{width: `${agent.load}%`}}></div>
                            </div>
                            <div className="mt-2 text-[9px] font-bold text-zinc-600 uppercase tracking-wider">{agent.type}</div>
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
                    <div className="h-full flex items-center justify-center text-zinc-600 italic">
                        Waiting for system activity...
                    </div>
                )}
                {filteredTraces.map((trace, idx) => {
                    const { icon: Icon, color, bgColor, borderColor } = getStepInfo(trace.step);
                    return (
                        <div key={trace.id} className="grid grid-cols-[80px_1fr] gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="text-right pt-1">
                                <div className="text-zinc-500 font-bold">{trace.timestamp.split(' ')[0]}</div>
                                <div className="text-[9px] text-zinc-700">{trace.id.slice(-4)}</div>
                            </div>
                            
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-1.5 rounded-md ${bgColor} ${color} border ${borderColor} shadow-lg shadow-${color.split('-')[1]}-500/10`}>
                                        <Icon size={14} />
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${bgColor} ${borderColor} ${color}`}>
                                        {trace.step}
                                    </span>
                                    <span className="text-zinc-500">via</span>
                                    <span className="font-bold text-zinc-300 font-mono">{trace.node}</span>
                                </div>
                                
                                <div className={`relative group p-4 rounded-xl border bg-white/5 ${borderColor.replace('border-','border-l-2 border-t-0 border-r-0 border-b-0 hover:bg-white/10 transition-colors')}`}>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-zinc-500 hover:text-white" title="Copy"><Code size={12}/></button>
                                    </div>
                                    <pre className="whitespace-pre-wrap leading-relaxed font-mono text-[11px] text-zinc-300 overflow-x-auto custom-scrollbar">
                                        {typeof trace.content === 'object' ? JSON.stringify(trace.content, null, 2) : trace.content}
                                    </pre>
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
                {filteredTraces.filter(t => t.persona === 'ORCHESTRATOR' || t.step === 'THINKING').map((trace) => (
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
