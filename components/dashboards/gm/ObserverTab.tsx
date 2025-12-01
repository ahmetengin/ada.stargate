
import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Brain, CheckCircle2, Clock, Layers, Terminal, Code, Cpu, Server, Filter, ChevronRight, ChevronDown, Zap } from 'lucide-react';
import { AgentTraceLog } from '../../../types';

interface ObserverTabProps {
  traces: AgentTraceLog[];
}

interface NodeStat {
  count: number;
  lastActive: string;
  status: 'IDLE' | 'ACTIVE' | 'ERROR';
}

export const ObserverTab: React.FC<ObserverTabProps> = ({ traces }) => {
  const [view, setView] = useState<'stream' | 'matrix'>('stream');
  const [filterNode, setFilterNode] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Compute Active Nodes statistics
  const nodeStats = useMemo(() => {
    const stats: Record<string, NodeStat> = {};
    traces.forEach(t => {
      if (!stats[t.node]) {
        stats[t.node] = { count: 0, lastActive: t.timestamp, status: 'IDLE' };
      }
      stats[t.node].count++;
      stats[t.node].lastActive = t.timestamp;
      if (t.isError) stats[t.node].status = 'ERROR';
      else if (Date.now() - new Date().setHours(0,0,0,0) < 1000 * 60 * 5) stats[t.node].status = 'ACTIVE'; // active in last 5 mins (mock logic)
    });
    return stats;
  }, [traces]);

  const filteredTraces = filterNode ? traces.filter(t => t.node === filterNode) : traces;

  const getPersonaColor = (persona: string = 'WORKER') => {
      switch(persona) {
          case 'ORCHESTRATOR': return 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10';
          case 'EXPERT': return 'text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10';
          case 'WORKER': return 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10';
          default: return 'text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50';
      }
  };

  return (
    <div className="bg-white dark:bg-[#0a0f18] p-0 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-300 h-[600px] flex flex-col overflow-hidden shadow-xl transition-colors">
      
      {/* Header Toolbar */}
      <div className="flex justify-between items-center p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/10 rounded border border-indigo-200 dark:border-indigo-500/20">
                <Brain size={16} className="text-indigo-600 dark:text-indigo-500" />
            </div>
            <div>
                <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-2">
                Neural Observer
                </h3>
                <div className="text-[9px] text-zinc-500 font-mono mt-0.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    LIVE EVENT BUS • {traces.length} EVENTS
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-zinc-100 dark:bg-zinc-900 rounded p-0.5 border border-zinc-200 dark:border-zinc-800">
                <button 
                    onClick={() => setView('stream')} 
                    className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${view === 'stream' ? 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                >
                    <Terminal size={10} /> Stream
                </button>
                <button 
                    onClick={() => setView('matrix')} 
                    className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${view === 'matrix' ? 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                >
                    <Layers size={10} /> Matrix
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
          
          {/* LEFT: NODE LIST (Sidebar) */}
          <div className="w-48 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20 flex flex-col hidden md:flex">
              <div className="p-2 border-b border-zinc-200 dark:border-zinc-800 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  Active Nodes
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  <button 
                    onClick={() => setFilterNode(null)}
                    className={`w-full text-left px-3 py-2 rounded text-[10px] font-mono transition-colors border ${!filterNode ? 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white border-zinc-300 dark:border-zinc-700 shadow-sm' : 'text-zinc-500 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800/50'}`}
                  >
                      ALL NODES
                  </button>
                  {Object.entries(nodeStats).map(([node, stat]) => {
                      const s = stat as NodeStat;
                      return (
                      <button 
                        key={node}
                        onClick={() => setFilterNode(node)}
                        className={`w-full text-left px-3 py-2 rounded text-[10px] font-mono transition-colors border flex justify-between items-center group ${filterNode === node ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 shadow-sm' : 'text-zinc-500 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800/50'}`}
                      >
                          <span className="truncate">{node}</span>
                          <span className="text-[8px] bg-zinc-200 dark:bg-zinc-900 px-1.5 py-0.5 rounded opacity-50 group-hover:opacity-100">{s.count}</span>
                      </button>
                  )})}
              </div>
          </div>

          {/* CENTER: CONTENT AREA */}
          <div className="flex-1 flex flex-col bg-white dark:bg-black/40 min-w-0">
            
            {view === 'stream' && (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {filteredTraces.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                            <Activity size={48} className="opacity-20 mb-4" />
                            <span className="text-xs font-mono">No neural activity detected.</span>
                        </div>
                    ) : (
                        filteredTraces.slice().reverse().map((trace) => (
                            <LogEntry key={trace.id} trace={trace} personaColor={getPersonaColor(trace.persona)} />
                        ))
                    )}
                </div>
            )}

            {view === 'matrix' && (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Node Health Matrix */}
                        <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Server size={14} /> Node Topology
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(nodeStats).map(([node, stat]) => {
                                    const s = stat as NodeStat;
                                    return (
                                    <div key={node} className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 rounded flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${s.status === 'ERROR' ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                                            <div>
                                                <div className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase">{node}</div>
                                                <div className="text-[9px] text-zinc-500 dark:text-zinc-600">Last: {s.lastActive}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500">{s.count} ops</div>
                                    </div>
                                )})}
                            </div>
                        </div>

                        {/* Sandbox Status (Mock) */}
                        <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Cpu size={14} /> Sandbox Environment (Workers)
                            </h4>
                            <div className="space-y-2">
                                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 rounded flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <Code size={14} className="text-amber-500" />
                                        <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-300">python-executor-01</span>
                                    </div>
                                    <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">IDLE</span>
                                </div>
                                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 rounded flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <Code size={14} className="text-amber-500" />
                                        <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-300">python-executor-02</span>
                                    </div>
                                    <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-500 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900/50 flex items-center gap-1">
                                        <Zap size={8} className="fill-indigo-500" /> RUNNING
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-4 p-3 bg-zinc-100 dark:bg-zinc-900/50 rounded border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500">
                                <div>Mem Usage: 24%</div>
                                <div>Active Threads: 4</div>
                                <div>Uptime: 4d 12h</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

          </div>
      </div>
    </div>
  );
};

const LogEntry: React.FC<{ trace: AgentTraceLog, personaColor: string }> = ({ trace, personaColor }) => {
    const [expanded, setExpanded] = useState(false);
    
    // Determine icon based on step
    const StepIcon = () => {
        if (trace.step === 'THINKING') return <Brain size={12} />;
        if (trace.step === 'TOOL_EXECUTION') return <Terminal size={12} />;
        if (trace.step === 'OUTPUT') return <CheckCircle2 size={12} />;
        if (trace.step === 'ERROR') return <Activity size={12} />;
        return <Layers size={12} />;
    };

    return (
        <div className="group animate-in slide-in-from-left-2 duration-300">
            <div 
                onClick={() => setExpanded(!expanded)}
                className={`
                    border rounded-lg p-2.5 transition-all cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30
                    ${expanded ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-700' : 'bg-transparent border-zinc-200 dark:border-zinc-800/50'}
                `}
            >
                <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 min-w-[40px]">
                        <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-600">{trace.timestamp.split(' ')[0]}</span>
                        <div className={`p-1.5 rounded-md ${personaColor}`}>
                            <StepIcon />
                        </div>
                        {expanded && <div className="w-px h-full bg-zinc-300 dark:bg-zinc-800 my-1"></div>}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-wider ${personaColor.split(' ')[0]}`}>
                                    {trace.persona || 'SYSTEM'}
                                </span>
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                                    @{trace.node}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                                    {trace.step}
                                </span>
                                {expanded ? <ChevronDown size={12} className="text-zinc-400"/> : <ChevronRight size={12} className="text-zinc-400"/>}
                            </div>
                        </div>
                        
                        <div className={`text-xs font-mono text-zinc-600 dark:text-zinc-300 leading-relaxed ${!expanded && 'line-clamp-2'}`}>
                            {typeof trace.content === 'string' ? trace.content : JSON.stringify(trace.content)}
                        </div>
                    </div>
                </div>

                {expanded && (
                    <div className="mt-3 pl-12">
                        <div className="bg-white dark:bg-black/50 rounded border border-zinc-200 dark:border-zinc-800 p-3 overflow-x-auto shadow-inner">
                            <pre className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
                                {JSON.stringify(trace, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
