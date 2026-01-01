
import React from 'react';
import { GitBranch, User, AlertCircle, Sparkles, Activity } from 'lucide-react';
import { UserProfile } from '../../types';

interface StatusBarProps {
  userProfile: UserProfile;
  onToggleAuth: () => void;
  nodeHealth: string;
  latency: number;
  activeChannel: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  userProfile, 
  onToggleAuth,
  nodeHealth,
}) => {
  const isGM = userProfile.role === 'GENERAL_MANAGER';
  const isLegalRed = userProfile.legalStatus === 'RED';

  return (
    <div className="h-7 w-full flex items-center justify-between select-none font-mono text-[10px] bg-[#020617] border-t border-white/10 text-slate-500 z-50">
      <div className="flex items-center h-full">
        <div className="flex items-center px-3 border-r border-white/10 gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-bold text-emerald-400">node/wim-alpha</span>
          <GitBranch size={10} />
        </div>
        
        <div className="flex items-center px-3 border-r border-white/10 gap-2">
           <Activity size={10} className={nodeHealth === 'working' ? 'animate-spin' : 'text-slate-600'} />
           <span>v5.5-STABLE</span>
        </div>

        <div className="flex items-center px-3 border-r border-white/10 gap-2 text-purple-400">
            <Sparkles size={10} className="animate-pulse" />
            <span className="font-bold">SEAL_ADAPTATION: READY</span>
        </div>
      </div>

      <div className="flex items-center h-full">
         <button 
           onClick={onToggleAuth}
           className={`flex items-center gap-2 px-3 h-full border-l border-white/10 hover:bg-white/5 transition-all uppercase font-bold tracking-wider ${
             isLegalRed ? 'text-red-500 bg-red-500/10' : isGM ? 'text-indigo-400' : 'text-slate-400'
           }`}
         >
            <User size={10} />
            <span>{userProfile.name}</span>
         </button>

         <div className="flex items-center px-3 border-l border-white/10">
            <AlertCircle size={10} className={isLegalRed ? 'text-red-500 animate-pulse' : 'text-slate-600'} />
         </div>
      </div>
    </div>
  );
};
