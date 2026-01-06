
import React, { useState, useEffect, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, MessageRole, VesselIntelligenceProfile } from '../../types';
import { marinaExpert } from '../../services/agents/marinaAgent';
import { VesselCard } from './VesselCard';
import { Terminal, Shield, User, Bot, Cpu } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({ message }) => {
  const isUser = message.role === MessageRole.User;
  const isEpisode = message.role === MessageRole.Episode;
  const [vesselProfiles, setVesselProfiles] = useState<Record<string, VesselIntelligenceProfile>>({});

  useEffect(() => {
    if (message.role !== MessageRole.User && message.text) {
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
  }, [message.text, message.role]);

  if (message.role === MessageRole.System) {
      return (
          <div className="flex justify-center my-8">
              <div className="relative group">
                  <div className="absolute inset-0 bg-tech-500/20 blur-xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity"></div>
                  <div className="relative border border-tech-800 bg-void/80 backdrop-blur px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div className="text-[10px] font-mono text-tech-400 tracking-widest uppercase">
                          Ada Stargate v5.5 <span className="text-slate-600 mx-2">|</span> Core Online
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
        
        {/* Avatar / Icon */}
        {!isUser && (
            <div className="mr-4 mt-1 shrink-0 flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded bg-tech-950 border border-tech-800 flex items-center justify-center text-tech-400 shadow-[0_0_10px_rgba(20,184,166,0.2)]`}>
                    {isEpisode ? <Shield size={14} /> : <Cpu size={14} />}
                </div>
                {message.nodePath && (
                   <div className="w-px h-full bg-tech-900/50 my-1"></div>
                )}
            </div>
        )}
        
        <div className={`max-w-[85%] lg:max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}>
            
            {/* Header for System Messages */}
            {!isUser && (
                <div className="flex items-center gap-2 mb-1.5 opacity-70 pl-1">
                    <span className="text-[9px] font-tech font-bold uppercase tracking-widest text-tech-500">
                        {message.nodePath || 'ADA.STARGATE'}
                    </span>
                    <span className="text-[8px] font-mono text-slate-600">
                        {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                    </span>
                </div>
            )}

            {/* Bubble Content */}
            <div className={`
                relative p-4 text-sm font-sans leading-relaxed shadow-lg backdrop-blur-sm
                ${isUser 
                    ? 'bg-tech-600 text-white rounded-l-xl rounded-tr-xl rounded-br-none border border-tech-500' 
                    : 'bg-tech-950/40 text-slate-300 rounded-r-xl rounded-bl-xl rounded-tl-none border border-tech-900/60'
                }
            `}>
                {/* Tech Corner Accent for System Messages */}
                {!isUser && (
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tech-500/50"></div>
                )}

                <ReactMarkdown 
                    components={{
                        strong: ({node, ...props}) => <span className="text-tech-300 font-bold font-display tracking-wide" {...props} />,
                        code: ({node, ...props}) => <span className="bg-black/30 border border-tech-900 px-1.5 py-0.5 rounded text-[10px] font-code text-neon-amber" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 my-2 marker:text-tech-500" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 my-2 marker:text-tech-500" {...props} />,
                    }}
                >
                    {message.text}
                </ReactMarkdown>
                
                {/* Vessel Cards Injection */}
                {Object.keys(vesselProfiles).length > 0 && !isUser && (
                    <div className="mt-4 pt-4 border-t border-tech-900/50 space-y-3">
                        {Object.values(vesselProfiles).map((profile, idx) => (
                            <VesselCard key={idx} profile={profile} />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer / Trace Info */}
            {message.executionResult && !isUser && (
                <div className="mt-1 pl-1 flex items-center gap-2">
                    <div className="h-px w-4 bg-tech-800"></div>
                    <span className="text-[9px] font-mono text-slate-600 uppercase">
                        Code Executed: {message.executionResult}
                    </span>
                </div>
            )}
        </div>

        {/* User Icon (Right Side) */}
        {isUser && (
            <div className="ml-4 mt-1 shrink-0">
                <div className="w-8 h-8 rounded-full bg-tech-600 flex items-center justify-center text-white shadow-lg">
                    <User size={14} />
                </div>
            </div>
        )}

    </div>
  );
});
