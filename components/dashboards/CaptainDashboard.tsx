
import React, { useState, useEffect } from 'react';
import { Wifi, Thermometer, Zap, Clock, Wind, Activity, Gauge, ShoppingCart, Utensils, Plus, Minus, Check, ArrowUp } from 'lucide-react';
import { marinaExpert } from '../../services/agents/marinaAgent';
import { getCurrentMaritimeTime } from '../../services/utils';
import { VesselSystemsStatus } from '../../types';
import { TENANT_CONFIG } from '../../services/config';
import { wimMasterData } from '../../services/wimMasterData';

export const CaptainDashboard: React.FC = () => {
  const [activeCaptainTab, setActiveCaptainTab] = useState<'overview' | 'engineering' | 'services' | 'docking'>('overview');
  const [activeServiceSubTab, setActiveServiceSubTab] = useState<'provisions' | 'catering' | 'housekeeping'>('provisions');
  const [zuluTime, setZuluTime] = useState(getCurrentMaritimeTime());
  const [telemetry, setTelemetry] = useState<VesselSystemsStatus | null>(null);
  
  // Market Cart State
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orderPlaced, setOrderPlaced] = useState(false);

  // "RPM Gauge" State - Simulating raw sensor jitter
  const [liveWind, setLiveWind] = useState({ speed: 12.4, dir: 'NW' });
  const [liveEngineRPM, setLiveEngineRPM] = useState(0); 
  
  // Docking HUD State
  const [dockingDist, setDockingDist] = useState(50.0); // meters
  const [approachSpeed, setApproachSpeed] = useState(1.2); // knots

  useEffect(() => {
      // 1. Live Clock (1s)
      const clockTimer = setInterval(() => setZuluTime(getCurrentMaritimeTime()), 1000);

      // 2. "RPM Gauge" & Docking Simulation (100ms - Fast Jitter)
      const sensorTimer = setInterval(() => {
          // Wind fluctuation
          setLiveWind(prev => ({
              ...prev,
              speed: +(prev.speed + (Math.random() * 0.6 - 0.3)).toFixed(1)
          }));
          // Engine RPM "Idle" vibration simulation
          setLiveEngineRPM(prev => Math.floor(650 + (Math.random() * 10 - 5)));
          
          // Docking Sim
          if (activeCaptainTab === 'docking' && dockingDist > 0) {
              setDockingDist(prev => Math.max(0, prev - (approachSpeed * 0.05))); // Simple decay
              setApproachSpeed(prev => Math.max(0, prev * 0.99)); // Decelerate
          }
      }, 200);

      // 3. Initial Static Fetch
      marinaExpert.getVesselTelemetry(TENANT_CONFIG.name).then((data) => {
          if (data) setTelemetry(data);
      });

      return () => {
          clearInterval(clockTimer);
          clearInterval(sensorTimer);
      };
  }, [activeCaptainTab, dockingDist, approachSpeed]);

  const handleAddToCart = (itemId: string, delta: number) => {
      setCart(prev => {
          const current = prev[itemId] || 0;
          const next = Math.max(0, current + delta);
          const newCart = { ...prev };
          if (next === 0) delete newCart[itemId];
          else newCart[itemId] = next;
          return newCart;
      });
  };

  const handlePlaceOrder = () => {
      setOrderPlaced(true);
      setTimeout(() => {
          setOrderPlaced(false);
          setCart({});
      }, 2000);
  };

  return (
    <div className="space-y-4 font-mono text-zinc-800 dark:text-zinc-300 p-4 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
        
        {/* LIVE INSTRUMENT CLUSTER (The RPM Gauge Feel) */}
        <div className="flex justify-between items-center bg-black/5 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-2 relative overflow-hidden flex-shrink-0">
            {/* Background Pulse */}
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-emerald-500/10 to-transparent animate-pulse"></div>
            
            <div className="flex items-center gap-4 relative z-10">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} /> {zuluTime}
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Activity size={10} className="animate-pulse" /> LIVE
                </div>
            </div>

            <div className="flex items-center gap-6 relative z-10">
                {/* Wind Gauge */}
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-slate-700 dark:text-white leading-none">{liveWind.speed.toFixed(1)}</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">kn</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold">
                        <Wind size={10} /> {liveWind.dir}
                    </div>
                </div>

                {/* RPM Gauge (Visual Only) */}
                <div className="hidden sm:flex flex-col items-end border-l border-zinc-300 dark:border-zinc-700 pl-6">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-slate-700 dark:text-white leading-none">{liveEngineRPM}</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">RPM</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold">
                        <Gauge size={10} /> IDLE
                    </div>
                </div>
            </div>
        </div>

        {/* Captain Tabs */}
        <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto custom-scrollbar flex-shrink-0">
            {['overview', 'docking', 'services', 'engineering'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveCaptainTab(tab as any)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${activeCaptainTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            
            {/* DOCKING HUD (PROJECT ADA PILOT) */}
            {activeCaptainTab === 'docking' && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300 h-full flex flex-col">
                    <div className="bg-black rounded-xl border border-zinc-800 p-6 flex-1 flex flex-col items-center justify-center relative overflow-hidden group">
                        
                        {/* Background Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
                        
                        {/* Center HUD */}
                        <div className="relative z-10 text-center">
                            <div className="text-[10px] text-emerald-500 font-mono tracking-widest mb-4 animate-pulse">LIDAR LOCK ACQUIRED</div>
                            
                            <div className="text-8xl font-black text-white tracking-tighter tabular-nums text-shadow-glow">
                                {dockingDist.toFixed(1)}
                            </div>
                            <div className="text-sm font-bold text-zinc-500 uppercase tracking-[0.5em] mt-2">Meters to Dock</div>
                            
                            {/* Approach Vector */}
                            <div className="mt-8 flex items-center justify-center gap-8">
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white">{approachSpeed.toFixed(1)}</div>
                                    <div className="text-[10px] text-zinc-500 uppercase">Speed (kn)</div>
                                </div>
                                <div className="w-px h-12 bg-zinc-800"></div>
                                <div className="text-left">
                                    <div className="text-2xl font-bold text-white flex items-center gap-1">
                                        <ArrowUp size={20} className="text-emerald-500" /> 0.0
                                    </div>
                                    <div className="text-[10px] text-zinc-500 uppercase">Lateral Drift</div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Guides */}
                        <div className="absolute bottom-4 left-4 text-[10px] text-zinc-600 font-mono">
                            <div>BERTH: C-12</div>
                            <div>LAT: 40.9634 N</div>
                        </div>
                        <div className="absolute bottom-4 right-4 text-[10px] text-zinc-600 font-mono text-right">
                            <div>AURA: ACTIVE</div>
                            <div>LIGHTS: PULSING</div>
                        </div>
                    </div>
                    
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-xs text-center font-bold">
                        ⚠️ CAUTION: Maintain &lt; 0.5 knots. Monitoring wind shear.
                    </div>
                </div>
            )}

            {/* OVERVIEW TAB */}
            {activeCaptainTab === 'overview' && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Vessel Status</div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500">SECURE</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-50 dark:bg-black/20 p-3 rounded-lg">
                                <div className="text-[10px] text-zinc-500 uppercase mb-1">Location</div>
                                <div className="text-sm font-bold text-zinc-800 dark:text-white">Pontoon C-12</div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-black/20 p-3 rounded-lg">
                                <div className="text-[10px] text-zinc-500 uppercase mb-1">Shore Power</div>
                                <div className={`text-sm font-bold ${telemetry?.shorePower.connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                                    {telemetry?.shorePower.connected ? 'CONNECTED' : 'DISCONNECTED'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ada Sea ONE Control */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 relative overflow-hidden group shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 opacity-50"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-3">
                                <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <Wifi size={12} /> ADA SEA ONE
                                </div>
                                <div className="text-[9px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30">
                                    REMOTE LINK
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <button className="bg-white dark:bg-black/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 p-2 rounded flex flex-col items-center gap-1 transition-all shadow-sm">
                                    <Thermometer size={16} className="text-zinc-400" />
                                    <span className="text-[9px] uppercase text-zinc-500">AC: {telemetry?.comfort?.climate.currentTemp || '--'}°C</span>
                                </button>
                                <button className="bg-white dark:bg-black/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 p-2 rounded flex flex-col items-center gap-1 transition-all shadow-sm">
                                    <Zap size={16} className="text-yellow-500" />
                                    <span className="text-[9px] uppercase text-zinc-500">Lights</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SERVICES TAB */}
            {activeCaptainTab === 'services' && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
                        <button onClick={() => setActiveServiceSubTab('provisions')} className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 ${activeServiceSubTab === 'provisions' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
                            <ShoppingCart size={14} /> Market
                        </button>
                        <button onClick={() => setActiveServiceSubTab('catering')} className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 ${activeServiceSubTab === 'catering' ? 'bg-white dark:bg-zinc-700 text-purple-600 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
                            <Utensils size={14} /> Catering
                        </button>
                    </div>

                    {/* Sub-tab: Provisions (Market) */}
                    {activeServiceSubTab === 'provisions' && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-2">
                                {wimMasterData.concierge_services?.market_inventory.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-indigo-300 transition-colors">
                                        <div>
                                            <div className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{item.name}</div>
                                            <div className="text-[9px] text-zinc-500">€{item.price.toFixed(2)} / {item.unit}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {cart[item.id] > 0 && (
                                                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-md px-1">
                                                    <button onClick={() => handleAddToCart(item.id, -1)} className="p-1 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded"><Minus size={12}/></button>
                                                    <span className="text-xs font-mono w-4 text-center">{cart[item.id]}</span>
                                                    <button onClick={() => handleAddToCart(item.id, 1)} className="p-1 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded"><Plus size={12}/></button>
                                                </div>
                                            )}
                                            {!cart[item.id] && (
                                                <button onClick={() => handleAddToCart(item.id, 1)} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors">
                                                    <Plus size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Cart Footer */}
                            {Object.keys(cart).length > 0 && (
                                <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg animate-in slide-in-from-bottom-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase">{Object.values(cart).reduce((a: number,b: number)=>a+b,0)} Items</span>
                                        <span className="font-mono text-sm font-bold">€{Object.entries(cart).reduce((acc: number, [id, qty]: [string, number]) => {
                                            const item = wimMasterData.concierge_services?.market_inventory.find((i: any) => i.id === id);
                                            return acc + (item ? item.price * qty : 0);
                                        }, 0).toFixed(2)}</span>
                                    </div>
                                    <button onClick={handlePlaceOrder} className="w-full bg-white text-indigo-600 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                                        {orderPlaced ? <Check size={14} /> : <ShoppingCart size={14} />}
                                        {orderPlaced ? 'Request Sent' : 'Place Order'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};
