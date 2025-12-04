
import React, { useState, useEffect } from 'react';
import { Message, MessageRole, ModelType, RegistryEntry, Tender, UserProfile, VhfLog, AisTarget, ThemeMode, TenantConfig, PresentationState, AgentTraceLog } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Canvas } from './components/dashboards/Canvas';
import { ChatInterface } from './components/chat/ChatInterface';
import { BootSequence } from './components/layout/BootSequence';
import { VoiceModal } from './components/modals/VoiceModal';
import { PassportScanner } from './components/modals/PassportScanner';
import { AgentTraceModal } from './components/modals/AgentTraceModal';
import { DailyReportModal } from './components/modals/DailyReportModal';
import { AuthOverlay } from './components/layout/AuthOverlay';
import { PresentationOverlay } from './components/PresentationOverlay'; 
import { orchestratorService } from './services/orchestratorService';
import { marinaExpert } from './services/agents/marinaAgent';
import { presenterExpert } from './services/agents/presenterAgent';
import { executiveExpert } from './services/agents/executiveAgent'; 
import { wimMasterData } from './services/wimMasterData';
import { persistenceService, STORAGE_KEYS } from './services/persistence';
import { streamChatResponse } from './services/geminiService';
import { MessageSquare, LayoutDashboard, Menu as MenuIcon, X, Radio, PlayCircle } from 'lucide-react';
import { FEDERATION_REGISTRY, TENANT_CONFIG } from './services/config';

// --- SIMULATED USER DATABASE ---
export const MOCK_USER_DATABASE: Record<string, UserProfile> = {
  'VISITOR': { 
      id: 'usr_visitor', 
      name: 'Anonymous Visitor', 
      role: 'VISITOR', 
      clearanceLevel: 0, 
      legalStatus: 'GREEN' 
  },
  'MEMBER': { 
      id: 'usr_member_01', 
      name: 'Caner Erkin', 
      role: 'MEMBER', 
      clearanceLevel: 1, 
      legalStatus: 'GREEN',
      loyalty: {
          tier: 'COMMANDER',
          totalMiles: 32500,
          spendableMiles: 12400,
          nextTierProgress: 65,
          milesToNextTier: 17500,
          memberSince: '2023',
          cardNumber: 'TK-19238123'
      }
  },
  'CAPTAIN': { 
      id: 'usr_cpt_01', 
      name: 'Kpt. Barbaros', 
      role: 'CAPTAIN', 
      clearanceLevel: 3, 
      legalStatus: 'GREEN',
      loyalty: {
          tier: 'ADMIRAL',
          totalMiles: 154000,
          spendableMiles: 45000,
          nextTierProgress: 100,
          milesToNextTier: 0,
          memberSince: '2019',
          cardNumber: 'TK-88123991'
      }
  }, 
  'GENERAL_MANAGER': { 
      id: 'usr_gm_01', 
      name: 'Ahmet Engin', 
      role: 'GENERAL_MANAGER', 
      clearanceLevel: 5, 
      legalStatus: 'GREEN' 
  }
};

