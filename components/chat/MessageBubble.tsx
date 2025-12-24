
// components/chat/MessageBubble.tsx

import React, { useState, useEffect, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, MessageRole, EpisodeId, VesselIntelligenceProfile } from '../../types';
import { marinaExpert } from '../../services/agents/marinaAgent';
import { VesselCard } from '../VesselCard';
import { Anchor, Terminal, Sparkles, ShieldAlert, Zap, Globe, Ship } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const EpisodeCard = ({ id, text }: { id: EpisodeId, text: string }) => {
    const config = {
        'EPISODE_A': { label: 'WELCOME HOME', icon: Anchor, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
        'EPISODE_B': { label: 'GUARDIAN PROTOCOL', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
        'EPISODE_C': { label: 'SAFETY NET', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
        'EPISODE_G': { label: 'EXTRACTION', icon: Globe, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
        'EPISODE_H': { label: 'BLUE SHIELD', icon: Ship, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
        'NONE': { label: 'OPERATIONAL', icon: Terminal, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' }
    };
    
    const meta = config[id] || config.NONE;
    const Icon = meta.icon;

    return (
        <div className={`my-6 rounded-2xl border ${meta.border} ${meta.bg} p-6 relative overflow-hidden animate-in zoom-in-95 duration-500`}>
            <div className="absolute -right-8 -top-8 opacity-5">
                <Icon size={160} />
            </div>
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-black/40 border ${meta.border}`}>
                    <Icon className={meta.color} size={20} />
                </div>
                <div>
                    <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${meta.color}`}>{meta.label}</div>
                    <div className="text-[9px] text-slate-500 font-mono">SCENARIO_ID: {id}</div>
                </div>
            </div>
            <div className="text-slate-200 text-sm leading-relaxed font-medium italic">
                "{text}"
            </div>
            <div className="mt-4 flex gap-1">
                <div className={`h-1 flex-1 ${meta.color.replace('text', 'bg')} opacity-50 rounded-full`}></div>
                <div className={`h-1 flex-1 ${meta.color.replace('text', 'bg')} opacity-20 rounded-full`}></div>
                <div className={`h-1 flex-1 ${meta.color.replace('text', 'bg')} opacity-10 rounded-full`}></div>
            </div>
        </div>
    );
};

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({ message }) => {
  const isUser = message.role === MessageRole.User;
  const [vesselProfiles, setVesselProfiles] = useState<Record<string, VesselIntelligenceProfile>>({});

  useEffect(() => {
    if (message.text) {
      const lowerText = message.text.toLowerCase();
      const allVessels = marinaExpert.getAllFleetVessels();
      const foundProfiles: Record<string, VesselIntelligenceProfile> = {};

      allVessels.forEach(vessel => {
          if (lowerText.includes(vessel.name.toLowerCase())) {
              foundProfiles[vessel.name] = vessel;
          }
      });
      if (Object.keys(foundProfiles).length > 0) setVesselProfiles(foundProfiles);
    }
  }, [message.text]);

  if (message.role === MessageRole.Episode && message.episodeId) {
      return <EpisodeCard id={message.episodeId} text={message.text} />;
  }

  if (message.role === MessageRole.System) {
      return (
          <div className="flex justify-center my-12">
              <div className="text-center font-mono flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-[#020617] border border-indigo-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.1)] mb-4 animate-pulse-slow">
                    <Anchor className="text-indigo-400" size={24} />
                  </div>
                  <div className="text-[9px] font-bold text-indigo-600/70 uppercase tracking-[0.25em] mb-2">ADA MARINA <span className="text-slate-700 mx-2">——</span> <span className="text-indigo-400">v5.5 HYPERSCALE</span></div>
                  <div className="max-w-md text-[10px] text-slate-500 leading-relaxed font-medium">
                      <span className="text-slate-400 font-bold">Cognitive Architecture Initialized</span><br/>
                      [ <span className="text-emerald-500 font-bold">OK</span> ] CoALA Brain. [ <span className="text-emerald-500 font-bold">OK</span> ] ACE Playbooks. [ <span className="text-emerald-500 font-bold">OK</span> ] Secure Mesh.<br/>
                      <span className="italic opacity-50 mt-2 block">Sovereign Domain Control Active. Waiting for Operator Command...</span>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
            <div className="mr-4 pt-1 flex-shrink-0">
                <div className="w-8 h-8 bg-[#0a101d] border border-white/5 flex items-center justify-center rounded-lg text-cyan-500 shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-cyan-500/10 blur-md group-hover:bg-cyan-500/20 transition-all"></div>
                    <Terminal size={14} className="relative z-10" />
                </div>
            </div>
        )}
        
        <div className={`max-w-2xl font-mono text-sm ${isUser ? 'text-right' : 'text-left'}`}>
            {message.nodePath && (
                <div className="text-[9px] text-indigo-400/60 font-bold uppercase tracking-widest mb-1 px-2">
                    {message.nodePath}
                </div>
            )}
            
            {isUser ? (
                <div className="bg-gradient-to-br from-cyan-950/60 to-blue-950/60 text-cyan-50 px-5 py-3 rounded-2xl rounded-tr-sm border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)] inline-block backdrop-blur-md">
                    {message.text}
                </div>
            ) : (
                <div className="text-slate-300 leading-relaxed pl-4 border-l-2 border-cyan-500/10 relative group">
                    <div className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <ReactMarkdown 
                        components={{
                            strong: ({node, ...props}) => <span className="text-cyan-400 font-bold" {...props} />,
                            code: ({node, ...props}) => <span className="text-amber-400 text-xs bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                        }}
                    >
                        {message.text}
                    </ReactMarkdown>
                    
                    <div className="space-y-4 mt-4">
                        {Object.values(vesselProfiles).map((profile, idx) => (
                            <VesselCard key={idx} profile={profile} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
});
