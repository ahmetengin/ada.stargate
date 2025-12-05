
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

        {/* --- ADA SEA MILES CARD (MEMBER ONLY) --- */}
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

        {/* --- VISITOR CARD (NON-MEMBER) --- */}
        {!isMember && (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-2">Visitor Access Pass</h3>
                    <p className="text-sm opacity-90 mb-4">You have limited access to Marina facilities. Upgrade to Member status for exclusive benefits.</p>
                    <div className="flex items-center gap-2 text-xs font-mono bg-white/10 p-2 rounded w-fit">
                        <Lock size={12} />
                        ID: {userProfile.id}
                    </div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-20">
                    <Scan size={120} />
                </div>
            </div>
        )}

        {/* --- DIGITAL GATE KEY (MEMBER ONLY) --- */}
        {isMember && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                <div className="bg-white p-2 rounded-xl shadow-inner border border-zinc-100">
                    <img src={qrImageUrl} alt="Access QR" className="w-32 h-32 object-contain" />
                </div>
                
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">Gate Access Key</h3>
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

                    <div className="grid grid-cols-2 gap-2">
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
                            <span className="flex items-center gap-2"><Anchor size={14}/> Pontoon C</span>
                            <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                    
                    {lastGate && (
                        <div className="mt-2 text-[10px] text-zinc-400 text-center">
                            Last Activity: {lastGate} • {new Date().toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>
        )}
        
        {/* --- LOGIN / REGISTER CTA (VISITOR ONLY) --- */}
        {!isMember && (
            <div className="bg-indigo-600/10 dark:bg-indigo-900/30 border border-indigo-500/30 rounded-2xl p-6 text-center shadow-lg">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto text-white mb-4">
                  <Lock size={24} />
                </div>
                <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">Unlock Full Access</h3>
                <p className="text-xs text-zinc-500 mt-1 mb-4">Log in to manage your vessel, access exclusive services, and view your digital pass.</p>
                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <LogIn size={14} /> Member Login / Register
                </button>
            </div>
        )}

        {/* --- UPCOMING EVENTS (Visible to All) --- */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} /> Marina Calendar
                </h3>
            </div>
            
            <div className="space-y-3">
                {upcomingEvents.map((evt: any) => (
                    <div key={evt.id} className="flex gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group cursor-pointer">
                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 group-hover:text-indigo-500 transition-colors">
                            <span className="text-[10px] font-bold uppercase">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-lg font-black">{new Date(evt.date).getDate()}</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-500 transition-colors">{evt.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] text-zinc-500 flex items-center gap-1"><MapPin size={10}/> {evt.location}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                    evt.type === 'Social' ? 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' :
                                    evt.type === 'Race' ? 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' :
                                    'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                }`}>
                                    {evt.type}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <ChevronRight size={16} className="text-zinc-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
