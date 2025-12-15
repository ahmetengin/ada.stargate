
import React from 'react';
import { X, Brain, Activity } from 'lucide-react';
import { AgentTraceLog } from '../../types';

interface AgentTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  traces: AgentTraceLog[];
}

export const AgentTraceModal: React.FC<AgentTraceModalProps> = ({ isOpen, onClose, traces }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="w-full max-w-4xl h-[85vh] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col font-mono text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0 bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-indigo-400">
                <Brain size={18} />
                <h2 className="font-bold tracking-wider text-sm">SYSTEM INTELLIGENCE</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar bg-black/20">
            {traces.length > 0 ? traces.map((trace) => (
                <div key={trace.id} className="flex gap-3 p-2 rounded transition-colors border-l-2 border-zinc-700 bg-zinc-900/20">
                    <div className="flex-shrink-0 w-20 opacity-60 text-zinc-500">{trace.timestamp}</div>
                    <div className="flex-shrink-0 w-28 font-bold uppercase tracking-wider text-indigo-400">{trace.node}</div>
                    <div className="flex-shrink-0 w-28 text-zinc-400">{trace.step}</div>
                    <code className="break-words leading-relaxed whitespace-pre-wrap text-zinc-300 flex-1 font-mono">
                        {typeof trace.content === 'string' ? trace.content : JSON.stringify(trace.content)}
                    </code>
                </div>
            )) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2">
                    <Activity size={32} className="opacity-20"/>
                    <span>No trace data available.</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
