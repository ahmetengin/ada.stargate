
import React, { useState, useEffect } from 'react';
import { Message, MessageRole, ModelType, RegistryEntry, Tender, UserProfile, VhfLog, AisTarget, ThemeMode, TenantConfig } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Canvas } from './components/dashboards/Canvas';
import { ChatInterface } from './components/chat/ChatInterface';
import { BootSequence } from './components/layout/BootSequence';
import { VoiceModal } from './components/modals/VoiceModal';
import { PassportScanner } from './components/modals/PassportScanner';
import { AgentTraceModal } from './components/modals/AgentTraceModal';
import { DailyReportModal } from './components/modals/DailyReportModal';
import { AuthOverlay } from './components/layout/AuthOverlay';
import { orchestratorService } from './services/orchestratorService';
import { marinaExpert } from './services/agents/marinaAgent';
import { wimMasterData } from './services/wimMasterData';
import { persistenceService, STORAGE_KEYS } from './services/persistence';
import { streamChatResponse } from './services/geminiService';
import { Menu, MessageSquare, Activity, X } from 'lucide-react';
import { FEDERATION_REGISTRY, TENANT_CONFIG } from './services/config';
import { financeExpert } from './services/agents/financeAgent';
import { customerExpert } from './services/agents/customerAgent'; // For Quick Actions

// --- SIMULATED USER DATABASE ---
const MOCK_USER_DATABASE: Record<string, UserProfile> = {
  'VISITOR': { id: 'usr_visitor', name: 'Anonymous Visitor', role: 'VISITOR', clearanceLevel: 0, legalStatus: 'GREEN' },
  'MEMBER': { id: 'usr_member_01', name: 'Caner Erkin', role: 'MEMBER', clearanceLevel: 1, legalStatus: 'GREEN' },
  'CAPTAIN': { id: 'usr_cpt_01', name: 'Kpt. Barbaros', role: 'CAPTAIN', clearanceLevel: 3, legalStatus: 'GREEN' }, // Change to RED to test protocols
  'GENERAL_MANAGER': { id: 'usr_gm_01', name: 'Ahmet Engin', role: 'GENERAL_MANAGER', clearanceLevel: 5, legalStatus: 'GREEN' }
};

