
import React, { useState, useEffect, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, MessageRole, VesselIntelligenceProfile } from '../../types';
import { marinaExpert } from '../../services/agents/marinaAgent';
import { VesselCard } from '../VesselCard';
import { Anchor, Terminal } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({ message }) => {
  const isUser = message.role === MessageRole.User;
  const [vesselProfiles, setVesselProfiles] = useState<Record<string, VesselIntelligenceProfile>>({});

  useEffect(() => {
    if (message.role === MessageRole.Model && message.text) {
      const lowerText = message.text.toLowerCase();
      
      const allVessels = marinaExpert.getAllFleetVessels();
      const foundProfiles: Record<string, VesselIntelligenceProfile> = {};

      allVessels.forEach(vessel => {
          const fullName = vessel.name.toLowerCase();
          const nameParts = fullName.split(' ');
          const coreName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : fullName;

          if (lowerText.includes(fullName) || (coreName.length >= 4 && lowerText.includes(coreName))) {
              foundProfiles[vessel.name] = vessel;
          }
      });

      if (Object.keys(foundProfiles).length > 0) {
          setVesselProfiles(foundProfiles);
      }
    }
  }, [message.text, message.role]);

  if (message.role === MessageRole.System) {
      return (
          <div className="flex justify-center my-12">
              <div className="text-center font-mono flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-[#020617] border border-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.1)] mb-4 animate-pulse-slow">
                    <Anchor className="text-cyan-400" size={24} />
                  </div>
                  <div className="text-[9px] font-bold text-cyan-600/70 uppercase tracking-[0.25em] mb-2">ADA MARINA <span className="text-slate-700 mx-2">——</span> <span className="text-cyan-400">v4.1</span></div>
                  <div className="max-w-md text-[10px] text-slate-500 leading-relaxed font-medium">
                      <span className="text-slate-400 font-bold">Protocol Initialized</span><br/>
                      [ <span className="text-emerald-500 font-bold">OK</span> ] Core System. [ <span className="text-emerald-500 font-bold">OK</span> ] COLREGs. [ <span className="text-emerald-500 font-bold">OK</span> ] Secure Mesh.<br/>
                      <span className="italic opacity-50 mt-2 block">System is operating in Distributed Mode via FastRTC.</span>
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
            {isUser ? (
                <div className="bg-gradient-to-br from-cyan-950/60 to-blue-950/60 text-cyan-50 px-5 py-3 rounded-2xl rounded-tr-sm border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)] inline-block backdrop-blur-md">
                    {message.text}
                </div>
            ) : (
                <div className="text-slate-300 leading-relaxed pl-4 border-l-2 border-cyan-500/10">
                    <ReactMarkdown 
                        components={{
                            strong: ({node, ...props}) => <span className="text-cyan-400 font-bold" {...props} />,
                            code: ({node, ...props}) => <span className="text-amber-400 text-xs bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1 marker:text-cyan-600" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1 marker:text-cyan-600" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-indigo-500/30 pl-3 italic text-slate-400 my-2" {...props} />
                        }}
                    >
                        {message.text}
                    </ReactMarkdown>
                    
                    {/* Injected Vessel Intelligence Cards */}
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
