
import React, { useState } from 'react';
import { Activity, ShieldCheck, User, Zap, Droplets, Gauge, Thermometer, ScanEye } from 'lucide-react';
import { VesselIntelligenceProfile, VesselSystemsStatus } from '../../types';
import { maskFullName } from '../../services/utils';
import { marinaExpert } from '../../services/agents/marinaAgent';

interface VesselCardProps {
    profile: VesselIntelligenceProfile;
}

export const VesselCard: React.FC<VesselCardProps> = ({ profile }) => {
    const [telemetry, setTelemetry] = useState<VesselSystemsStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showScan, setShowScan] = useState(false);

    const handleFetchTelemetry = async () => {
        if (telemetry) {
            setTelemetry(null);
            return;
        }
        
        setIsLoading(true);
        try {
            // Fetch real-time telemetry via the Expert Agent
            const data = await marinaExpert.getVesselTelemetry(profile.name);
            setTelemetry(data);
        } catch (error) {
            console.error("Failed to load telemetry", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-6 border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a121e] p-4 rounded-xl font-mono text-xs shadow-lg animate-in fade-in slide-in-from-left-2 max-w-md relative overflow-hidden group transition-colors">
            {/* Subtle Gradient Overlay */}
            <div className="absolute top-0 left-0 w-1 h-full bg-teal-500/50"></div>
            
            <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-white/5 pb-3">
                <div className="text-teal-600 dark:text-teal-500 font-bold uppercase tracking-widest flex items-center gap-2 text-[10px]">
                    <ShieldCheck size={12} /> TARGET PROFILE
                </div>
                <div className="text-[9px] text-teal-600/50 dark:text-teal-500/50 font-bold flex items-center gap-1 animate-pulse">
                    <Activity size={10} /> LIVE LINK
                </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div className="col-span-2 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-zinc-800 dark:text-white">{profile.name}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-600 font-bold bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">IMO {profile.imo}</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-600 uppercase font-bold mb-0.5">Type</span>
                    <span className="text-zinc-700 dark:text-zinc-300 truncate">{profile.type}</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-600 uppercase font-bold mb-0.5">Flag</span>
                    <span className="text-zinc-700 dark:text-zinc-300">{profile.flag}</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-600 uppercase font-bold mb-0.5">Dimensions</span>
                    <span className="text-zinc-700 dark:text-zinc-300">{profile.loa}m x {profile.beam}m</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-600 uppercase font-bold mb-0.5">Owner</span>
                    <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1"><User size={10} className="text-zinc-400 dark:text-zinc-500"/> {maskFullName(profile.ownerName || 'N/A')}</span>
                </div>

                {profile.outstandingDebt && profile.outstandingDebt > 0 && (
                    <div className="col-span-2 mt-2">
                        <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-3 py-2 rounded flex justify-between items-center">
                            <span className="text-[9px] font-bold uppercase">Outstanding Balance</span>
                            <span className="font-bold">€{profile.outstandingDebt}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Buttons Row */}
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/5 grid grid-cols-2 gap-2">
                <button 
                    onClick={handleFetchTelemetry}
                    disabled={isLoading}
                    className={`flex items-center justify-center gap-2 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                        telemetry 
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700' 
                        : 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30 hover:bg-teal-100 dark:hover:bg-teal-500/20'
                    }`}
                >
                    {isLoading ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Gauge size={12} />}
                    {telemetry ? 'Hide' : 'Telemetry'}
                </button>

                <button 
                    onClick={() => setShowScan(!showScan)}
                    className="flex items-center justify-center gap-2 py-2 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                >
                    <ScanEye size={12} /> Hull Scan
                </button>
            </div>

            {/* Telemetry Panel */}
            {telemetry && (
                <div className="mt-3 bg-zinc-50 dark:bg-black/40 rounded-lg p-3 border border-zinc-200 dark:border-white/5 animate-in slide-in-from-top-2 space-y-3 transition-colors">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">
                        <span>Real-time Systems</span>
                        <span className="text-emerald-500 flex items-center gap-1"><div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div> Online</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {/* Battery */}
                        <div className="bg-white dark:bg-zinc-900/50 p-2 rounded border border-zinc-200 dark:border-white/5 shadow-sm">
                            <div className="text-[9px] text-zinc-500 mb-1 flex items-center gap-1"><Zap size={10}/> Battery</div>
                            <div className="text-sm font-bold text-zinc-800 dark:text-white">{telemetry.battery.serviceBank}V</div>
                            <div className="text-[9px] text-zinc-600">{telemetry.battery.status}</div>
                        </div>

                        {/* Shore Power */}
                        <div className="bg-white dark:bg-zinc-900/50 p-2 rounded border border-zinc-200 dark:border-white/5 shadow-sm">
                            <div className="text-[9px] text-zinc-500 mb-1 flex items-center gap-1"><Zap size={10}/> Shore Power</div>
                            <div className={`text-sm font-bold ${telemetry.shorePower.connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                                {telemetry.shorePower.connected ? 'CONNECTED' : 'OFF'}
                            </div>
                            <div className="text-[9px] text-zinc-600">{telemetry.shorePower.voltage}V / {telemetry.shorePower.amperage}A</div>
                        </div>

                        {/* Tanks */}
                        <div className="col-span-2 bg-white dark:bg-zinc-900/50 p-2 rounded border border-zinc-200 dark:border-white/5 space-y-2 shadow-sm">
                            <div className="flex items-center justify-between text-[9px]">
                                <span className="text-zinc-500 flex items-center gap-1"><Droplets size={10}/> Fuel</span>
                                <span className="text-amber-600 dark:text-amber-500 font-bold">{telemetry.tanks.fuel}%</span>
                            </div>
                            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full" style={{ width: `${telemetry.tanks.fuel}%` }}></div>
                            </div>

                            <div className="flex items-center justify-between text-[9px]">
                                <span className="text-zinc-500 flex items-center gap-1"><Droplets size={10} className="text-blue-500"/> Fresh Water</span>
                                <span className="text-blue-600 dark:text-blue-500 font-bold">{telemetry.tanks.freshWater}%</span>
                            </div>
                            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full" style={{ width: `${telemetry.tanks.freshWater}%` }}></div>
                            </div>
                        </div>
                        
                        {/* Climate (Ada Sea ONE) */}
                        {telemetry.comfort && (
                            <div className="col-span-2 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded border border-indigo-100 dark:border-indigo-500/20">
                                <div className="flex items-center gap-2">
                                    <Thermometer size={12} className="text-indigo-500 dark:text-indigo-400" />
                                    <div>
                                        <div className="text-[9px] text-indigo-700 dark:text-indigo-300 font-bold">HVAC / {telemetry.comfort.climate.zone}</div>
                                        <div className="text-[9px] text-indigo-500 dark:text-indigo-400/70">{telemetry.comfort.climate.mode}</div>
                                    </div>
                                </div>
                                <div className="text-sm font-bold text-indigo-900 dark:text-white">{telemetry.comfort.climate.currentTemp}°C</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Hull Scan Visualizer */}
            {showScan && (
                <div className="mt-3 bg-blue-900/10 rounded-lg p-3 border border-blue-500/20 animate-in zoom-in-95">
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2 flex justify-between">
                        <span>Ada.Subsea Report</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    
                    {/* Simulated Heatmap */}
                    <div className="relative h-24 w-full bg-blue-900/80 rounded overflow-hidden mb-2 border border-blue-500/30 group cursor-crosshair">
                        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
                        {/* Simulated Hull Shape */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-blue-500/20 rounded-full blur-xl"></div>
                        {/* Foul Spots */}
                        <div className="absolute top-[40%] left-[30%] w-2 h-2 bg-yellow-400 rounded-full blur-[2px] animate-pulse"></div>
                        <div className="absolute top-[60%] right-[30%] w-3 h-3 bg-green-400 rounded-full blur-[2px]"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[9px] text-zinc-500 dark:text-zinc-400">
                        <div>
                            <span className="block uppercase font-bold text-blue-400">Propeller</span>
                            <span className="text-emerald-500">CLEAN</span>
                        </div>
                        <div className="text-right">
                            <span className="block uppercase font-bold text-blue-400">Anodes</span>
                            <span className="text-amber-500">85% (GOOD)</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
