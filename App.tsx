
import React, { useState, useEffect, useCallback } from 'react';
import { Message, MessageRole, ModelType, RegistryEntry, Tender, UserProfile, AisTarget, ThemeMode, TenantConfig, PresentationState, AgentTraceLog, WeatherForecast, VhfLog } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { ChatInterface } from './components/chat/ChatInterface';
import { Canvas } from './components/dashboards/Canvas';
import { BootSequence } from './components/layout/BootSequence';
import { PassportScanner } from './components/modals/PassportScanner';
import { DailyReportModal } from './components/dashboards/DailyReportModal';
import { AuthOverlay } from './components/layout/AuthOverlay';
import { PresentationOverlay } from './components/PresentationOverlay';
import { ObserverOverlay } from './components/ObserverOverlay'; // NEW IMPORT
import { VoiceModal } from './components/modals/VoiceModal';
import { orchestratorService } from './services/orchestratorService';
import { executiveExpert } from './services/agents/executiveExpert';
import { persistenceService, STORAGE_KEYS } from './services/persistence';
import { streamChatResponse } from './services/geminiService';
import { FEDERATION_REGISTRY, TENANT_CONFIG } from './services/config';
import { telemetryStream } from './services/telemetryStream';
import { DraggableSplitter } from './components/layout/DraggableSplitter';

export const MOCK_USER_DATABASE: Record<string, UserProfile> = {
  'VISITOR': { id: 'usr_visitor', name: 'Anonymous Visitor', role: 'VISITOR', clearanceLevel: 0, legalStatus: 'GREEN' },
  'MEMBER': { id: 'usr_member_01', name: 'Caner Erkin', role: 'MEMBER', clearanceLevel: 1, legalStatus: 'GREEN', loyalty: { tier: 'COMMANDER', totalMiles: 32500, spendableMiles: 12400, nextTierProgress: 65, milesToNextTier: 17500, memberSince: '2023', cardNumber: 'TK-19238123'}},
  'CAPTAIN': { id: 'usr_cpt_01', name: 'Kpt. Barbaros', role: 'CAPTAIN', clearanceLevel: 3, legalStatus: 'GREEN', loyalty: { tier: 'ADMIRAL', totalMiles: 154000, spendableMiles: 45000, nextTierProgress: 100, milesToNextTier: 0, memberSince: '2019', cardNumber: 'TK-88123991'}},
  'GENERAL_MANAGER': { id: 'usr_gm_01', name: 'Fuat Çimen', role: 'GENERAL_MANAGER', clearanceLevel: 5, legalStatus: 'GREEN' }
};

const MIN_PANEL_WIDTH = 280;
const MAX_PANEL_WIDTH = 600;

