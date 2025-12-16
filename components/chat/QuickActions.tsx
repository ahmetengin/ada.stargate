
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
    Wrench,
    Ship,
    BarChart3,
    Eye,
    QrCode,
    Fuel,
    Users
} from 'lucide-react';
import { UserRole } from '../../types';

interface QuickActionsProps {
  onAction: (text: string) => void;
  userRole: UserRole;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction, userRole }) => {
  
  // Define Role-Specific Action Sets based on Ada's capabilities
  const actions = [
    // --- VISITOR ACTIONS (Information & Access) ---
    { label: 'Wi-Fi', icon: Wifi, text: 'What is the guest wifi password?', roles: ['VISITOR'] },
    { label: 'Map', icon: Map, text: 'Show me the marina map and amenities.', roles: ['VISITOR'] },
    { label: 'Events', icon: Calendar, text: 'What events are happening today?', roles: ['VISITOR'] },
    { label: 'Login', icon: QrCode, text: 'I want to log in / register.', roles: ['VISITOR'] },

    // --- MEMBER ACTIONS (Concierge & Lifestyle) ---
    { label: 'My Pass', icon: QrCode, text: 'Show my digital access pass.', roles: ['MEMBER'] },
    { label: 'Book Table', icon: Utensils, text: 'Reserve a table at Poem Restaurant for tonight.', roles: ['MEMBER'] },
    { label: 'Valet', icon: Car, text: 'I need my car at the main pontoon gate.', roles: ['MEMBER'] },
    { label: 'Concierge', icon: LifeBuoy, text: 'Connect me to the concierge desk.', roles: ['MEMBER'] },
    
    // --- CAPTAIN ACTIONS (Operations & Vessel) ---
    { label: 'Departure', icon: ArrowUp, text: 'Request departure clearance for my vessel.', roles: ['CAPTAIN'] },
    { label: 'Arrival', icon: ArrowDown, text: 'Request arrival & berthing instructions.', roles: ['CAPTAIN'] },
    { label: 'Tender', icon: Ship, text: 'Request tender service to my location.', roles: ['CAPTAIN'] },
    { label: 'Blue Card', icon: Recycle, text: 'I need a waste pump-out (Blue Card process).', roles: ['CAPTAIN'] },
    { label: 'Tech Support', icon: Wrench, text: 'Report a technical fault at my pedestal.', roles: ['CAPTAIN'] },
    { label: 'Fuel', icon: Fuel, text: 'Check fuel station availability.', roles: ['CAPTAIN'] },
    { label: 'Account', icon: CircleDollarSign, text: 'Show my current balance and invoices.', roles: ['CAPTAIN'] },
    
    // --- GM ACTIONS (Oversight & Command) ---
    { label: 'Daily Ops', icon: FileText, text: 'Generate daily operations report.', roles: ['GENERAL_MANAGER'] },
    { label: 'Financials', icon: BarChart3, text: 'Show financial snapshot and overdue accounts.', roles: ['GENERAL_MANAGER'] },
    { label: 'Incidents', icon: AlertTriangle, text: 'List critical security incidents for today.', roles: ['GENERAL_MANAGER'] },
    { label: 'Staff', icon: Users, text: 'Show security patrol status and shift roster.', roles: ['GENERAL_MANAGER'] },
    { label: 'CCTV', icon: Eye, text: 'Access surveillance feeds for Pontoon A.', roles: ['GENERAL_MANAGER'] },
  ];

  const visibleActions = actions.filter(action => action.roles.includes(userRole as string));

  return (
    <div className="flex items-center sm:justify-center gap-2 mt-2 px-0 sm:px-6 overflow-x-auto custom-scrollbar no-scrollbar pb-1 w-full">
      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase font-bold whitespace-nowrap hidden sm:inline">
        {userRole === 'GENERAL_MANAGER' ? 'Command:' : 'Quick:'}
      </span>
      {visibleActions.map((action, idx) => (
        <button 
          key={idx}
          onClick={() => onAction(action.text)}
          className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-md text-[10px] font-mono text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors whitespace-nowrap flex-shrink-0"
        >
          <action.icon size={12} />
          {action.label}
        </button>
      ))}
    </div>
  );
};
