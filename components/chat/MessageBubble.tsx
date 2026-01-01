
import React, { useState, useEffect, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, MessageRole, VesselIntelligenceProfile } from '../../types';
import { marinaExpert } from '../../services/agents/marinaAgent';
import { VesselCard } from './VesselCard';
import { Terminal, Shield } from 'lucide-react';

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
          <div className="flex justify-center my-10 py-6 border-y border-indigo-500/10">
              <div className="text-center font-mono space-y-3">
                  <div className="text-indigo-500 font-black tracking-[0.4em] text-xs uppercase">Ada Stargate v5.5 Activated</div>
                  <div className="text-[10px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
                      Sovereign Domain Mesh Online. SEAL learning protocol armed. Monitoring OneNet telemetry.
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
            <div className="mr-3 mt-1 shrink-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${isEpisode ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500'}`}>
                    {isEpisode ? <Shield size={14} /> : <Terminal size={14} />}
                </div>
            </div>
        )}
        
        <div className={`max-w-[85%] font-mono text-xs lg:text-sm ${isUser ? 'text-right' : 'text-left'}`}>
            {isUser ? (
                <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm inline-block">
                    {message.text}
                </div>
            ) : (
                <div className={`px-4 py-3 rounded-2xl rounded-tl-sm border transition-colors ${isEpisode ? 'bg-amber-950/10 border-amber-500/20 text-amber-100' : 'bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/50 text-zinc-800 dark:text-zinc-200'}`}>
                    <ReactMarkdown 
                        components={{
                            strong: ({node, ...props}) => <span className="text-indigo-400 font-bold" {...props} />,
                            code: ({node, ...props}) => <span className="bg-black/20 px-1 rounded text-pink-400" {...props} />,
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
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