const App: React.FC = () => {
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth / 3);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSidebarDrag = useCallback((dx: number) => {
    setSidebarWidth(prev => {
        const newWidth = prev + dx;
        return Math.max(MIN_PANEL_WIDTH, Math.min(newWidth, MAX_PANEL_WIDTH));
    });
  }, []);

  const handleCanvasDrag = useCallback((dx: number) => {
    setCanvasWidth(prev => {
        const newWidth = prev - dx;
        return Math.max(MIN_PANEL_WIDTH, Math.min(newWidth, MAX_PANEL_WIDTH));
    });
  }, []);
    
  const [appMode, setAppMode] = useState<'main' | 'presentation'>('main');
  const [isObserverOpen, setIsObserverOpen] = useState(false); // NEW STATE FOR OBSERVER

  const [activeTenantId, setActiveTenantId] = useState<string>(persistenceService.load(STORAGE_KEYS.ACTIVE_TENANT_ID, FEDERATION_REGISTRY.peers[0].id));
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER_DATABASE['GENERAL_MANAGER']);
  const [showBootSequence, setShowBootSequence] = useState(true);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [targetRole, setTargetRole] = useState<string>('');
  
  const [theme, setTheme] = useState<ThemeMode>(persistenceService.load(STORAGE_KEYS.THEME, 'dark'));
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.Flash);
  const [nodeStates, setNodeStates] = useState<Record<string, 'connected' | 'working' | 'disconnected'>>({'ada.marina': 'connected', 'ada.finance': 'connected', 'ada.legal': 'connected', 'ada.sea': 'connected', 'ada.technic': 'connected', 'ada.customer': 'connected', 'ada.security': 'connected', 'ada.orchestrator': 'working'});
  const [registry, setRegistry] = useState<RegistryEntry[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [agentTraces, setAgentTraces] = useState<AgentTraceLog[]>([]);
  const [aisTargets, setAisTargets] = useState<AisTarget[]>([]);
  const [vesselsInPort, setVesselsInPort] = useState(542);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [presentationState, setPresentationState] = useState<PresentationState>({ isActive: false, slide: 'intro', transcript: '', analysisResults: null });
  const [weatherData, setWeatherData] = useState<WeatherForecast | null>(null);
  const [vhfLogs, setVhfLogs] = useState<VhfLog[]>([]);

  const activeTenantConfig = FEDERATION_REGISTRY.peers.find(p => p.id === activeTenantId) || TENANT_CONFIG;

  useEffect(() => {
    const timer = setTimeout(() => setShowBootSequence(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const initialSystemMessage: Message = {
      id: 'init', role: MessageRole.System, text: "System Initialized.", timestamp: Date.now()
    };
    if (showBootSequence) {
      setMessages([initialSystemMessage]);
    } else {
      const welcomeMessage: Message = {
        id: `model_welcome_${Date.now()}`, role: MessageRole.Model,
        text: `ADA.STARGATE\n\nSistem kayıtlarıma ve mevcut oturum verilerine göre, West Istanbul Marina Genel Müdürü sizsiniz, **Sayın ${userProfile.name}**.\n\nŞu an sistemde **${userProfile.role}** yetkisiyle oturum açmış bulunmaktasınız. Size nasıl yardımcı olabilirim?`,
        timestamp: Date.now()
      };
      setMessages([initialSystemMessage, welcomeMessage]);
    }
  }, [showBootSequence, userProfile.name, userProfile.role]);

  useEffect(() => {
    const unsubscribe = telemetryStream.subscribe(data => {
      if (data.type === 'VESSEL_TELEMETRY' && data.payload?.environment) {
        const { windSpeed, windDir } = data.payload.environment;
        setWeatherData(prev => ({ ...prev, temp: 24, condition: 'Sunny', windSpeed, windDir }));
      }
    });
    return unsubscribe;
  }, []);

  const handleRoleChange = (role: string) => {
    setShowAuthOverlay(true);
    setTargetRole(role);
  };

  const handleAuthComplete = () => {
    setUserProfile(MOCK_USER_DATABASE[targetRole as keyof typeof MOCK_USER_DATABASE] || MOCK_USER_DATABASE['VISITOR']);
    setShowAuthOverlay(false);
  };
  
  const handleTenantSwitch = (tenantId: string) => {
      setActiveTenantId(tenantId);
      persistenceService.save(STORAGE_KEYS.ACTIVE_TENANT_ID, tenantId);
      const tenant = FEDERATION_REGISTRY.peers.find(p => p.id === tenantId);
      setMessages(prev => [...prev, {
          id: `sys_${Date.now()}`, role: MessageRole.System,
          text: `Switched context to ${tenant?.name || 'Unknown Node'}.`, timestamp: Date.now()
      }]);
  };
  
  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    persistenceService.save(STORAGE_KEYS.THEME, newTheme);
  };

  const handleSend = async (text: string, attachments: File[]) => {
    setIsLoading(true);
    const newUserMessage: Message = {
      id: `user_${Date.now()}`, role: MessageRole.User, text: text, timestamp: Date.now(),
    };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);

    const res = await orchestratorService.processRequest(
      text, userProfile, tenders, registry, vesselsInPort, newMessages, activeTenantConfig
    );
    
    setAgentTraces(prev => [...res.traces, ...prev].sort((a, b) => b.timestamp.localeCompare(a.timestamp)));

    if(res.text === "") {
        let fullResponse = '';
        let sources: any[] = [];
        
        const newModelMessage: Message = {
          id: `model_${Date.now()}`, role: MessageRole.Model, text: '...', timestamp: Date.now(),
        };
        setMessages(prev => [...prev, newModelMessage]);

        await streamChatResponse(
            newMessages, selectedModel, false, false, registry, tenders, userProfile, vesselsInPort, activeTenantConfig,
            (chunk, grounding) => {
                fullResponse += chunk;
                if(grounding) sources = [...grounding];
                setMessages(prev => prev.map(m => m.id === newModelMessage.id ? {...m, text: fullResponse, groundingSources: sources} : m));
            }
        );
    } else {
        const newModelMessage: Message = {
            id: `model_${Date.now()}`, role: MessageRole.Model, text: res.text, timestamp: Date.now(),
        };
        setMessages(prev => [...prev, newModelMessage]);
    }
    
    setIsLoading(false);
  };

  const handleTranscriptReceived = (userText: string, modelText: string) => {
      const newEntries: Message[] = [];
      if (userText) {
          newEntries.push({ id: `user_voice_${Date.now()}`, role: MessageRole.User, text: `(VHF) ${userText}`, timestamp: Date.now() });
      }
      if (modelText) {
          newEntries.push({ id: `model_voice_${Date.now()}`, role: MessageRole.Model, text: modelText, timestamp: Date.now() });
      }
      setMessages(prev => [...prev, ...newEntries]);
  };

  const handleEnterObserverMode = () => {
    // UPDATED: Now triggers the full page overlay instead of presentation mode
    setIsObserverOpen(true);
  };

  const handleEnterScribeMode = () => {
    setPresentationState({ isActive: true, slide: 'intro', transcript: '', analysisResults: null });
    setAppMode('presentation');
  };

  const handleClosePresentation = () => {
    setPresentationState({ isActive: false, slide: 'intro', transcript: '', analysisResults: null });
    setAppMode('main');
  };
  
  const handleStartMeeting = () => setPresentationState(prev => ({ ...prev, slide: 'scribe' }));
  const handleScribeInput = (text: string) => setPresentationState(prev => ({ ...prev, transcript: prev.transcript + `\n[MANUAL]: ${text}` }));

  const handleEndMeeting = async () => {
    if (presentationState.transcript.trim().length === 0) {
        handleClosePresentation();
        return;
    }
    setIsLoading(true);
    const results = await executiveExpert.analyzeMeeting(presentationState.transcript, 'Valued Client', (trace: AgentTraceLog) => setAgentTraces(prev => [trace, ...prev]));
    setPresentationState(prev => ({ ...prev, slide: 'analysis', analysisResults: results }));
    setIsLoading(false);
  };

  return (
    <div className={`w-screen h-screen font-sans flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      {showBootSequence && <BootSequence />}
      {showAuthOverlay && <AuthOverlay targetRole={targetRole} onComplete={handleAuthComplete} />}
      
      {/* OBSERVER OVERLAY (FULL SCREEN) */}
      <ObserverOverlay 
        isOpen={isObserverOpen} 
        onClose={() => setIsObserverOpen(false)} 
        traces={agentTraces} 
      />

      {appMode === 'presentation' && (
          <PresentationOverlay 
              state={presentationState}
              userProfile={userProfile}
              onClose={handleClosePresentation}
              onStartMeeting={handleStartMeeting}
              onEndMeeting={handleEndMeeting}
              onScribeInput={handleScribeInput}
              onStateChange={setPresentationState}
              agentTraces={agentTraces}
          />
      )}

      {appMode === 'main' && !showBootSequence && !showAuthOverlay && (
        <main className="flex-1 flex overflow-hidden relative">
          
          {/* Mobile Sidebar Overlay */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-72 h-full bg-[var(--glass-bg)] backdrop-blur-xl border-r border-[var(--border-color)] animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
                    <Sidebar 
                        nodeStates={nodeStates} isMonitoring={false} userProfile={userProfile}
                        onRoleChange={handleRoleChange} onTenantSwitch={handleTenantSwitch}
                        onEnterObserverMode={() => { handleEnterObserverMode(); setIsMobileMenuOpen(false); }}
                        onEnterScribeMode={() => { handleEnterScribeMode(); setIsMobileMenuOpen(false); }} 
                        activeTenantId={activeTenantId} vhfLogs={vhfLogs}
                    />
                </div>
            </div>
          )}

          {/* Desktop Sidebar with Resizable Container */}
          <div className="hidden lg:flex flex-col flex-shrink-0" style={{ width: `${sidebarWidth}px` }}>
              <Sidebar 
                  nodeStates={nodeStates} isMonitoring={false} userProfile={userProfile}
                  onRoleChange={handleRoleChange} onTenantSwitch={handleTenantSwitch}
                  onEnterObserverMode={handleEnterObserverMode}
                  onEnterScribeMode={handleEnterScribeMode} 
                  activeTenantId={activeTenantId} vhfLogs={vhfLogs}
              />
          </div>
          
          <DraggableSplitter onDrag={handleSidebarDrag} />
          
          <div className="flex-1 flex flex-col min-w-0">
            <ChatInterface
                messages={messages} isLoading={isLoading} selectedModel={selectedModel}
                userRole={userProfile.role} theme={theme} activeTenantConfig={activeTenantConfig}
                onModelChange={setSelectedModel} onSend={handleSend}
                onQuickAction={(text) => handleSend(text, [])} onScanClick={() => setIsScannerOpen(true)}
                onRadioClick={() => setIsVoiceModalOpen(true)} onTraceClick={() => {}} 
                onThemeChange={handleThemeChange}
                onToggleSidebar={() => setIsMobileMenuOpen(true)} 
            />
          </div>
          
          <DraggableSplitter onDrag={handleCanvasDrag} />
          
          <div className="hidden lg:flex" style={{ width: `${canvasWidth}px` }}>
            <Canvas 
              vesselsInPort={vesselsInPort} registry={registry} tenders={tenders} userProfile={userProfile}
              onOpenReport={() => setIsReportModalOpen(true)} onOpenTrace={() => {}}
              agentTraces={agentTraces} aisTargets={aisTargets} activeTenantConfig={activeTenantConfig}
            />
          </div>
        </main>
      )}

      <PassportScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanComplete={(res) => console.log(res)} />
      <DailyReportModal 
          isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)}
          registry={registry} logs={agentTraces} vesselsInPort={vesselsInPort}
          userProfile={userProfile} 
          weatherData={weatherData ? [weatherData] : []} activeTenantConfig={activeTenantConfig}
          tenders={tenders} agentTraces={agentTraces} aisTargets={aisTargets}
          onOpenReport={() => setIsReportModalOpen(true)} onOpenTrace={() => {}}
      />
      <VoiceModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          userProfile={userProfile}
          onTranscriptReceived={handleTranscriptReceived}
          channel="72"
      />
    </div>
  );
};

export default App;