const App: React.FC = () => {
  // --- STATE: TENANCY & IDENTITY ---
  const [activeTenantId, setActiveTenantId] = useState<string>(FEDERATION_REGISTRY.peers[0].id);
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER_DATABASE['GENERAL_MANAGER']);
  const [showBootSequence, setShowBootSequence] = useState(true);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [targetRole, setTargetRole] = useState<string>('');

  // --- STATE: UI & THEME ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'canvas'>('chat'); // Mobile toggle
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [dragWidth, setDragWidth] = useState(320); // Sidebar width
  const [dragChatWidth, setDragChatWidth] = useState(500); // Chat width

  // --- STATE: AI & CHAT ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.Pro);
  
  // --- STATE: OPERATIONAL DATA ---
  const [nodeStates, setNodeStates] = useState<Record<string, 'connected' | 'working' | 'disconnected'>>({
    'ada.marina': 'connected',
    'ada.finance': 'connected', 
    'ada.legal': 'connected',
    'ada.sea': 'connected',
    'ada.technic': 'connected',
    'ada.customer': 'connected',
    'ada.security': 'connected',
    'ada.orchestrator': 'working' // Always working as it's the core
  });
  
  const [registry, setRegistry] = useState<RegistryEntry[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [vhfLogs, setVhfLogs] = useState<VhfLog[]>([]);
  const [agentTraces, setAgentTraces] = useState<any[]>([]);
  const [aisTargets, setAisTargets] = useState<AisTarget[]>([]);
  const [vesselsInPort, setVesselsInPort] = useState(542);

  // --- MODALS ---
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // --- DERIVED STATE ---
  const activeTenantConfig = FEDERATION_REGISTRY.peers.find(p => p.id === activeTenantId) || TENANT_CONFIG;

  // --- INITIALIZATION ---
  useEffect(() => {
    // 1. Boot Sequence
    setTimeout(() => setShowBootSequence(false), 3500);

    // 2. Load Persistence
    const savedProfile = persistenceService.load(STORAGE_KEYS.USER_PROFILE, MOCK_USER_DATABASE['GENERAL_MANAGER']);
    setUserProfile(savedProfile);
    
    const savedTheme = persistenceService.load(STORAGE_KEYS.THEME, 'dark');
    setTheme(savedTheme as ThemeMode);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    // 3. Load Mock Data
    const loadData = async () => {
        // Load Fleet/Tenders from persistence or defaults
        setTenders(persistenceService.load(STORAGE_KEYS.TENDERS, wimMasterData.assets.tenders));
        
        // Initial Radar Scan
        // FIX: Safe access to coordinates. Some tenants might not have deep nested structure initially.
        const lat = activeTenantConfig.masterData?.identity?.location?.coordinates?.lat || 40.9634;
        const lng = activeTenantConfig.masterData?.identity?.location?.coordinates?.lng || 28.6289;

        const targets = await marinaExpert.scanSector(lat, lng, 20, () => {});
        setAisTargets(targets);
    };
    loadData();

    // 4. Initial System Greeting (Only if empty)
    if (messages.length === 0) {
        setMessages([{
            id: 'init',
            role: MessageRole.System,
            text: 'System Online',
            timestamp: Date.now()
        }]);
        
        setTimeout(() => {
            const welcomeMsg: Message = {
                id: `wel_${Date.now()}`,
                role: MessageRole.Model,
                text: `**${activeTenantConfig.fullName} ONLINE.**\n\nI am ready to orchestrate operations. The **Big 4** Neural Grid (Marina, Finance, Legal, Stargate) is active.\n\n*Awaiting operational commands.*`,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, welcomeMsg]);
        }, 4000);
    }

  }, [activeTenantId]); // Re-run when tenant changes

  // --- HANDLERS ---

  const handleTenantSwitch = (tenantId: string) => {
      // Logic to switch context
      setActiveTenantId(tenantId);
      // Add a system message indicating the switch
      const switchMsg: Message = {
          id: `switch_${Date.now()}`,
          role: MessageRole.System,
          text: `Switched Node to: ${tenantId.toUpperCase()}`,
          timestamp: Date.now()
      };
      setMessages(prev => [...prev, switchMsg]);
      
      // In a real app, we would reload specific data for that tenant here
      if (tenantId === 'phisedelia') {
          // Switch to vessel mode
          setVesselsInPort(1); // Just itself
      } else {
          setVesselsInPort(542);
      }
  };

  const handleRoleChange = (role: string) => {
      if (role !== userProfile.role) {
          setTargetRole(role);
          setShowAuthOverlay(true);
      }
  };

  const completeRoleChange = () => {
      const newProfile = MOCK_USER_DATABASE[targetRole] || MOCK_USER_DATABASE['VISITOR'];
      setUserProfile(newProfile);
      persistenceService.save(STORAGE_KEYS.USER_PROFILE, newProfile);
      setShowAuthOverlay(false);
      
      // Notify System
      const sysMsg: Message = {
          id: `auth_${Date.now()}`,
          role: MessageRole.System,
          text: `Identity Switched: ${newProfile.name} (${newProfile.role})`,
          timestamp: Date.now()
      };
      setMessages(prev => [...prev, sysMsg]);
  };

  const handleSendMessage = async (text: string, attachments: File[]) => {
    // 1. Add User Message
    const userMsg: Message = {
        id: `usr_${Date.now()}`,
        role: MessageRole.User,
        text,
        timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // 2. Orchestrate (Thinking...)
    try {
        // A. Quick Local Check (Orchestrator Heuristics)
        const orchestratorResult = await orchestratorService.processRequest(
            text, 
            userProfile, 
            tenders, 
            registry, 
            vesselsInPort, 
            messages,
            activeTenantConfig // Pass dynamic tenant config
        );

        // B. Add Traces & Actions from Orchestrator
        if (orchestratorResult.traces) {
            setAgentTraces(prev => [...prev, ...orchestratorResult.traces]);
            // Update node states based on active traces
            const newStates = { ...nodeStates };
            orchestratorResult.traces.forEach(t => {
                if (t.node) newStates[t.node] = 'working';
            });
            setNodeStates(newStates);
            setTimeout(() => setNodeStates(prev => {
                const idle = { ...prev };
                Object.keys(idle).forEach(k => idle[k] = 'connected');
                return idle;
            }), 2000);
        }

        // C. Stream Response (Gemini) or Use Static Response
        // If Orchestrator provided a direct text response (e.g., from a tool), use it.
        // Otherwise, stream from Gemini.
        
        let finalText = "";
        
        if (orchestratorResult.text && orchestratorResult.text.length > 5) {
             // Direct response from tool/orchestrator
             finalText = orchestratorResult.text;
             const modelMsg: Message = {
                id: `ai_${Date.now()}`,
                role: MessageRole.Model,
                text: finalText,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, modelMsg]);
        } else {
             // Fallback to Generative Response (Streaming)
             let streamText = "";
             await streamChatResponse(
                 [...messages, userMsg],
                 selectedModel,
                 true, // useSearch
                 false, // useThinking
                 registry,
                 tenders,
                 userProfile,
                 vesselsInPort,
                 activeTenantConfig, // Tenant Context
                 (chunk) => {
                     streamText += chunk;
                     setMessages(prev => {
                         const last = prev[prev.length - 1];
                         if (last.role === MessageRole.Model && last.id === `stream_${userMsg.id}`) {
                             return [...prev.slice(0, -1), { ...last, text: streamText }];
                         } else {
                             return [...prev, { id: `stream_${userMsg.id}`, role: MessageRole.Model, text: streamText, timestamp: Date.now() }];
                         }
                     });
                 }
             );
        }

    } catch (error) {
        console.error("Orchestration Error:", error);
        setMessages(prev => [...prev, {
            id: `err_${Date.now()}`,
            role: MessageRole.Model,
            text: "**SYSTEM ERROR:** Neural link unstable. Please retry.",
            timestamp: Date.now()
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleQuickAction = (text: string) => {
      handleSendMessage(text, []);
  };

  const handleThemeToggle = () => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      persistenceService.save(STORAGE_KEYS.THEME, newTheme);
  };

  return (
    <>
      {showBootSequence && <BootSequence />}
      {showAuthOverlay && <AuthOverlay targetRole={targetRole} onComplete={completeRoleChange} />}

      <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
        
        {/* MOBILE OVERLAY */}
        {isSidebarOpen && (
            <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* LEFT: SIDEBAR (Navigation & Status) */}
        <div 
            className={`fixed lg:relative z-50 h-full transition-all duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            style={{ width: isSidebarOpen ? dragWidth : 0 }}
        >
            <Sidebar 
                nodeStates={nodeStates}
                activeChannel="72"
                isMonitoring={true}
                userProfile={userProfile}
                onRoleChange={handleRoleChange}
                onScannerClick={() => setIsScannerOpen(true)}
                onPulseClick={() => setIsTraceModalOpen(true)}
                onTenantSwitch={handleTenantSwitch}
                activeTenantId={activeTenantId}
            />
            {/* Drag Handle */}
            <div 
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--accent-color)] opacity-0 hover:opacity-100 transition-opacity z-50 hidden lg:block"
                onMouseDown={(e) => {
                    const startX = e.clientX;
                    const startWidth = dragWidth;
                    const onMove = (e: MouseEvent) => setDragWidth(Math.max(250, Math.min(400, startWidth + e.clientX - startX)));
                    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                }}
            />
        </div>

        {/* CENTER: CHAT INTERFACE */}
        <div 
            className={`flex flex-col h-full relative transition-all duration-300 ${activeTab === 'chat' ? 'flex-1' : 'hidden lg:flex'}`}
            style={{ width: window.innerWidth > 1024 ? dragChatWidth : '100%' }}
        >
            {/* Mobile Header */}
            <div className="lg:hidden h-14 border-b border-[var(--border-color)] flex items-center px-4 justify-between bg-[var(--glass-bg)] backdrop-blur-md">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={24} /></button>
                <span className="font-display font-bold">ADA.MARINA</span>
                <button onClick={() => setActiveTab(activeTab === 'chat' ? 'canvas' : 'chat')}>
                    {activeTab === 'chat' ? <Activity size={24}/> : <MessageSquare size={24}/>}
                </button>
            </div>

            <ChatInterface 
                messages={messages}
                activeChannel="72"
                isLoading={isLoading}
                selectedModel={selectedModel}
                userRole={userProfile.role}
                theme={theme}
                activeTenantConfig={activeTenantConfig}
                onModelChange={setSelectedModel}
                onSend={handleSendMessage}
                onQuickAction={handleQuickAction}
                onScanClick={() => setIsScannerOpen(true)}
                onRadioClick={() => setIsVoiceModalOpen(true)}
                onTraceClick={() => setIsTraceModalOpen(true)}
                onToggleTheme={handleThemeToggle}
            />

            {/* Drag Handle (Right) */}
            <div 
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--accent-color)] opacity-0 hover:opacity-100 transition-opacity z-50 hidden lg:block"
                onMouseDown={(e) => {
                    const startX = e.clientX;
                    const startWidth = dragChatWidth;
                    const onMove = (e: MouseEvent) => setDragChatWidth(Math.max(400, Math.min(800, startWidth + e.clientX - startX)));
                    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                }}
            />
        </div>

        {/* RIGHT: OPERATIONS CANVAS (Visuals) */}
        <div className={`flex-1 h-full bg-[var(--bg-secondary)] border-l border-[var(--border-color)] relative ${activeTab === 'canvas' ? 'block' : 'hidden lg:block'}`}>
            <Canvas 
                vesselsInPort={vesselsInPort}
                registry={registry}
                tenders={tenders}
                userProfile={userProfile}
                agentTraces={agentTraces}
                vhfLogs={vhfLogs}
                aisTargets={aisTargets}
                onOpenReport={() => setIsReportModalOpen(true)}
                onOpenTrace={() => setIsTraceModalOpen(true)}
                activeTenantConfig={activeTenantConfig}
            />
        </div>

      </div>

      {/* MODALS */}
      <VoiceModal 
        isOpen={isVoiceModalOpen} 
        onClose={() => setIsVoiceModalOpen(false)} 
        userProfile={userProfile}
        onTranscriptReceived={(userText, modelText) => {
            setMessages(prev => [
                ...prev, 
                { id: `v_usr_${Date.now()}`, role: MessageRole.User, text: `[VOICE] ${userText}`, timestamp: Date.now() },
                { id: `v_mdl_${Date.now()}`, role: MessageRole.Model, text: `[VOICE] ${modelText}`, timestamp: Date.now() }
            ]);
        }}
        channel="72"
      />

      <PassportScanner 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={(result) => {
            const text = result.type === 'PASSPORT' 
                ? `Scanned Passport for ${result.data.name} (${result.data.nationality}). ID: ${result.data.id}. Expiry: ${result.data.expiry}`
                : `Scanned Card for ${result.data.holder}. Network: ${result.data.network}.`;
            handleSendMessage(text, []);
        }}
      />

      <AgentTraceModal 
        isOpen={isTraceModalOpen}
        onClose={() => setIsTraceModalOpen(false)}
        traces={agentTraces}
      />

      <DailyReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        registry={registry}
        logs={agentTraces.filter(t => t.step === 'ERROR' || t.content.includes('ALERT'))}
        vesselsInPort={vesselsInPort}
        userProfile={userProfile}
        weatherData={[{ temp: 24, condition: 'Clear', windSpeed: 12, windDir: 'NW', day: 'Today' }]}
        activeTenantConfig={activeTenantConfig}
      />

    </>
  );
};

export default App;
