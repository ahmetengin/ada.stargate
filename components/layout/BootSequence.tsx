
import React, { useState, useEffect } from 'react';

export const BootSequence = () => {
    const lines = [
        "Initializing Ada Stargate v5.0 (Hyperscale)...",
        "Connecting to Neural Core (LangGraph)...",
        "Loading Vector Memory (Qdrant/RAG)...",
        "Activating SEAL Protocol (Self-Learning)...",
        "Calibrating MAKER Engine (Python Workers)...",
        "Syncing Live Telemetry (MQTT/FastRTC)...",
        "Handshake: SECURE.",
        "SYSTEM STATUS: ACTIVE."
    ];
    const [visibleLines, setVisibleLines] = useState<string[]>([]);

    useEffect(() => {
        let delay = 0;
        lines.forEach((line, index) => {
            delay += Math.random() * 400 + 300;
            setTimeout(() => {
                setVisibleLines(prev => [...prev, line]);
            }, delay);
        });
    }, []);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#050b14] font-mono text-zinc-500">
            <div className="text-left w-full max-w-md p-8 border-l-2 border-emerald-500/20 bg-emerald-900/5">
                {visibleLines.map((line, index) => (
                    <p key={index} className="text-xs mb-2">
                        <span className="text-emerald-700 mr-2">{'>'}</span>
                        <span className={index === lines.length - 1 ? 'text-emerald-400 font-bold animate-pulse' : 'text-zinc-400'}>
                            {line}
                        </span>
                    </p>
                ))}
            </div>
        </div>
    );
};
