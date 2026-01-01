
import React from 'react';
import { 
    ArrowDown, 
    ArrowUp, 
    CircleDollarSign, 
    AlertTriangle, 
    Wifi, 
    Car, 
    Utensils, 
    LifeBuoy, 
    Recycle, 
    FileText,
    Map,
    Calendar,
    Ship,
    BarChart3,
    Eye,
    QrCode,
    Fuel,
    Activity,
    ShieldCheck
} from 'lucide-react';
import { UserRole } from '../../types';

interface QuickActionsProps {
  onAction: (text: string) => void;
  userRole: UserRole;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction, userRole }) => {
  const actions = [
    { label: 'Marina Map', icon: Map, text: 'Show me the marina map and available amenities.', roles: ['VISITOR'] },
    { label: 'WiFi Pass', icon: Wifi, text: 'What is the guest wifi password?', roles: ['VISITOR'] },
    { label: 'Events', icon: Calendar, text: 'What events are happening in the marina today?', roles: ['VISITOR'] },
    { label: 'Register', icon: QrCode, text: 'I want to register my vessel for a short stay.', roles: ['VISITOR'] },
    { label: 'My Pass', icon: QrCode, text: 'Access my digital membership pass.', roles: ['MEMBER'] },
    { label: 'Call Buggy', icon: Car, text: 'I need a buggy at Pontoon B gate.', roles: ['MEMBER'] },
    { label: 'Book Table', icon: Utensils, text: 'Reserve a table for 4 at Poem Restaurant tonight.', roles: ['MEMBER'] },
    { label: 'Concierge', icon: LifeBuoy, text: 'Connect me with the concierge desk.', roles: ['MEMBER'] },
    { label: 'Request Arrival', icon: ArrowDown, text: 'Request arrival clearance and berthing instructions.', roles: ['CAPTAIN'] },
    { label: 'Request Departure', icon: ArrowUp, text: 'Request departure clearance and settle any outstanding fees.', roles: ['CAPTAIN'] },
    { label: 'Radio Check', icon: Activity, text: 'VHF Channel 72 radio check.', roles: ['CAPTAIN'] },
    { label: 'Blue Card', icon: Recycle, text: 'Schedule a waste pump-out and update my Blue Card.', roles: ['CAPTAIN'] },
    { label: 'Fuel Status', icon: Fuel, text: 'Check fuel station current wait time and diesel price.', roles: ['CAPTAIN'] },
    { label: 'Ledger', icon: CircleDollarSign, text: 'Show my current account balance and pending invoices.', roles: ['CAPTAIN'] },
    { label: 'Daily Ops', icon: FileText, text: 'Generate daily operations report for the General Manager.', roles: ['GENERAL_MANAGER'] },
    { label: 'Fin Snapshot', icon: BarChart3, text: 'Show current revenue snapshot and overdue accounts.', roles: ['GENERAL_MANAGER'] },
    { label: 'Incidents', icon: AlertTriangle, text: 'List all critical and warning incidents logged in the last 24 hours.', roles: ['GENERAL_MANAGER'] },
    { label: 'Staff Status', icon: ShieldCheck, text: 'Show security patrol status and personnel on duty.', roles: ['GENERAL_MANAGER'] },
    { label: 'System Trace', icon: Eye, text: 'Open the neural observer for active agents.', roles: ['GENERAL_MANAGER'] },
  ];

  const visibleActions = actions.filter(action => action.roles.includes(userRole as string));

  return (
    <div className="flex items-center gap-2 px-1 overflow-x-auto no-scrollbar pb-1 w-full mask-fade-right">
      <div className="flex items-center gap-1.5 pr-2 border-r border-zinc-200 dark:border-zinc-800 shrink-0">
        <span className="text-[9px] font-mono font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
            {userRole === 'GENERAL_MANAGER' ? 'Direct_Cmd' : 'Shortcuts'}
        </span>
      </div>
      
      <div className="flex items-center gap-2 min-w-max pr-10">
        {visibleActions.map((action, idx) => (
          <button 
            key={idx}
            onClick={() => onAction(action.text)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-cyan-400 transition-all duration-200 group active:scale-95 shadow-sm"
          >
            <action.icon size={12} className="group-hover:scale-110 transition-transform" />
            <span className="whitespace-nowrap uppercase tracking-wider">{action.label}</span>
          </button>
        ))}
      </div>
      
      <style>{`
        .mask-fade-right {
          mask-image: linear-gradient(to right, black 85%, transparent 100%);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
