
import React, { useState } from 'react';
import { Car, CheckCircle2, Zap, Utensils, Calendar, Wind, PartyPopper, QrCode, MapPin, Scan, LogIn, Lock, Award, Plane, ChevronRight, Anchor, CreditCard } from 'lucide-react';
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
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-black/20">
        {/* Fixed Header Section */}
        <div className="px-6 py-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Welcome Back</div>
                    <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{userProfile.name}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Current Status</div>
                    <div className={`text-sm font-bold px-3 py-1 rounded-full border inline-block ${isMember ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800' : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'}`}>
                        {userProfile.loyalty?.tier || 'VISITOR ACCESS'}
                    </div>
                </div>
            </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* --- MEMBER SECTION: Grid Layout for Card & Key --- */}
                {isMember && userProfile.loyalty && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 1. Ada Sea Miles Card */}
                        <div className={`relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br ${getTierColor(userProfile.loyalty.tier)} transition-all duration-500 group h-full flex flex-col justify-between min-h-[220px]`}>
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grid)" />
                                </svg>
                            </div>

                            <div className="p-6 relative z-10 flex-1 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                            <Anchor size={20} />
                                        </div>
                                        <div>
                                            <span className="font-display font-bold text-sm tracking-widest uppercase block opacity-80">Ada Sea Miles</span>
                                            <span className="text-[10px] opacity-60">Loyalty Program</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] uppercase opacity-60 tracking-widest">Tier Level</div>
                                        <div className="font-black text-lg uppercase tracking-tight">{userProfile.loyalty.tier}</div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <div className="text-[10px] uppercase opacity-60 tracking-widest mb-1">Available Balance</div>
                                            <div className="text-3xl font-mono font-bold tracking-tight">{userProfile.loyalty.spendableMiles.toLocaleString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-mono opacity-60">{userProfile.loyalty.cardNumber}</div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {userProfile.loyalty.nextTierProgress < 100 && (
                                        <div>
                                            <div className="flex justify-between text-[9px] uppercase font-bold mb-1 opacity-70">
                                                <span>Upgrade Progress</span>
                                                <span>{userProfile.loyalty.milesToNextTier.toLocaleString()} to Next Tier</span>
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
                        </div>

                        {/* 2. Digital Gate Key */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm h-full">
                            <div className="bg-white p-3 rounded-xl shadow-inner border border-zinc-100 flex-shrink-0">
                                <img src={qrImageUrl} alt="Access QR" className="w-32 h-32 object-contain" />
                            </div>
                            
                            <div className="flex-1 w-full flex flex-col justify-between h-full py-2">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">Digital Pass</h3>
                                            <p className="text-xs text-zinc-500">Scan at any pedestal or security gate.</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                            accessStatus === 'INSIDE' 
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${accessStatus === 'INSIDE' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`}></div>
                                            {accessStatus === 'INSIDE' ? 'On Campus' : 'Away'}
                                        </div>
                                    </div>
                                    
                                    {lastGate && (
                                        <div className="text-[10px] text-zinc-400 mb-4 flex items-center gap-1">
                                            <CheckCircle2 size={10} className="text-emerald-500"/>
                                            Access Granted: {lastGate} ({new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <button 
                                        onClick={() => simulateGateScan('Main Gate A')}
                                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-all text-xs font-medium text-zinc-600 dark:text-zinc-300 group"
                                    >
                                        <span className="flex items-center gap-2"><Car size={14}/> Main Gate</span>
                                        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                    <button 
                                        onClick={() => simulateGateScan('Pontoon C Gate')}
                                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-all text-xs font-medium text-zinc-600 dark:text-zinc-300 group"
                                    >
                                        <span className="flex items-center gap-2"><Anchor size={14}/> Pontoon</span>
                                        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* --- VISITOR SECTION: Hero Card --- */}
                {!isMember && (
                    <div className="relative overflow-hidden bg-indigo-900 rounded-2xl p-8 text-center shadow-lg border border-indigo-500/30">
                        {/* Background Deco */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-zinc-900/0 to-transparent"></div>
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-indigo-400 mb-4 backdrop-blur-md border border-white/10">
                                <Lock size={32} />
                            </div>
                            <h3 className="font-bold text-2xl text-white mb-2">Unlock the Marina Life</h3>
                            <p className="text-sm text-indigo-200 mb-8 max-w-md mx-auto leading-relaxed">
                                Join our exclusive community to manage your vessel, access VIP lounges, and enjoy seamless entry with a digital pass.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
                                <button className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white py-3 px-6 rounded-lg text-sm font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2">
                                    <LogIn size={16} /> Member Login
                                </button>
                                <button className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-6 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                                    <CreditCard size={16} /> Apply Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- EVENTS & AMENITIES (Visible to All) --- */}
                <div>
                    <div className="flex items-center justify-between mb-4 mt-8">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={14} /> Marina Calendar & Events
                        </h3>
                        <button className="text-[10px] text-indigo-500 hover:text-indigo-400 font-bold uppercase">View All</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingEvents.map((evt: any) => (
                            <div key={evt.id} className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group cursor-pointer overflow-hidden">
                                <div className="h-24 bg-zinc-100 dark:bg-zinc-800 relative">
                                    {/* Mock Image Placeholder */}
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                                        {evt.type === 'Social' ? <PartyPopper size={32}/> : evt.type === 'Race' ? <Wind size={32}/> : <Utensils size={32}/>}
                                    </div>
                                    <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/90 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                        {new Date(evt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                            evt.type === 'Social' ? 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' :
                                            evt.type === 'Race' ? 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' :
                                            'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                        }`}>
                                            {evt.type}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-500 transition-colors line-clamp-1">{evt.name}</h4>
                                    <div className="flex items-center gap-1 mt-auto pt-3 text-[10px] text-zinc-500">
                                        <MapPin size={10}/> {evt.location}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
