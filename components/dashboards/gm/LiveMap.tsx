
import React, { useState } from 'react';
import { Eye, Radio, FileText, X, Navigation, Video, Crown, CalendarCheck } from 'lucide-react';

export const LiveMap: React.FC = () => {
  const [hoveredBerth, setHoveredBerth] = useState<string | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<any | null>(null);

  // Mock Berth Data with Relationship Status
  const berths = [
    // --- PONTOON A (Top) ---
    { id: 'A-N1', status: 'OCCUPIED', vessel: 'S/Y Wind Chaser', type: 'Sail', cx: 60, cy: 35, orientation: 'up', relationship: 'VISITOR' },
    { id: 'A-N2', status: 'EMPTY', vessel: null, type: null, cx: 80, cy: 35, orientation: 'up' },
    { id: 'A-N3', status: 'OCCUPIED', vessel: 'M/Y Solaris', type: 'Motor', cx: 100, cy: 35, orientation: 'up', relationship: 'CONTRACT_HOLDER' },
    
    // South Side (Facing Down)
    { id: 'A-S1', status: 'OCCUPIED', vessel: 'S/Y Phisedelia', type: 'Sail (VO65)', cx: 60, cy: 43, orientation: 'down', relationship: 'CONTRACT_HOLDER' },
    { id: 'A-S2', status: 'OCCUPIED', vessel: 'M/Y Blue Horizon', type: 'Motor', cx: 80, cy: 43, orientation: 'down', relationship: 'CONTRACT_HOLDER' },
    { id: 'A-S3', status: 'BREACH', vessel: 'Speedboat X', type: 'Speed', cx: 100, cy: 43, orientation: 'down', relationship: 'VISITOR' },
    { id: 'A-S4', status: 'OCCUPIED', vessel: 'Tender Alpha', type: 'Service', cx: 120, cy: 43, orientation: 'down', relationship: 'CONTRACT_HOLDER' },

    // --- PONTOON B (Middle) ---
    { id: 'B-N1', status: 'OCCUPIED', vessel: 'Catamaran Lir', type: 'Cat', cx: 60, cy: 85, orientation: 'up', relationship: 'VISITOR' },
    { id: 'B-N2', status: 'OCCUPIED', vessel: 'S/Y Aegeas', type: 'Sail', cx: 90, cy: 85, orientation: 'up', relationship: 'RESERVATION' },

    // South Side (Facing Down)
    { id: 'B-S1', status: 'EMPTY', vessel: null, type: null, cx: 70, cy: 93, orientation: 'down' },
    { id: 'B-S2', status: 'OCCUPIED', vessel: 'M/Y Poseidon', type: 'Superyacht', cx: 100, cy: 93, orientation: 'down', relationship: 'RESERVATION' },
    
    // --- VIP QUAY (Right) ---
    { id: 'VIP-01', status: 'OCCUPIED', vessel: 'M/Y Grand Turk', type: 'Mega', cx: 230, cy: 50, orientation: 'left', relationship: 'CONTRACT_HOLDER' },
    { id: 'VIP-02', status: 'OCCUPIED', vessel: 'M/Y White Pearl', type: 'Mega', cx: 230, cy: 100, orientation: 'left', relationship: 'VISITOR' },
  ];

  return (
    <div className="w-full h-full relative bg-slate-200 dark:bg-[#050b14] flex items-center justify-center overflow-hidden transition-colors bg-grid-pattern">
        
        {/* SVG MAP REPRESENTATION */}
        <svg viewBox="0 0 300 150" className="w-full h-full z-10" onClick={() => setSelectedVessel(null)}>
            
            {/* --- INFRASTRUCTURE --- */}
            
            {/* Main Pier (Spine) - Left */}
            <rect x="10" y="10" width="15" height="130" rx="2" className="fill-slate-400 stroke-slate-500 dark:fill-[#1e293b] dark:stroke-[#334155]" strokeWidth="1" />
            
            {/* Pontoon A (Top) */}
            <rect x="25" y="35" width="140" height="8" rx="1" className="fill-slate-500 stroke-slate-600 dark:fill-[#334155] dark:stroke-[#475569]" strokeWidth="0.5" /> 
            <text x="30" y="40.5" fontSize="4" className="fill-slate-200 dark:fill-gray-400" fontFamily="monospace" fontWeight="bold" letterSpacing="1">PONTOON A</text>

            {/* Pontoon B (Bottom) */}
            <rect x="25" y="85" width="140" height="8" rx="1" className="fill-slate-500 stroke-slate-600 dark:fill-[#334155] dark:stroke-[#475569]" strokeWidth="0.5" /> 
            <text x="30" y="90.5" fontSize="4" className="fill-slate-200 dark:fill-gray-400" fontFamily="monospace" fontWeight="bold" letterSpacing="1">PONTOON B</text>

            {/* VIP Quay (Right) */}
            <rect x="230" y="20" width="60" height="110" rx="2" className="fill-indigo-900/50 stroke-indigo-700 dark:fill-[#1e1b4b] dark:stroke-[#4338ca]" strokeWidth="1" />
            <text x="240" y="35" fontSize="6" className="fill-indigo-300 dark:fill-[#818cf8]" fontFamily="monospace" fontWeight="bold" transform="rotate(90, 240, 35)">VIP QUAY</text>

            {/* --- VESSELS --- */}
            {berths.map(b => {
                let boatPath = "";
                let labelX = b.cx;
                let labelY = b.cy;

                if (b.orientation === 'down') {
                    boatPath = `M ${b.cx-5} ${b.cy + 2} L ${b.cx+5} ${b.cy + 2} L ${b.cx+5} ${b.cy+20} Q ${b.cx} ${b.cy+28} ${b.cx-5} ${b.cy+20} Z`;
                    labelY += 15;
                } else if (b.orientation === 'up') {
                    boatPath = `M ${b.cx-5} ${b.cy - 2} L ${b.cx+5} ${b.cy - 2} L ${b.cx+5} ${b.cy-20} Q ${b.cx} ${b.cy-28} ${b.cx-5} ${b.cy-20} Z`;
                    labelY -= 15;
                } else if (b.orientation === 'left') {
                    boatPath = `M ${b.cx-2} ${b.cy-6} L ${b.cx-2} ${b.cy+6} L ${b.cx-30} ${b.cy+6} Q ${b.cx-40} ${b.cy} ${b.cx-30} ${b.cy-6} Z`;
                    labelX -= 20;
                }

                let fillClass = "fill-slate-600 dark:fill-[#3f3f46]"; // Empty
                if (b.status === 'OCCUPIED') fillClass = "fill-slate-600 dark:fill-[#52525b]"; // Base occupied color
                if (b.status === 'BREACH') fillClass = "fill-red-500 dark:fill-[#ef4444]";
                if (selectedVessel && selectedVessel.id === b.id) fillClass = "fill-indigo-500 dark:fill-[#6366f1]";

                // Status Rings (The Contract/Reservation Indicator)
                let ringColor = "";
                if (b.relationship === 'CONTRACT_HOLDER') ringColor = "#fbbf24"; // Amber/Gold
                if (b.relationship === 'RESERVATION') ringColor = "#6366f1"; // Indigo

                return (
                    <g 
                        key={b.id} 
                        onMouseEnter={() => setHoveredBerth(b.id)}
                        onMouseLeave={() => setHoveredBerth(null)}
                        onClick={(e) => { e.stopPropagation(); setSelectedVessel(b); }}
                        className="cursor-pointer transition-all hover:opacity-80"
                        style={{ filter: selectedVessel?.id === b.id ? 'drop-shadow(0 0 5px rgba(99, 102, 241, 0.8))' : '' }}
                    >
                        {/* Status Halo */}
                        {ringColor && b.status === 'OCCUPIED' && (
                            <circle cx={labelX} cy={labelY} r="12" fill="none" stroke={ringColor} strokeWidth="0.8" opacity="0.6" />
                        )}

                        <path d={boatPath} className={`${fillClass} stroke-white/20 dark:stroke-white/10`} strokeWidth="0.5" />
                        
                        {/* Status Dot */}
                        {b.status === 'BREACH' && <circle cx={labelX} cy={labelY} r="3" fill="#ef4444" className="animate-ping" />}
                        {b.relationship === 'CONTRACT_HOLDER' && <circle cx={labelX} cy={labelY} r="1.5" fill="#fbbf24" />}
                    </g>
                );
            })}
        </svg>

        {/* --- INTERACTIVE HUD OVERLAY --- */}
        
        {/* Tooltip */}
        {hoveredBerth && !selectedVessel && (
            <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur border border-slate-200 dark:border-white/10 p-2 rounded-lg text-xs z-30 shadow-xl pointer-events-none animate-in fade-in zoom-in duration-200">
                {(() => {
                    const b = berths.find(x => x.id === hoveredBerth);
                    return (
                        <div>
                            <div className="font-bold text-slate-800 dark:text-white font-mono flex items-center gap-2">
                                {b?.id}
                                {b?.relationship === 'CONTRACT_HOLDER' && <Crown size={10} className="text-amber-500" />}
                                {b?.relationship === 'RESERVATION' && <CalendarCheck size={10} className="text-indigo-500" />}
                            </div>
                            <div className="text-slate-600 dark:text-zinc-400">{b?.vessel || 'VACANT'}</div>
                        </div>
                    )
                })()}
            </div>
        )}

        {/* TACTICAL COMMAND MENU */}
        {selectedVessel && (
            <div className="absolute inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-center justify-center" onClick={() => setSelectedVessel(null)}>
                <div 
                    className="bg-white dark:bg-zinc-900 border border-indigo-500/50 rounded-2xl shadow-2xl p-4 w-72 max-w-full animate-in zoom-in-95 duration-200 relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                Tactical Ops
                                {selectedVessel.relationship === 'CONTRACT_HOLDER' && <span className="bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded text-[8px]">CONTRACT</span>}
                                {selectedVessel.relationship === 'RESERVATION' && <span className="bg-indigo-500/20 text-indigo-500 px-1.5 py-0.5 rounded text-[8px]">RESERVED</span>}
                            </div>
                            <div className="text-lg font-black text-slate-800 dark:text-white leading-none">{selectedVessel.vessel || 'VACANT BERTH'}</div>
                            <div className="text-xs font-mono text-zinc-500 mt-1">{selectedVessel.id} • {selectedVessel.type || 'N/A'}</div>
                        </div>
                        <button onClick={() => setSelectedVessel(null)} className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <button className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-200 dark:border-indigo-500/30">
                            <Radio size={18} />
                            <span className="text-[9px] font-bold uppercase">Hail (VHF)</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700">
                            <Video size={18} />
                            <span className="text-[9px] font-bold uppercase">CCTV</span>
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};