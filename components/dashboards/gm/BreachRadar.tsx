
import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert, Target, Crosshair } from 'lucide-react';

export const BreachRadar: React.FC = () => {
  const [sweepAngle, setSweepAngle] = useState(0);
  
  // Animation loop for radar
  useEffect(() => {
    const interval = setInterval(() => {
        setSweepAngle(prev => (prev + 2) % 360);
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const breaches = [
    { id: 'BR-01', vessel: 'Speedboat X', issue: 'Restricted Zone', severity: 'CRITICAL', time: '10:42', r: 35, theta: 45 },
    { id: 'BR-02', vessel: 'S/Y Mistral', issue: 'Overstay (48h)', severity: 'MEDIUM', time: '09:15', r: 60, theta: 130 },
    { id: 'BR-03', vessel: 'JetSki-04', issue: 'Speeding (8kn)', severity: 'HIGH', time: '11:05', r: 25, theta: 290 },
  ];

  // Calculate coordinates for blips
  const getCoordinates = (r: number, theta: number) => {
      const rad = (theta - 90) * (Math.PI / 180);
      const x = 50 + (r * Math.cos(rad) * 0.5); // 0.5 scale to fit
      const y = 50 + (r * Math.sin(rad) * 0.5);
      return { x, y };
  };

  return (
    <div className="flex flex-col h-full">
        <div className="p-4 flex gap-6 items-center">
            
            {/* RADAR VISUALIZER */}
            <div className="relative w-32 h-32 flex-shrink-0 bg-black rounded-full border-2 border-zinc-800 shadow-[0_0_20px_rgba(0,255,0,0.1)] overflow-hidden">
                {/* Grid Lines */}
                <div className="absolute inset-0 rounded-full border border-zinc-800 scale-50"></div>
                <div className="absolute inset-0 rounded-full border border-zinc-800 scale-75"></div>
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zinc-800"></div>
                <div className="absolute left-0 right-0 top-1/2 h-px bg-zinc-800"></div>

                {/* Sweep Line */}
                <div 
                    className="absolute top-1/2 left-1/2 w-[50%] h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-emerald-500 origin-left"
                    style={{ transform: `rotate(${sweepAngle}deg)` }}
                ></div>
                <div 
                    className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(16,185,129,0.1)_30deg,transparent_60deg)]"
                    style={{ transform: `rotate(${sweepAngle - 30}deg)` }}
                ></div>

                {/* Blips */}
                {breaches.map(b => {
                    const pos = getCoordinates(b.r, b.theta);
                    const isSwept = Math.abs(sweepAngle - b.theta) < 15;
                    return (
                        <div 
                            key={b.id}
                            className={`absolute w-1.5 h-1.5 rounded-full -ml-0.5 -mt-0.5 transition-opacity duration-1000 ${
                                b.severity === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-amber-500'
                            }`}
                            style={{ 
                                left: `${pos.x}%`, 
                                top: `${pos.y}%`,
                                opacity: isSwept ? 1 : 0.4
                            }}
                        ></div>
                    );
                })}
            </div>

            {/* LIST */}
            <div className="flex-1 space-y-2">
                {breaches.map(b => (
                    <div key={b.id} className="flex justify-between items-center p-2 rounded bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 group hover:border-red-500/30 transition-colors">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-full ${b.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                                <Target size={12} />
                            </div>
                            <div>
                                <div className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{b.vessel}</div>
                                <div className="text-[9px] text-zinc-500 uppercase">{b.issue}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] font-mono text-zinc-400">{b.time}</div>
                            {b.severity === 'CRITICAL' && <span className="text-[8px] font-bold text-red-500 animate-pulse">TRACKING</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};