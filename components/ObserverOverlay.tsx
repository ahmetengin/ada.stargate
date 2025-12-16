
import React, { useState, useEffect, useRef } from 'react';
import { 
    Activity, Brain, Workflow, X, 
    Search, Pause, Play, Terminal, Database, LineChart,
    Layers, Cpu, Shield, Anchor, CreditCard, Scale,
    ChevronRight, Box, Code, MessageSquare, Zap, Coins, Hash
} from 'lucide-react';
import { AgentTraceLog } from '../types';

interface ObserverOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  traces: AgentTraceLog[];
}

// --- MOCK AGENT STATUS DATA (Simulation of Backend State) ---
// Simulating live token usage and costs for the "God Mode" view
const AGENT_CATALOG = [
    { id: 'ada.stargate', name: 'ORCHESTRATOR', role: 'ROUTER', status: 'ACTIVE', context: '124k/200k', tokens: '1.2M', cost: '$4.12', latency: '45ms', color: 'text-indigo-400' },
    { id: 'ada.marina', name: 'MARINA OPS', role: 'EXPERT', status: 'IDLE', context: '14k/128k', tokens: '450k', cost: '$1.80', latency: '120ms', color: 'text-cyan-400' },
    { id: 'ada.finance', name: 'FINANCE CORE', role: 'EXPERT', status: 'WORKING', context: '88k/128k', tokens: '890k', cost: '$3.45', latency: '210ms', color: 'text-emerald-400' },
    { id: 'ada.legal', name: 'LEGAL COUNSEL', role: 'EXPERT', status: 'IDLE', context: '190k/200k', tokens: '2.1M', cost: '$8.50', latency: '85ms', color: 'text-blue-400' },
    { id: 'ada.security', name: 'SECURITY GRID', role: 'EXPERT', status: 'IDLE', context: '4k/32k', tokens: '120k', cost: '$0.40', latency: '12ms', color: 'text-red-400' },
    { id: 'ada.vhf', name: 'VOICE LINK', role: 'WORKER', status: 'LISTENING', context: 'Stream', tokens: 'N/A', cost: '$0.00', latency: '5ms', color: 'text-amber-400' },
];

