
import React, { useState } from 'react';
import { Activity, Users, MapPin, Building2, Search } from 'lucide-react';
import { CongressEvent, Delegate } from '../../../types';

interface CongressTabProps {
  eventDetails: CongressEvent | null;
  delegates: Delegate[];
}

export const CongressTab: React.FC<CongressTabProps> = ({ eventDetails, delegates }) => {
  const [sortParam, setSortParam] = useState<'name' | 'company' | 'status'>('name');
  const [searchTerm, setSearchTerm] = useState('');

  if (!eventDetails) return <div className="p-4 text-xs font-mono text-zinc-500 animate-pulse">Establishing Event Uplink...</div>;

  const filteredDelegates = delegates
    .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.company.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a[sortParam] > b[sortParam] ? 1 : -1);

  return (
    <div className="h-full flex flex-col bg-[#020617] animate-in fade-in duration-500">
      
      {/* EVENT HUD (FIXED TOP) */}
      <div className="flex-shrink-0 p-4 border-b border-white/5 bg-[#050b14]">
        <div className="bg-zinc-900/50 border border-indigo-500/30 p-5 rounded-xl shadow-sm backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5">
                <Activity size={80} />
            </div>
            
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div> ADA.CONGRESS.KITES
                    </div>
                    <div className="text-2xl font-black text-white uppercase tracking-tight max-w-md leading-none">
                        {eventDetails.name}
                    </div>
                    <div className="text-xs font-mono text-zinc-400 mt-2 flex items-center gap-4">
                        <span className="flex items-center gap-1"><MapPin size={12}/> WIM Grand Ballroom</span>
                        <span className="flex items-center gap-1"><Building2 size={12}/> Kites Logistics</span>
                    </div>
                </div>
                
                <div className="text-right">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Protocol Status</div>
                    <div className="text-lg font-mono font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20 inline-block mt-1">
                        {eventDetails.status}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mt-6">
                <div className="bg-black/30 p-3 rounded border border-white/5">
                    <div className="text-[9px] text-zinc-500 uppercase font-bold">Total Pax</div>
                    <div className="text-xl font-mono font-bold text-zinc-200">{eventDetails.delegateCount}</div>
                </div>
                <div className="bg-black/30 p-3 rounded border border-white/5">
                    <div className="text-[9px] text-zinc-500 uppercase font-bold">On Site</div>
                    <div className="text-xl font-mono font-bold text-emerald-500">{delegates.filter(d => d.status === 'CHECKED_IN').length}</div>
                </div>
                <div className="bg-black/30 p-3 rounded border border-white/5">
                    <div className="text-[9px] text-zinc-500 uppercase font-bold">In Transit</div>
                    <div className="text-xl font-mono font-bold text-amber-500">{delegates.filter(d => d.status === 'IN_TRANSIT').length}</div>
                </div>
            </div>
        </div>
      </div>

      {/* DELEGATE ROSTER (SCROLLABLE) */}
      <div className="flex-1 overflow-hidden flex flex-col p-4">
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="p-3 border-b border-zinc-800 bg-white/5 flex justify-between items-center shrink-0">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <Users size={14} /> Personnel Manifest
                </h4>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search size={12} className="absolute left-2 top-1.5 text-zinc-500" />
                        <input 
                            type="text" 
                            placeholder="Filter..." 
                            className="pl-6 pr-2 py-1 text-[10px] bg-black border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-indigo-500 w-32"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="text-[10px] bg-black border border-zinc-700 rounded px-2 py-1 text-zinc-400 focus:outline-none"
                        value={sortParam}
                        onChange={(e) => setSortParam(e.target.value as any)}
                    >
                        <option value="name">Sort: Name</option>
                        <option value="company">Sort: Company</option>
                        <option value="status">Sort: Status</option>
                    </select>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {filteredDelegates.map(del => (
                    <div key={del.id} className="flex justify-between items-center p-3 bg-zinc-900/50 rounded hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-all group">
                        <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-8 rounded-full ${
                                del.status === 'CHECKED_IN' ? 'bg-emerald-500' : 
                                del.status === 'IN_TRANSIT' ? 'bg-amber-500' : 'bg-zinc-600'
                            }`}></div>
                            <div>
                                <div className="font-bold text-sm text-zinc-200 group-hover:text-indigo-400 transition-colors">{del.name}</div>
                                <div className="text-[10px] text-zinc-500 uppercase">{del.company}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                                del.status === 'CHECKED_IN' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                                del.status === 'IN_TRANSIT' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                                'bg-zinc-800 text-zinc-500 border-zinc-700'
                            }`}>
                                {del.status.replace('_', ' ')}
                            </span>
                            <div className="text-[9px] text-zinc-600 mt-1 font-mono">{del.location}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