const App: React.FC = () => {
  // --- STATE: TENANCY & IDENTITY ---
  const [activeTenantId, setActiveTenantId] = useState<string>(FEDERATION_REGISTRY.peers[0].id);
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER_DATABASE['GENERAL_MANAGER']);
  const [showBootSequence, setShowBootSequence] = useState(true);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [targetRole, setTargetRole] = useState<string>('');

  // --- STATE: UI & THEME ---
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat' | 'ops'>('chat');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [dragWidth, setDragWidth] = useState(320); 
  const [dragChatWidth, setDragChatWidth] = useState(500); 

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
    'ada.orchestrator': 'working' 
  });
  
  const [registry, setRegistry] = useState<RegistryEntry[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [vhfLogs, setVhfLogs] = useState<VhfLog[]>([]);
  const [agentTraces, setAgentTraces] = useState<any[]>([]);
  const [aisTargets, setAisTargets] = useState<AisTarget[]>([]);
  const [vesselsInPort, setVesselsInPort] = useState(542);

  // --- MODALS & PRESENTATION ---
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // New Presentation State
  const [presentationState, setPresentationState] = useState<PresentationState>({
      isActive: false,
      currentSlide: 0,
      transcript: "",
      isListening: false
  });

  // EXECUTIVE MODE (Meeting Scribe)
  const [meetingTranscript, setMeetingTranscript] = useState<string>("");

  const activeTenantConfig = FEDERATION_REGISTRY.peers.find(p => p.id === activeTenantId) || TENANT_CONFIG;

  // --- INITIALIZATION ---
  useEffect(() => {
    setTimeout(() => setShowBootSequence(false), 3500);

    const savedProfile = persistenceService.load(STORAGE_KEYS.USER_PROFILE, MOCK_USER_DATABASE['GENERAL_MANAGER']);
    setUserProfile(savedProfile);
    
    const savedTheme = persistenceService.load(STORAGE_KEYS.THEME, 'dark');
    setTheme(savedTheme as ThemeMode);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    const loadData = async () => {
        setTenders(persistenceService.load(STORAGE_KEYS.TENDERS, wimMasterData.assets.tenders));
        const lat = activeTenantConfig.masterData?.identity?.location?.coordinates?.lat || 40.9634;
        const lng = activeTenantConfig.masterData?.identity?.location?.coordinates?.lng || 28.6289;
        const targets = await marinaExpert.scanSector(lat, lng, 20, () => {});
        setAisTargets(targets);
    };
    loadData();

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
  }, [activeTenantId]); 

  // --- HANDLERS ---

  // Presentation Logic: Next Slide
  const handleNextSlide = async () => {
      const nextSlide = presentationState.currentSlide + 1;
      
      // Update state immediately
      setPresentationState(prev => ({ ...prev, currentSlide: nextSlide }));

      // Execute Agent Logic for this slide (UI Changes, Voice, etc.)
      const traceAdder = (t: AgentTraceLog) => setAgentTraces(prev => [...prev, t]);
      
      let actions: any[] = [];
      if (nextSlide === 1) actions = await presenterExpert.playIntro(traceAdder);
      if (nextSlide === 2) actions = await presenterExpert.playSenses(traceAdder);
      if (nextSlide === 3) actions = await presenterExpert.playBrain(traceAdder);
      if (nextSlide === 4) actions = await presenterExpert.playHandover(traceAdder);
      
      console.log("Presentation Action:", actions);
  };

  // Start Meeting Mode (Scribe)
  const handleStartQnA = () => {
      // Switch to Slide 5: Scribe Mode
      // Clear transcript for new session
      setPresentationState(prev => ({ ...prev, currentSlide: 5, transcript: "" }));
      setMeetingTranscript(""); 
      // Open Voice Modal
      setIsVoiceModalOpen(true);
  };

  // Trigger Presentation from UI Button
  const handleStartPresentation = () => {
      setPresentationState(prev => ({ ...prev, isActive: true, currentSlide: 1 }));
      handleNextSlide();
  };

  // End Meeting & Generate Output
  const handleEndMeeting = async () => {
      setIsVoiceModalOpen(false);
      setPresentationState(prev => ({ ...prev, isActive: false, currentSlide: 0 }));
      
      setIsLoading(true);
      const traceAdder = (t: AgentTraceLog) => setAgentTraces(prev => [...prev, t]);

      // Use the accumulated transcript from the voice session
      // For this demo, if transcript is empty, we simulate a conversation
      const finalTranscript = meetingTranscript.length > 50 ? meetingTranscript : "Simulated conversation about pricing discount and contract renewal for Phisedelia.";
      
      const documents = await executiveExpert.analyzeMeeting(finalTranscript, "Barbaros Kaptan", traceAdder);

      // Add resulting messages to Chat
      setMessages(prev => [
          ...prev,
          {
              id: `min_${Date.now()}`,
              role: MessageRole.Model,
              text: documents.minutes,
              timestamp: Date.now()
          },
          {
              id: `prop_${Date.now()}`,
              role: MessageRole.Model,
              text: documents.proposal,
              timestamp: Date.now() + 100
          },
          {
              id: `sys_action_${Date.now()}`,
              role: MessageRole.System,
              text: "System Action: Proposal Draft saved to Drafts. Ready to send.",
              timestamp: Date.now() + 200
          }
      ]);
      
      setIsLoading(false);
  };

  const handleTenantSwitch = (tenantId: string) => {
      setActiveTenantId(tenantId);
      const switchMsg: Message = {
          id: `switch_${Date.now()}`,
          role: MessageRole.System,
          text: `Switched Node to: ${tenantId.toUpperCase()}`,
          timestamp: Date.now()
      };
      setMessages(prev => [...prev, switchMsg]);
      if (tenantId === 'phisedelia') setVesselsInPort(1);
      else setVesselsInPort(542);
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
      const sysMsg: Message = {
          id: `auth_${Date.now()}`,
          role: MessageRole.System,
          text: `Identity Switched: ${newProfile.name} (${newProfile.role})`,
          timestamp: Date.now()
      };
      setMessages(prev => [...prev, sysMsg]);
  };

  const handleSendMessage = async (text: string, attachments: File[]) => {
    // Secret Trigger for Presentation Mode via TEXT
    if (text.toLowerCase().includes('sunum') || text.toLowerCase().includes('presentation') || text.toLowerCase().includes('keynote')) {
        handleStartPresentation();
        return;
    }

    const userMsg: Message = {
        id: `usr_${Date.now()}`,
        role: MessageRole.User,
        text,
        timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
        const orchestratorResult = await orchestratorService.processRequest(
            text, 
            userProfile, 
            tenders, 
            registry, 
            vesselsInPort, 
            messages,
            activeTenantConfig 
        );

        if (orchestratorResult.traces) {
            setAgentTraces(prev => [...prev, ...orchestratorResult.traces]);
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

        let finalText = "";
        
        if (orchestratorResult.text && orchestratorResult.text.length > 5) {
             finalText = orchestratorResult.text;
             const modelMsg: Message = {
                id: `ai_${Date.now()}`,
                role: MessageRole.Model,
                text: finalText,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, modelMsg]);
        } else {
             let streamText = "";
             await streamChatResponse(
                 [...messages, userMsg],
                 selectedModel,
                 true, 
                 false, 
                 registry,
                 tenders,
                 userProfile,
                 vesselsInPort,
                 activeTenantConfig,
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
      
      {/* PRESENTATION OVERLAY */}
      <PresentationOverlay 
          state={presentationState} 
          onClose={() => setPresentationState(prev => ({ ...prev, isActive: false, currentSlide: 0 }))}
          onNextSlide={handleNextSlide}
          onStartQnA={handleStartQnA}
          onEndMeeting={handleEndMeeting}
      />

      <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-colors duration-300">
        
        {/* SIDEBAR */}
        <div 
            className={`
                lg:block lg:relative h-full transition-all duration-300 ease-in-out border-r border-[var(--border-color)] bg-[var(--bg-primary)] z-30
                ${mobileView === 'sidebar' ? 'block absolute inset-0 w-full' : 'hidden'}
            `}
            style={{ width: window.innerWidth >= 1024 ? dragWidth : '100%' }}
        >
            <div className="h-full flex flex-col">
                <Sidebar 
                    nodeStates={nodeStates}
                    activeChannel="72"
                    isMonitoring={true}
                    userProfile={userProfile}
                    onRoleChange={handleRoleChange}
                    onScannerClick={() => setIsScannerOpen(true)}
                    onPulseClick={() => setIsTraceModalOpen(true)}
                    onTenantSwitch={handleTenantSwitch}
                    onStartPresentation={handleStartPresentation} // Connect new handler
                    activeTenantId={activeTenantId}
                />
            </div>
            
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

        {/* CHAT INTERFACE */}
        <div 
            className={`
                flex flex-col h-full relative transition-all duration-300 
                ${mobileView === 'chat' ? 'flex-1 z-10 w-full' : 'hidden lg:flex'}
            `}
            style={{ width: window.innerWidth > 1024 ? dragChatWidth : '100%' }}
        >
            <div className="lg:hidden h-14 border-b border-[var(--border-color)] flex items-center px-4 justify-center bg-[var(--glass-bg)] backdrop-blur-md z-20">
                <span className="font-display font-bold text-[var(--text-primary)]">ADA.<span className="text-[var(--accent-color)]">MOBILE</span></span>
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

        {/* OPERATIONS CANVAS */}
        <div className={`
            lg:block flex-1 h-full bg-[var(--bg-secondary)] border-l border-[var(--border-color)] relative 
            ${mobileView === 'ops' ? 'block absolute inset-0 z-20 w-full' : 'hidden'}
        `}>
            <div className="lg:hidden h-14 border-b border-[var(--border-color)] flex items-center px-4 justify-center bg-[var(--glass-bg)] backdrop-blur-md sticky top-0 z-20">
                 <span className="font-display font-bold text-[var(--text-primary)]">OPS CENTER</span>
            </div>

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

        {/* MOBILE NAV */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-primary)] border-t border-[var(--border-color)] flex items-center justify-around z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
            <button 
                onClick={() => setMobileView('sidebar')}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 ${mobileView === 'sidebar' ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)]'}`}
            >
                <MenuIcon size={20} className={mobileView === 'sidebar' ? 'stroke-2' : ''} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Menu</span>
            </button>

            <button 
                onClick={() => setMobileView('chat')}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 ${mobileView === 'chat' ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)]'}`}
            >
                <MessageSquare size={20} className={mobileView === 'chat' ? 'fill-current' : ''} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Comms</span>
            </button>

            <button 
                onClick={() => setMobileView('ops')}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 ${mobileView === 'ops' ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)]'}`}
            >
                <LayoutDashboard size={20} className={mobileView === 'ops' ? 'fill-current' : ''} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Ops</span>
            </button>
        </div>

      </div>

      {/* MODALS */}
      <VoiceModal 
        isOpen={isVoiceModalOpen} 
        onClose={() => setIsVoiceModalOpen(false)} 
        userProfile={userProfile}
        onTranscriptReceived={(userText, modelText) => {
            // LIVE TRANSCRIPTION: Update presentation state for real-time display
            if (presentationState.currentSlide === 5) {
                const newSnippet = `[${userProfile.name}]: ${userText}\n`;
                setMeetingTranscript(prev => prev + newSnippet);
                setPresentationState(prev => ({ 
                    ...prev, 
                    transcript: prev.transcript + newSnippet 
                }));
            } else {
                // Normal Chat flow
                setMessages(prev => [
                    ...prev, 
                    { id: `v_usr_${Date.now()}`, role: MessageRole.User, text: `[VOICE] ${userText}`, timestamp: Date.now() },
                    { id: `v_mdl_${Date.now()}`, role: MessageRole.Model, text: `[VOICE] ${modelText}`, timestamp: Date.now() }
                ]);
            }
        }}
        channel={presentationState.isActive ? (presentationState.currentSlide === 5 ? "SCRIBE" : "Q&A") : "72"}
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
