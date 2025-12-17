import React, { useEffect } from 'react';
import { useTelemetryStore, initializeTelemetryStore } from '../../../services/telemetryStore';
import { Activity, AlertTriangle, Info, CheckCircle2, ShieldAlert, Wifi, WifiOff } from 'lucide-react';
import { format } from 'date-fns';
import { Severity } from '../../../types';

export const TelemetryTimeline: React.FC = () => {
    const { events, isConnected, activeAlerts } = useTelemetryStore();

    useEffect(() => {
        // Initialize the connection between the store and the singleton stream service
        const cleanup = initializeTelemetryStore();
        return cleanup;
    }, []);

    const getSeverityIcon = (severity: Severity) => {
        switch(severity) {
            case 'critical': return <ShieldAlert size={14} className="text-red-500 animate-pulse" />;
            case 'error': return <AlertTriangle size={14} className="text-red-400" />;
            case 'warn': return <Activity size={14} className="text-amber-500" />;
            case 'info': return <Info size={14} className="text-blue-400" />;
            case 'debug': return <CheckCircle2 size={14} className="text-zinc-500" />;
        }
    };

    const getRowStyle = (severity: Severity) => {
        switch(severity) {
            case 'critical': return 'bg-red-900/20 border-red-900/50';
            case 'error': return 'bg-red-900/10 border-red-900/30';
            case 'warn': return 'bg-amber-900/10 border-amber-900/30';
            default: return 'bg-zinc-900/30 border-white/5';
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#050b14] border-l border-zinc-800 w-80">
            {/* Header */}
            <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-[#0a0f18]">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-indigo-500" />
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Live Telemetry</span>
                </div>
                <div className="flex items-center gap-3">
                    {activeAlerts > 0 && (
                        <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold animate-pulse">
                            <AlertTriangle size={10} /> {activeAlerts}
                        </div>
                    )}
                    {isConnected ? (
                        <Wifi size={14} className="text-emerald-500" />
                    ) : (
                        <WifiOff size={14} className="text-zinc-600" />
                    )}
                </div>
            </div>

            {/* Timeline Stream */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {events.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-2">
                        <Activity size={24} className="opacity-20"/>
                        <span className="text-[10px]">{isConnected ? 'Waiting for events...' : 'Connecting...'}</span>
                    </div>
                ) : (
                    events.map((evt, idx) => (
                        <div 
                            key={idx} 
                            className={`p-2 rounded border text-[10px] animate-in slide-in-from-right-2 duration-300 ${getRowStyle(evt.severity)}`}
                        >
                            <div className="flex justify-between items-center mb-1 opacity-60">
                                <span className="font-mono">{evt.ts === "LIVE" ? "LIVE" : format(new Date(evt.ts || Date.now()), 'HH:mm:ss')}</span>
                                <span className="uppercase">{evt.source ? evt.source.split('.').pop() : 'SYS'}</span>
                            </div>
                            
                            <div className="flex gap-2 items-start">
                                <div className="mt-0.5">{getSeverityIcon(evt.severity)}</div>
                                <div className="flex-1">
                                    <div className="font-bold text-zinc-300 mb-0.5">{evt.type}</div>
                                    
                                    {/* Dynamic Payload Rendering */}
                                    {evt.payload && Object.entries(evt.payload).length > 0 && (
                                        <div className="grid grid-cols-1 gap-1 mt-1 text-zinc-500">
                                            {Object.entries(evt.payload).slice(0, 4).map(([k, v]) => (
                                                <div key={k} className="truncate">
                                                    <span className="opacity-70">{k}:</span> <span className="text-zinc-400">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {evt.berth_id && (
                                        <div className="mt-1 inline-block px-1.5 py-0.5 bg-black/40 rounded text-indigo-400 font-mono text-[9px]">
                                            📍 {evt.berth_id}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
