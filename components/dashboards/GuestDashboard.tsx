
import React, { useState } from 'react';
import { Car, CheckCircle2, Zap, Utensils, Calendar, Wind, PartyPopper, QrCode, MapPin, Scan, LogIn, Lock, Award, Plane, ChevronRight, Anchor } from 'lucide-react';
import { UserProfile, TenantConfig } from '../../types';
import { wimMasterData } from '../../services/wimMasterData';
import { securityExpert } from '../../services/agents/securityAgent';
import { TENANT_CONFIG } from '../../services/config';

interface GuestDashboardProps {
  userProfile: UserProfile;
}

export const GuestDashboard: React.FC<GuestDashboardProps> = ({ userProfile }) => {
  const upcomingEvents = TENANT_CONFIG.masterData.event_calendar || [];
  const [accessStatus, setAccessStatus] = useState<'INSIDE' | 'OUTSIDE'>('OUTSIDE');
  const [lastGate, setLastGate] = useState<string | null>(null);

  const isMember = userProfile.role === 'MEMBER' || userProfile.role === 'CAPTAIN';

  // Generate a mock QR Data string unique to the user
  const qrData = JSON.stringify({
      uid: userProfile.id,
      name: userProfile.name,
      valid: '24H',
      ts: Date.now()
  });
  
  // Use a public API to generate the QR image based on the data
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&color=000000&bgcolor=ffffff`;

  const simulateGateScan = async (gate: string) => {
      const newStatus = accessStatus === 'INSIDE' ? 'OUTSIDE' : 'INSIDE';
      await securityExpert.processAccessPass(userProfile.name, gate, newStatus === 'INSIDE' ? 'ENTRY' : 'EXIT', () => {});
      setAccessStatus(newStatus);
      setLastGate(gate);
  };

  const getTierColor = (tier: string) => {
      switch(tier) {
          case 'ADMIRAL': return 'from-slate-900 to-black border-slate-700 text-white'; // Elite Plus equivalent
          case 'COMMANDER': return 'from-amber-100 to-amber-200 border-amber-300 text-amber-900'; // Elite equivalent
          default: return 'from-red-600 to-red-700 border-red-500 text-white'; // Classic Red
      }
  };

  return (
    <div className="space-y-6 font-sans text-zinc-800 dark:text-zinc-200 p-4 animate-in fade-in slide-in-from-right-4 duration-500">
        {/* Welcome & Status */}
        <div className="flex items-center justify-between">
            <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Welcome Back</div>
                <div className="text-xl font-bold">{userProfile.name}</div>
            </div>
            <div className="text-right">
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Status</div>
                <div className={`text-sm font-bold ${isMember ? 'text-indigo-500' : 'text-zinc-400'}`}>
                    {userProfile.loyalty?.tier || 'VISITOR'}
                </div>
            </div>
        </div>

        {/* --- ADA SEA MILES CARD (NEW) --- */}
        {isMember && userProfile.loyalty && (
            <div className={`relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br ${getTierColor(userProfile.loyalty.tier)} transition-all duration-500 hover:scale-[1.02]`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-2">
                            <Anchor size={24} />
                            <span className="font-display font-bold text-lg tracking-widest uppercase">Ada Sea Miles</span>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] uppercase opacity-70 tracking-widest">Tier</div>
                            <div className="font-black text-xl uppercase tracking-tighter">{userProfile.loyalty.tier}</div>
                        </div>
                    </div>

                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-[10px] uppercase opacity-70 tracking-widest mb-1">Total Balance</div>
                            <div className="text-3xl font-mono font-bold tracking-tight">{userProfile.loyalty.spendableMiles.toLocaleString()} <span className="text-sm font-normal opacity-80">MILES</span></div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-mono opacity-70">{userProfile.loyalty.cardNumber}</div>
                            <div className="text-[10px] opacity-70">Member Since {userProfile.loyalty.memberSince}</div>
                        </div>
                    </div>

                    {/* Progress to Next Tier */}
                    {userProfile.loyalty.nextTierProgress < 100 && (
                        <div className="mt-6">
                            <div className="flex justify-between text-[9px] uppercase font-bold mb-1 opacity-80">
                                <span>Status Progress</span>
                                <span>{userProfile.loyalty.milesToNextTier.toLocaleString()} miles to Upgrade</span>
                            </div>
                            <div className="h-1 bg-black/20 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-white/90 shadow-[0_0_10px_white]" 
                                    style={{ width: `${userProfile.loyalty.nextTierProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- MEMBER EXCLUSIVE: DIGITAL ACCESS PASS (QR) --- */}
        {isMember ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative group">
                {/* Holographic Top Bar */}
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
                
                <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    {/* QR Code Area */}
                    <div className="bg-white p-2 rounded-xl shadow-inner border border-zinc-100 flex-shrink-0 relative">
                        <img src={qrImageUrl} alt="Access QR" className="w-32 h-32 object-contain mix-blend-multiply opacity-90" />
                        <div className="absolute inset-0 border-[3px] border-indigo-500/20 rounded-xl pointer-events-none"></div>
                        <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                            <Scan size={14} />
                        </div>
                    </div>

                    {/* Info Area */}
                    <div className="flex-1 w-full text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-between mb-2">
                            <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                                <QrCode size={16} className="text-indigo-500" /> Ada Access Pass
                            </h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${accessStatus === 'INSIDE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                                {accessStatus === 'INSIDE' ? '● ON PREMISES' : '○ AWAY'}
                            </span>
                        </div>
                        
                        <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                            Use this QR code at turnstiles and security gates for contactless entry/exit.
                            {lastGate && <span className="block mt-1 text-indigo-500 font-medium">Last Activity: {lastGate} ({new Date().toLocaleTimeString()})</span>}
                        </p>

                        {/* Simulation Controls (Hidden in Production) */}
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <button 
                                onClick={() => simulateGateScan('Main Gate A')}
                                className="flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-200 text-xs font-bold py-2 rounded-lg transition-all"
                            >
                                <MapPin size={12} /> {accessStatus === 'OUTSIDE' ? 'Enter Gate A' : 'Exit Gate A'}
                            </button>
                            <button 
                                onClick={() => simulateGateScan('VIP Turnstile')}
                                className="flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-zinc-200 dark:border-zinc-700 hover:border-purple-200 text-xs font-bold py-2 rounded-lg transition-all"
                            >
                                <Zap size={12} /> {accessStatus === 'OUTSIDE' ? 'VIP Entry' : 'VIP Exit'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            /* VISITOR VIEW: LOCKED PASS */
            <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 flex flex-col items-center justify-center text-center opacity-75">
                <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-4">
                    <Lock size={24} className="text-zinc-400" />
                </div>
                <h3 className="font-bold text-zinc-600 dark:text-zinc-300">Member Access Only</h3>
                <p className="text-xs text-zinc-500 mt-2 mb-4 max-w-xs">Digital Pass, Wi-Fi Codes, and Valet requests are available to registered marina members.</p>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-500 transition-colors">
                    Become a Member
                </button>
            </div>
        )}

        {/* Event Calendar (Public & Member) */}
        <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Calendar size={12} /> Upcoming Events
            </h3>
            <div className="space-y-2">
                {upcomingEvents.map((evt: any) => (
                    <div key={evt.id} className="flex gap-3 p-3 bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-indigo-500/50 transition-colors cursor-pointer">
                        <div className="flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-700 rounded p-2 min-w-[50px]">
                            <span className="text-xs font-bold text-zinc-500 uppercase">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{new Date(evt.date).getDate()}</span>
                        </div>
                        <div>
                            <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{evt.name}</div>
                            <div className="text-[10px] text-zinc-500 uppercase mt-1 flex items-center gap-1">
                                {evt.type === 'Race' ? <Wind size={10}/> : <PartyPopper size={10}/>}
                                {evt.type} • {evt.location || 'Marina'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};