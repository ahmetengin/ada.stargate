
import React, { useState } from 'react';
import { 
    Car, CheckCircle2, Zap, Utensils, Calendar, Wind, 
    PartyPopper, QrCode, MapPin, Scan, LogIn, Lock, 
    Award, Plane, ChevronRight, Anchor, CreditCard, 
    Signal, Fingerprint, Snowflake, ShoppingBag, Coffee,
    LifeBuoy, Ship, Wallet
} from 'lucide-react';
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
  const [activeService, setActiveService] = useState<string | null>(null);

  const isMember = userProfile.role === 'MEMBER' || userProfile.role === 'CAPTAIN';

  // Mock vessel for member
  const myVessel = isMember ? {
      name: "S/Y Phisedelia",
      location: "Pontoon C-12",
      status: "SECURE",
      balance: 0
  } : null;

  // Generate a mock QR Data string unique to the user
  const qrData = JSON.stringify({
      uid: userProfile.id,
      name: userProfile.name,
      valid: '24H',
      ts: Date.now()
  });
  
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&color=000000&bgcolor=ffffff`;

  const simulateGateScan = async (gate: string) => {
      const newStatus = accessStatus === 'INSIDE' ? 'OUTSIDE' : 'INSIDE';
      await securityExpert.processAccessPass(userProfile.name, gate, newStatus === 'INSIDE' ? 'ENTRY' : 'EXIT', () => {});
      setAccessStatus(newStatus);
      setLastGate(gate);
  };

  const handleServiceRequest = (service: string) => {
      setActiveService(service);
      setTimeout(() => setActiveService(null), 2000);
  };

  const getTierColor = (tier: string) => {
      switch(tier) {
          case 'ADMIRAL': return 'from-slate-900 to-black border-slate-700 text-white'; 
          case 'COMMANDER': return 'from-amber-100 to-amber-200 border-amber-300 text-amber-900'; 
          default: return 'from-indigo-600 to-indigo-800 border-indigo-500 text-white'; 
      }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-black/20">
        {/* Fixed Header Section */}
        <div className="px-6 py-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">MARINA MEMBER PORTAL</div>
                    <div className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">{userProfile.name}</div>
                </div>
                <div className="text-right">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${isMember ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                        {isMember && <Award size={12} />}
                        {userProfile.loyalty?.tier || 'GUEST'}
                    </div>
                </div>
            </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* --- MEMBER SECTION --- */}
                {isMember && userProfile.loyalty && (
                    <>
                    {/* TOP ROW: CARDS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* 1. Digital Membership Card */}
                        <div className={`relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br ${getTierColor(userProfile.loyalty.tier)} p-6 flex flex-col justify-between h-56 group`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Anchor size={120} /></div>
                            
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <div className="text-[10px] uppercase opacity-70 tracking-[0.2em]">West Istanbul Marina</div>
                                    <div className="font-display font-bold text-xl tracking-widest mt-1">ADA PASS</div>
                                </div>
                                <Scan size={24} className="opacity-80" />
                            </div>

                            <div className="relative z-10">
                                <div className="text-2xl font-mono font-bold tracking-widest mb-2 opacity-90">
                                    {userProfile.loyalty.cardNumber}
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[9px] uppercase opacity-60">Balance</div>
                                        <div className="text-lg font-bold">{userProfile.loyalty.spendableMiles.toLocaleString()} PTS</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] uppercase opacity-60">Valid Thru</div>
                                        <div className="text-sm font-bold">12/28</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Access Control & Gate Key */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex gap-6 items-center shadow-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-zinc-50/50 dark:to-white/5 pointer-events-none"></div>
                            
                            {/* QR Code */}
                            <div className="relative group/qr flex-shrink-0">
                                <div className="w-32 h-32 bg-white p-2 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-center">
                                    <img src={qrImageUrl} alt="Access QR" className="w-full h-full object-contain opacity-90 group-hover/qr:opacity-100 transition-opacity" />
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-red-500/50 shadow-[0_0_15px_red] animate-[scan_2s_ease-in-out_infinite] pointer-events-none opacity-0 group-hover/qr:opacity-100"></div>
                            </div>

                            {/* Gate Controls */}
                            <div className="flex-1 space-y-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-zinc-500 uppercase">Remote Access</span>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${accessStatus === 'INSIDE' ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                                        {accessStatus}
                                    </span>
                                </div>
                                <button onClick={() => simulateGateScan('Main Gate')} className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-200 transition-all group">
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2"><Car size={14}/> Main Gate</span>
                                    <div className="w-2 h-2 rounded-full bg-zinc-300 group-hover:bg-indigo-500 transition-colors"></div>
                                </button>
                                <button onClick={() => simulateGateScan('Pontoon C')} className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-200 transition-all group">
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2"><Anchor size={14}/> Pontoon C</span>
                                    <div className="w-2 h-2 rounded-full bg-zinc-300 group-hover:bg-indigo-500 transition-colors"></div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE ROW: CONCIERGE & VESSEL */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Concierge Grid */}
                        <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-zinc-500">
                                <LifeBuoy size={16} className="text-indigo-500"/>
                                <span className="text-xs font-bold uppercase tracking-widest">Digital Concierge</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { id: 'buggy', label: 'Call Buggy', icon: Car },
                                    { id: 'ice', label: 'Order Ice', icon: Snowflake },
                                    { id: 'coffee', label: 'Coffee Run', icon: Coffee },
                                    { id: 'cleaning', label: 'Cleaning', icon: SparklesIcon }
                                ].map(service => (
                                    <button 
                                        key={service.id}
                                        onClick={() => handleServiceRequest(service.label)}
                                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                                            activeService === service.label 
                                            ? 'bg-emerald-500 text-white border-emerald-600 scale-95' 
                                            : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300 hover:shadow-md'
                                        }`}
                                    >
                                        <service.icon size={20} />
                                        <span className="text-[10px] font-bold uppercase">{activeService === service.label ? 'Sent!' : service.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* My Vessel Status */}
                        {myVessel && (
                            <div className="bg-indigo-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 p-6 opacity-20"><Ship size={80} /></div>
                                
                                <div>
                                    <div className="text-[10px] text-indigo-300 uppercase font-bold tracking-widest mb-1">My Vessel</div>
                                    <div className="text-xl font-black">{myVessel.name}</div>
                                    <div className="text-xs text-indigo-200 font-mono mt-1">{myVessel.location}</div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-indigo-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] uppercase font-bold text-indigo-300">Account</span>
                                        <span className="text-lg font-bold font-mono">€{myVessel.balance.toFixed(2)}</span>
                                    </div>
                                    <div className="mt-2 flex gap-1">
                                        <div className="h-1.5 w-full bg-emerald-500 rounded-full"></div>
                                        <div className="h-1.5 w-full bg-emerald-500 rounded-full"></div>
                                        <div className="h-1.5 w-full bg-emerald-500 rounded-full"></div>
                                    </div>
                                    <div className="text-[9px] text-right mt-1 text-emerald-400 font-bold">Good Standing</div>
                                </div>
                            </div>
                        )}
                    </div>
                    </>
                )}
                
                {/* --- VISITOR SECTION: Hero Card --- */}
                {!isMember && (
                    <div className="relative overflow-hidden bg-indigo-900 rounded-2xl p-10 text-center shadow-2xl border border-indigo-500/30">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-zinc-900/0 to-transparent"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-indigo-400 mb-6 backdrop-blur-md border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                <Lock size={40} />
                            </div>
                            <h3 className="font-bold text-3xl text-white mb-3">Unlock the Marina Life</h3>
                            <p className="text-sm text-indigo-200 mb-8 max-w-lg mx-auto leading-relaxed">
                                Join our exclusive community to manage your vessel, access VIP lounges, and enjoy seamless entry with a digital pass.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
                                <button className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white py-3 px-6 rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2">
                                    <LogIn size={16} /> Member Login
                                </button>
                                <button className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-6 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                                    <CreditCard size={16} /> Apply Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- EVENTS & AMENITIES --- */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={14} /> Curated For You
                        </h3>
                        <button className="text-[10px] text-indigo-500 hover:text-indigo-400 font-bold uppercase hover:underline">View Calendar</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingEvents.map((evt: any) => (
                            <div key={evt.id} className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group cursor-pointer overflow-hidden shadow-sm hover:shadow-md">
                                <div className="h-32 bg-zinc-100 dark:bg-zinc-800 relative">
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-300 dark:text-zinc-700 group-hover:scale-110 transition-transform duration-500">
                                        {evt.type === 'Social' ? <PartyPopper size={40}/> : evt.type === 'Race' ? <Wind size={40}/> : <Utensils size={40}/>}
                                    </div>
                                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/90 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                        {new Date(evt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
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

// Helper Icon for cleaning (using sparkles if available or generic)
const SparklesIcon = ({size}: {size: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/></svg>
);
