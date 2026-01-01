
import React, { useEffect, useState } from 'react';
import { Fingerprint, Scan, ShieldCheck, Binary } from 'lucide-react';

interface AuthOverlayProps {
  targetRole: string;
  onComplete: () => void;
}

export const AuthOverlay: React.FC<AuthOverlayProps> = ({ targetRole, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const totalDuration = 2000; 
    const intervalTime = 20;
    const steps = totalDuration / intervalTime;
    
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const prog = Math.min((currentStep / steps) * 100, 100);
      setProgress(prog);

      if (prog > 20 && step === 0) setStep(1); 
      if (prog > 60 && step === 1) setStep(2); 
      if (prog > 90 && step === 2) setStep(3); 

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 200);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [step, onComplete]);

  const getRoleColor = () => {
    switch(targetRole) {
        case 'GENERAL_MANAGER': return 'text-indigo-500 border-indigo-500';
        case 'CAPTAIN': return 'text-emerald-500 border-emerald-500';
        case 'MEMBER': return 'text-purple-500 border-purple-500';
        default: return 'text-zinc-500 border-zinc-500';
    }
  };

  const getRoleLabel = () => {
      switch(targetRole) {
          case 'GENERAL_MANAGER': return 'LEVEL 5 - EXECUTIVE';
          case 'CAPTAIN': return 'LEVEL 3 - COMMAND';
          case 'MEMBER': return 'LEVEL 1 - MEMBER';
          case 'VISITOR': return 'PUBLIC ACCESS';
          default: return 'UNKNOWN';
      }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono cursor-wait">
      <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
          <div className="grid grid-cols-12 gap-4 h-full">
              {[...Array(12)].map((_, i) => (
                  <div key={i} className="border-r border-green-500/20 h-full relative">
                      <div className="absolute top-0 w-full h-20 bg-green-500/20 blur-xl animate-scan" style={{ animationDuration: `${Math.random() * 2 + 1}s` }}></div>
                  </div>
              ))}
          </div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        <div className="relative mb-8">
            <div className={`w-32 h-32 rounded-full border-4 border-dashed animate-[spin_3s_linear_infinite] opacity-30 ${getRoleColor()}`}></div>
            <div className={`absolute inset-0 flex items-center justify-center ${getRoleColor()} animate-pulse`}>
                {step === 0 && <Scan size={48} />}
                {step === 1 && <Fingerprint size={48} />}
                {step === 2 && <Binary size={48} />}
                {step === 3 && <ShieldCheck size={48} />}
            </div>
        </div>

        <div className="text-center space-y-2 mb-8 h-16">
            <div className="text-xs text-zinc-500 uppercase tracking-[0.3em] animate-pulse">
                {step === 0 && "INITIATING HANDSHAKE..."}
                {step === 1 && "VERIFYING BIOMETRICS..."}
                {step === 2 && "DECRYPTING WORKSPACE..."}
                {step === 3 && "ACCESS GRANTED"}
            </div>
            <div className={`text-2xl font-black uppercase tracking-tighter ${getRoleColor().split(' ')[0]}`}>
                {getRoleLabel()}
            </div>
        </div>

        <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
                className={`h-full transition-all duration-75 ease-out ${getRoleColor().replace('text-', 'bg-').split(' ')[0]}`} 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
        <div className="mt-2 text-[10px] text-zinc-600">{Math.round(progress)}% COMPLETE</div>
      </div>
    </div>
  );
};