export const ObserverOverlay: React.FC<ObserverOverlayProps> = ({ isOpen, onClose, traces }) => {
  const [autoFollow, setAutoFollow] = useState(true);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
      if(autoFollow && scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [traces, autoFollow]);

  if (!isOpen) return null;

  const filteredTraces = traces.filter(t => 
    JSON.stringify(t).toLowerCase().includes(filter.toLowerCase())
  );

  const selectedTrace = traces.find(t => t.id === selectedTraceId) || traces[traces.length - 1];

  // Helper to estimate token usage based on character count (approx 4 chars per token)
  const estimateTokens = (content: any) => {
      const str = typeof content === 'string' ? content : JSON.stringify(content);
      const len = str.length;
      const inputTokens = Math.ceil(len / 4);
      const outputTokens = Math.ceil(inputTokens * 0.2); // Mock ratio
      return { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens };
  };

  const getStepColor = (step: string) => {
      switch(step) {
          case 'THINKING': 
          case 'PLANNING': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
          case 'TOOL_EXECUTION': 
          case 'TOOL_CALL': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
          case 'OUTPUT': 
          case 'FINAL_ANSWER': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
          case 'ERROR': 
          case 'CRITICAL': return 'text-red-400 border-red-500/30 bg-red-500/10';
          case 'ROUTING': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
          default: return 'text-zinc-400 border-zinc-700 bg-zinc-800/50';
      }
  };

  const getStepIcon = (step: string) => {
      switch(step) {
          case 'THINKING': return <Brain size={12} />;
          case 'TOOL_EXECUTION': return <Terminal size={12} />;
          case 'OUTPUT': return <MessageSquare size={12} />;
          case 'ROUTING': return <Workflow size={12} />;
          case 'ERROR': return <Activity size={12} />;
          default: return <Zap size={12} />;
      }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#020617] text-zinc-300 font-mono text-xs flex flex-col animate-in fade-in duration-200 selection:bg-indigo-500/30">
      
      {/* 1. Header Toolbar */}
      <div className="flex-shrink-0 h-12 flex items-center justify-between px-4 border-b border-white/10 bg-[#0b101b]">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-indigo-500">
                <Cpu className="" size={18} />
                <h2 className="font-bold tracking-widest text-white text-sm">ADA.HYPERSCALE <span className="text-zinc-600">///</span> SYSTEM ARCHITECT</h2>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-4 text-[10px] text-zinc-500">
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> NEURAL LINK ACTIVE</span>
                <span>WS_LATENCY: 12ms</span>
                <span>TOTAL_TOKENS: 4.2M</span>
                <span>SESSION_COST: $12.45</span>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center bg-black/40 rounded border border-white/5 px-2 py-1">
                <Search size={12} className="text-zinc-500 mr-2"/>
                <input 
                    type="text" 
                    placeholder="Filter traces..." 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-transparent border-none text-zinc-300 focus:outline-none w-48 placeholder:text-zinc-700 h-full"
                />
            </div>
            
            <button 
                onClick={() => setAutoFollow(!autoFollow)}
                className={`flex items-center gap-2 px-3 py-1 rounded border transition-all ${autoFollow ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
            >
                {autoFollow ? <Pause size={10}/> : <Play size={10}/>}
                <span className="font-bold">{autoFollow ? 'LIVE' : 'PAUSED'}</span>
            </button>

            <button onClick={onClose} className="p-1.5 hover:bg-red-500/20 rounded text-zinc-500 hover:text-red-400 transition-colors">
                <X size={16} />
            </button>
        </div>
      </div>

      {/* 2. Main 3-Column Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* LEFT PANE: NODE TOPOLOGY & COST */}
        <div className="col-span-2 border-r border-white/10 bg-[#050b14] flex flex-col min-w-[240px]">
            <div className="p-3 border-b border-white/5 bg-[#0a0f18] flex justify-between items-center">
                <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Active Nodes</span>
                <span className="text-[9px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">Memory Usage</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {AGENT_CATALOG.map(agent => (
                    <div key={agent.id} className="p-2 rounded border border-white/5 bg-[#0e1420] hover:border-indigo-500/30 transition-all cursor-pointer group">
                        <div className="flex justify-between items-center mb-1">
                            <span className={`font-bold ${agent.color} text-[11px]`}>{agent.id}</span>
                            <span className={`text-[9px] px-1 py-px rounded ${agent.status === 'WORKING' ? 'bg-amber-500/20 text-amber-500' : 'bg-zinc-800 text-zinc-600'}`}>
                                {agent.status}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2 mb-1">
                            <span>Context</span>
                            <span className="font-mono text-zinc-400">{agent.context}</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mb-2">
                            <div className={`h-full ${agent.color.replace('text-', 'bg-')}`} style={{ width: Math.random() * 80 + 10 + '%' }}></div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                            <div>
                                <div className="text-[9px] text-zinc-600 uppercase">Tokens</div>
                                <div className="text-[10px] font-mono text-zinc-400">{agent.tokens}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] text-zinc-600 uppercase">Cost</div>
                                <div className="text-[10px] font-mono text-emerald-500">{agent.cost}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Infrastructure Stats */}
            <div className="p-3 border-t border-white/10 bg-[#020617] text-[10px] space-y-2">
                <div className="flex justify-between text-zinc-500">
                    <span>Qdrant (Vector)</span>
                    <span className="text-zinc-300">450MB / 1GB</span>
                </div>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[45%]"></div>
                </div>
                <div className="flex justify-between text-zinc-500">
                    <span>Redis Stream</span>
                    <span className="text-zinc-300">88 msg/s</span>
                </div>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[70%]"></div>
                </div>
            </div>
        </div>

        {/* MIDDLE PANE: EVENT STREAM */}
        <div className="col-span-6 border-r border-white/10 bg-[#020617] flex flex-col relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0" ref={scrollRef}>
                {filteredTraces.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-800 gap-4">
                        <Activity size={64} className="opacity-20 animate-pulse"/>
                        <span className="text-xs uppercase tracking-widest font-bold">Waiting for Telemetry...</span>
                    </div>
                )}
                
                <div className="flex flex-col font-mono text-[11px]">
                    {filteredTraces.map((trace, idx) => {
                        const style = getStepColor(trace.step);
                        const isSelected = selectedTraceId === trace.id;

                        return (
                            <div 
                                key={trace.id || idx} 
                                onClick={() => setSelectedTraceId(trace.id)}
                                className={`flex gap-0 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group ${isSelected ? 'bg-white/5' : ''}`}
                            >
                                {/* Timestamp Column */}
                                <div className="w-20 p-2 text-zinc-600 text-right border-r border-white/5 bg-[#050b14]/50">
                                    {trace.timestamp.split(' ')[0]}
                                </div>
                                
                                {/* Content Column */}
                                <div className="flex-1 p-2 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-1.5 py-px rounded text-[9px] font-bold border flex items-center gap-1 uppercase tracking-wider ${style}`}>
                                            {getStepIcon(trace.step)}
                                            {trace.step}
                                        </span>
                                        <span className="text-zinc-600">via</span>
                                        <span className="text-zinc-300 font-bold hover:underline decoration-zinc-600">{trace.node}</span>
                                    </div>
                                    <div className="text-zinc-400 pl-1 line-clamp-2 leading-relaxed opacity-90 group-hover:text-zinc-200 transition-colors">
                                        {typeof trace.content === 'string' ? trace.content : JSON.stringify(trace.content)}
                                    </div>
                                </div>
                                
                                {/* Arrow */}
                                <div className="w-8 flex items-center justify-center text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* RIGHT PANE: DEEP INSPECTOR & TOKENOMICS */}
        <div className="col-span-4 bg-[#050b14] flex flex-col">
            <div className="p-3 border-b border-white/5 bg-[#0a0f18] flex justify-between items-center">
                <div className="flex items-center gap-2 text-zinc-300">
                    <Box size={14} className="text-indigo-500"/>
                    <span className="font-bold text-[10px] uppercase tracking-wider">Payload Inspector</span>
                </div>
                {selectedTrace && (
                    <span className="text-[10px] font-mono text-zinc-500">{selectedTrace.id}</span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {selectedTrace ? (
                    <div className="space-y-6 animate-in slide-in-from-right-2 duration-200">
                        
                        {/* Token Consumption Card (Detailed) */}
                        <div className="bg-[#0e1420] rounded-lg border border-white/5 overflow-hidden">
                            <div className="bg-white/5 px-3 py-2 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-2">
                                    <Hash size={12} /> Token Topology
                                </span>
                                <span className="text-[10px] text-emerald-500 font-mono">gemini-3-pro-preview</span>
                            </div>
                            <div className="p-3 grid grid-cols-3 gap-2 text-center">
                                <div className="bg-black/40 p-2 rounded border border-white/5">
                                    <div className="text-[9px] text-zinc-500 uppercase mb-1">Input</div>
                                    <div className="text-sm font-mono font-bold text-blue-400">
                                        {estimateTokens(selectedTrace.content).input}
                                    </div>
                                </div>
                                <div className="bg-black/40 p-2 rounded border border-white/5">
                                    <div className="text-[9px] text-zinc-500 uppercase mb-1">Output</div>
                                    <div className="text-sm font-mono font-bold text-purple-400">
                                        {estimateTokens(selectedTrace.content).output}
                                    </div>
                                </div>
                                <div className="bg-black/40 p-2 rounded border border-white/5">
                                    <div className="text-[9px] text-zinc-500 uppercase mb-1">Est. Cost</div>
                                    <div className="text-sm font-mono font-bold text-emerald-400">
                                        ${(estimateTokens(selectedTrace.content).total * 0.00001).toFixed(5)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/5 rounded-lg overflow-hidden">
                            <div className="bg-[#0e1420] p-3">
                                <span className="text-[9px] text-zinc-500 uppercase block mb-1">Source Node</span>
                                <span className="text-indigo-400 font-bold">{selectedTrace.node}</span>
                            </div>
                            <div className="bg-[#0e1420] p-3">
                                <span className="text-[9px] text-zinc-500 uppercase block mb-1">Step Type</span>
                                <span className={`text-[10px] font-bold ${getStepColor(selectedTrace.step).split(' ')[0]}`}>{selectedTrace.step}</span>
                            </div>
                            <div className="bg-[#0e1420] p-3">
                                <span className="text-[9px] text-zinc-500 uppercase block mb-1">Persona</span>
                                <span className="text-zinc-300">{selectedTrace.persona}</span>
                            </div>
                            <div className="bg-[#0e1420] p-3">
                                <span className="text-[9px] text-zinc-500 uppercase block mb-1">Timestamp</span>
                                <span className="text-zinc-300">{selectedTrace.timestamp}</span>
                            </div>
                        </div>

                        {/* Raw Content Viewer */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <Code size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Payload Content</span>
                                </div>
                                <button className="text-[9px] text-zinc-600 hover:text-white uppercase transition-colors">Copy JSON</button>
                            </div>
                            <div className="bg-[#020617] rounded-lg border border-white/10 p-3 overflow-x-auto relative group">
                                <pre className="font-mono text-[10px] leading-relaxed text-zinc-300 whitespace-pre-wrap">
                                    {typeof selectedTrace.content === 'object' 
                                        ? JSON.stringify(selectedTrace.content, null, 2) 
                                        : selectedTrace.content}
                                </pre>
                            </div>
                        </div>

                        {/* Analysis Mockup based on step */}
                        {selectedTrace.step === 'TOOL_EXECUTION' && (
                            <div className="bg-emerald-900/10 border border-emerald-500/20 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-emerald-500 mb-2">
                                    <CheckCircle size={12} />
                                    <span className="text-[10px] font-bold uppercase">Execution Successful</span>
                                </div>
                                <div className="h-1 w-full bg-emerald-900/30 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-full animate-pulse"></div>
                                </div>
                            </div>
                        )}
                        
                        {selectedTrace.step === 'ERROR' && (
                            <div className="bg-red-900/10 border border-red-500/20 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-red-500 mb-2">
                                    <X size={12} />
                                    <span className="text-[10px] font-bold uppercase">Exception Caught</span>
                                </div>
                                <p className="text-[10px] text-red-400">
                                    Process terminated. Stack trace logged to telemetry.
                                </p>
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700 opacity-50">
                        <Search size={48} className="mb-4 opacity-50"/>
                        <p className="text-center text-xs">Select a trace event to inspect<br/>payloads and metadata.</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

// Helper Icon
const CheckCircle = ({size}: {size: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
