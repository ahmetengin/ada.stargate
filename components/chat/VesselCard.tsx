
import React, { useState } from 'react';
import { Activity, ShieldCheck, User, Zap, Gauge } from 'lucide-react';
import { VesselIntelligenceProfile, VesselSystemsStatus } from '../../types';
import { maskFullName } from '../../services/utils/utils';
import { marinaExpert } from '../../services/agents/marinaAgent';

interface VesselCardProps {
    profile: VesselIntelligenceProfile;
}

export const VesselCard: React.FC<VesselCardProps> = ({ profile }) => {
    const [telemetry, setTelemetry] = useState<VesselSystemsStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFetchTelemetry = async () => {
        if (telemetry) {
            setTelemetry(null);
            return;
        }
        setIsLoading(true);
        try {
            const data = await marinaExpert.getVesselTelemetry(profile.name);
            setTelemetry(data);
        } catch (error) {
            console.error("Telemetry failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl p-4 font-mono shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <ShieldCheck size={10} /> Vessel Intel
                    </div>
                    <div className="text-sm font-bold text-zinc-800 dark:text-white uppercase">{profile.name}</div>
                </div>
                <Activity size={14} className="text-emerald-500 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div>
                    <span className="text-zinc-500 block">Owner</span>
                    <span className="text-zinc-800 dark:text-zinc-300 flex items-center gap-1">
                        <User size={10}/> {maskFullName(profile.ownerName || 'Unknown')}
                    </span>
                </div>
                <div>
                    <span className="text-zinc-500 block">Dimensions</span>
                    <span className="text-zinc-800 dark:text-zinc-300">{profile.loa}m x {profile.beam}m</span>
                </div>
            </div>

            <button 
                onClick={handleFetchTelemetry}
                disabled={isLoading}
                className="w-full mt-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
            >
                {isLoading ? <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div> : <Gauge size={12}/>}
                {telemetry ? 'Hide Systems' : 'View Telemetry'}
            </button>

            {telemetry && (
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
                            <span className="text-[9px] text-zinc-500 block uppercase">Battery</span>
                            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1"><Zap size={10}/> {telemetry.battery.serviceBank}V</span>
                        </div>
                        <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
                            <span className="text-[9px] text-zinc-500 block uppercase">Shore Power</span>
                            <span className={`text-xs font-bold ${telemetry.shorePower.connected ? 'text-indigo-400' : 'text-zinc-500'}`}>
                                {telemetry.shorePower.connected ? 'ACTIVE' : 'OFF'}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-zinc-500 uppercase">
                            <span>Fuel Capacity</span>
                            <span>{telemetry.tanks.fuel}%</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${telemetry.tanks.fuel}%` }}></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
