
import React from 'react';
import { Activity, Brain, Workflow, Terminal, MessageSquare, Zap } from 'lucide-react';
import { AgentTraceLog } from '../../../types';

interface ObserverTabProps {
  traces: AgentTraceLog[];
}

export const ObserverTab: React.FC<ObserverTabProps> = ({ traces }) => {
  const getStepColor = (step: string) => {
      switch(step) {
          case 'THINKING': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
          case 'TOOL_EXECUTION': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
          case 'OUTPUT': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
          case 'ERROR': return 'text-red-400 border-red-500/30 bg-red-500/10';
          default: return 'text-zinc-400 border-zinc-700 bg-zinc-800/50';
      }
  };

  const getStepIcon = (step: string) => {
      switch(step) {
          case 'THINKING': return <Brain size={12} />;
          case 'TOOL_EXECUTION': return <Terminal size={12} />;
          case 'OUTPUT': return <MessageSquare size={12} />;
          default: return <Zap size={12} />;
      }
  };

  return (
    <div className="h-full w-full bg-[#020617] text-zinc-300 font-mono text-xs flex flex-col overflow-hidden rounded-xl border border-zinc-800">
      <div className="p-3 bg-[#0b101b] border-b border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-500">
              <Workflow size={14} />
              <span className="font-bold tracking-widest text-white text-[10px] uppercase">Neural Feed</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] text-zinc-500 uppercase">Live</span>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {traces.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-800">
                  <Activity size={24} className="mb-2 opacity-50"/>
                  <span className="text-[10px]">Awaiting signals...</span>
              </div>
          ) : (
              <div className="flex flex-col">
                  {traces.map((trace, idx) => (
                      <div key={trace.id || idx} className="flex gap-3 p-2 border-b border-white/5 hover:bg-white/5 transition-colors">
                          <div className="flex-shrink-0 w-14 text-right text-zinc-600 pt-0.5 text-[10px]">
                              {trace.timestamp.split(' ')[0]}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-1.5 py-px rounded text-[9px] font-bold border flex items-center gap-1 ${getStepColor(trace.step)}`}>
                                      {getStepIcon(trace.step)}
                                      {trace.step}
                                  </span>
                                  <span className="text-zinc-500 text-[10px]">@</span>
                                  <span className="text-indigo-400 font-bold text-[10px]">{trace.node}</span>
                              </div>
                              <div className="text-zinc-400 line-clamp-2 leading-relaxed opacity-90 text-[10px]">
                                  {typeof trace.content === 'string' ? trace.content : JSON.stringify(trace.content)}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};
