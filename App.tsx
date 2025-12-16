
import React, { useState, useEffect, useCallback } from 'react';
import { Message, MessageRole, ModelType, RegistryEntry, Tender, UserProfile, AisTarget, ThemeMode, TenantConfig, PresentationState, AgentTraceLog, WeatherForecast, VhfLog } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { ChatInterface } from './components/chat/ChatInterface';
import { Canvas } from './components/dashboards/Canvas';
import { BootSequence } from './components/layout/BootSequence';
import { PassportScanner } from './components/modals/PassportScanner';
import { DailyReportModal } from './components/modals/DailyReportModal';
import { AuthOverlay } from './components/layout/AuthOverlay';
import { PresentationOverlay } from './components/PresentationOverlay';
import { ObserverOverlay } from './components/ObserverOverlay'; 
import { VoiceModal } from './components/modals/VoiceModal';
import { orchestratorService } from './services/orchestratorService';
import { executiveExpert } from './services/agents/executiveExpert';
import { persistenceService, STORAGE_KEYS } from './services/persistence';
import { streamChatResponse } from './services/geminiService';
import { FEDERATION_REGISTRY, TENANT_CONFIG } from './services/config';
import { telemetryStream } from './services/telemetryStream';
import { DraggableSplitter } from './components/layout/DraggableSplitter';
import { StatusBar } from './components/layout/StatusBar';
import { marinaExpert } from './services/agents/marinaAgent'; 
import { MOCK_USER_DATABASE } from './services/mockData';

const MIN_PANEL_WIDTH = 280;
const MAX_PANEL_WIDTH = 600;

const App: React.FC = () => {
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth > 1400 ? 500 : 400); 
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
        return Math.max(MIN_PANEL_WIDTH, Math.min(newWidth, 800)); 
    });
  }, []);
    
  const [appMode, setAppMode] = useState<'main' | 'presentation'>('main');
  const [isObserverOpen, setIsObserverOpen] = useState(false); 
  const [gmDashboardTab, setGmDashboardTab] = useState<string | undefined>(undefined);

  const [activeTenantId, setActiveTenantId] = useState<string>(persistenceService.load(STORAGE_KEYS.ACTIVE_TENANT_ID, FEDERATION_REGISTRY.peers[0].id));
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER_DATABASE['GENERAL_MANAGER']);
  const [showBootSequence, setShowBootSequence] = useState(true);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [targetRole, setTargetRole] = useState<string>('');
  
  // Theme State Initialization
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
  
  const [hasAnnouncedArrival, setHasAnnouncedArrival] = useState(false);

  const activeTenantConfig = FEDERATION_REGISTRY.peers.find(p => p.id === activeTenantId) || TENANT_CONFIG;

  useEffect(() => {
    // Increase boot time slightly to show off the new sequence
    const timer = setTimeout(() => setShowBootSequence(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  // Theme Handling Effect
  useEffect(() => {
    const applyTheme = () => {
      const root = window.document.documentElement;
      const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    applyTheme();

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  useEffect(() => {
    const initialSystemMessage: Message = {
      id: 'init', role: MessageRole.System, text: "Bilişsel Sistem Aktif.", timestamp: Date.now()
    };
    if (showBootSequence) {
      setMessages([initialSystemMessage]);
    } else {
      const welcomeMessage: Message = {
        id: `model_welcome_${Date.now()}`, role: MessageRole.Model,
        text: `**ADA.STARGATE (HYPERSCALE)**\n\nSistem Başlatıldı. Bilişsel Varlık Modu devrede.\n\nHoş geldiniz, **Sayın ${userProfile.name}**.\nŞu an **${userProfile.role}** yetkisiyle operasyon merkezindesiniz.\n\n*LangGraph, SEAL ve MAKER modülleri emrinize amade.*`,
        timestamp: Date.now()
      };
      setMessages([initialSystemMessage, welcomeMessage]);
    }
  }, [showBootSequence, userProfile.name, userProfile.role]);

  // PROACTIVE ARRIVAL TRIGGER FOR CAPTAIN BARBAROS
  useEffect(() => {
      if (userProfile.role === 'CAPTAIN' && userProfile.name.includes('Barbaros') && !hasAnnouncedArrival) {
          const timer = setTimeout(async () => {
              const hail = await marinaExpert.generateProactiveHail("S/Y Phisedelia");
              setMessages(prev => [...prev, {
                  id: `proactive_hail_${Date.now()}`,
                  role: MessageRole.Model,
                  text: hail,
                  timestamp: Date.now()
              }]);
              setHasAnnouncedArrival(true);
          }, 1500); 
          return () => clearTimeout(timer);
      }
  }, [userProfile, hasAnnouncedArrival]);

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
    setHasAnnouncedArrival(false);
  };
  
  const handleTenantSwitch = (tenantId: string) => {
      setActiveTenantId(tenantId);
      persistenceService.save(STORAGE_KEYS.ACTIVE_TENANT_ID, tenantId);
      const tenant = FEDERATION_REGISTRY.peers.find(p => p.id === tenantId);
      setMessages(prev => [...prev, {
          id: `sys_${Date.now()}`, role: MessageRole.System,
          text: `Bağlam değiştirildi: ${tenant?.name || 'Bilinmeyen Düğüm'}.`, timestamp: Date.now()
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
    const results = await executiveExpert.analyzeMeeting(presentationState.transcript, 'Değerli Müşteri', (trace: AgentTraceLog) => setAgentTraces(prev => [trace, ...prev]));
    setPresentationState(prev => ({ ...prev, slide: 'analysis', analysisResults: results }));
    setIsLoading(false);
  };

  const handleArchiveMeeting = (results: { minutes: string, proposal: string }) => {
      const archiveMessage: Message = {
          id: `archive_${Date.now()}`,
          role: MessageRole.Model,
          text: `**📁 TOPLANTI ARŞİVİ KAYDEDİLDİ**\n\nAda Executive Modu üzerinden gerçekleştirilen toplantı notları ve teklif taslağı başarıyla oluşturulmuştur.\n\n---\n\n${results.minutes}\n\n---\n\n${results.proposal}`,
          timestamp: Date.now()
      };
      setMessages(prev => [...prev, archiveMessage]);
      handleClosePresentation();
  };

  const handleOpenVoiceMode = () => {
      setIsVoiceModalOpen(true);
  };

  const handleOpenCustomerMode = () => {
      setGmDashboardTab('customer');
      if (window.innerWidth > 1024 && canvasWidth < 100) {
          setCanvasWidth(500); 
      }
  };

  const handleOpenTeamMode = () => {
      setGmDashboardTab('hr');
      if (window.innerWidth > 1024 && canvasWidth < 100) {
          setCanvasWidth(500); 
      }
  };

  return (
    <div className="w-screen h-screen font-sans flex flex-col transition-colors duration-300">
      {showBootSequence && <BootSequence />}
      {showAuthOverlay && <AuthOverlay targetRole={targetRole} onComplete={handleAuthComplete} />}
      
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
        <>
            <main className="flex-1 flex overflow-hidden relative">
            
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="w-72 h-full bg-[var(--glass-bg)] backdrop-blur-xl border-r border-[var(--border-color)] animate-in slide-in-from-left duration-300 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <Sidebar 
                            nodeStates={nodeStates} isMonitoring={false} userProfile={userProfile}
                            onRoleChange={handleRoleChange} onTenantSwitch={handleTenantSwitch}
                            onEnterObserverMode={() => { handleEnterObserverMode(); setIsMobileMenuOpen(false); }}
                            onEnterScribeMode={() => { handleEnterScribeMode(); setIsMobileMenuOpen(false); }} 
                            onOpenVoiceMode={() => { handleOpenVoiceMode(); setIsMobileMenuOpen(false); }}
                            onOpenCustomerMode={() => { handleOpenCustomerMode(); setIsMobileMenuOpen(false); }}
                            onOpenTeamMode={() => { handleOpenTeamMode(); setIsMobileMenuOpen(false); }}
                            activeTenantId={activeTenantId} vhfLogs={vhfLogs}
                        />
                    </div>
                </div>
            )}

            <div className="hidden lg:flex flex-col flex-shrink-0 border-r border-[var(--border-color)]" style={{ width: `${sidebarWidth}px` }}>
                <Sidebar 
                    nodeStates={nodeStates} isMonitoring={false} userProfile={userProfile}
                    onRoleChange={handleRoleChange} onTenantSwitch={handleTenantSwitch}
                    onEnterObserverMode={handleEnterObserverMode}
                    onEnterScribeMode={handleEnterScribeMode} 
                    onOpenVoiceMode={handleOpenVoiceMode}
                    onOpenCustomerMode={handleOpenCustomerMode}
                    onOpenTeamMode={handleOpenTeamMode}
                    activeTenantId={activeTenantId} vhfLogs={vhfLogs}
                />
            </div>
            
            <div className="hidden lg:block">
                <DraggableSplitter onDrag={handleSidebarDrag} />
            </div>
            
            <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]">
                <ChatInterface
                    messages={messages} isLoading={isLoading} selectedModel={selectedModel}
                    userRole={userProfile.role} theme={theme} activeTenantConfig={activeTenantConfig}
                    onModelChange={setSelectedModel} onSend={handleSend}
                    onQuickAction={(text) => handleSend(text, [])} onScanClick={() => setIsScannerOpen(true)}
                    onRadioClick={() => setIsVoiceModalOpen(true)} 
                    onTraceClick={handleEnterObserverMode} 
                    onThemeChange={handleThemeChange}
                    onToggleSidebar={() => setIsMobileMenuOpen(true)} 
                />
            </div>
            
            <div className="hidden xl:block">
                <DraggableSplitter onDrag={handleCanvasDrag} />
            </div>
            
            <div className="hidden xl:flex flex-col border-l border-[var(--border-color)] bg-[var(--bg-secondary)]" style={{ width: `${canvasWidth}px` }}>
                <Canvas 
                    vesselsInPort={vesselsInPort} registry={registry} tenders={tenders} userProfile={userProfile}
                    onOpenReport={() => setIsReportModalOpen(true)} onOpenTrace={handleEnterObserverMode}
                    agentTraces={agentTraces} aisTargets={aisTargets} activeTenantConfig={activeTenantConfig}
                    activeTabOverride={gmDashboardTab}
                />
            </div>
            </main>

            <div className="flex-shrink-0">
                <StatusBar userProfile={userProfile} onToggleAuth={() => handleRoleChange('GENERAL_MANAGER')} />
            </div>
        </>
      )}

      <PassportScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanComplete={(res) => console.log(res)} />
      <DailyReportModal 
          isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)}
          registry={registry} logs={agentTraces} vesselsInPort={vesselsInPort}
          userProfile={userProfile} 
          weatherData={weatherData || { temp: 24, condition: 'Sunny', windSpeed: 12, windDir: 'NW' }} activeTenantConfig={activeTenantConfig}
          tenders={tenders} agentTraces={agentTraces} aisTargets={aisTargets}
          onOpenReport={() => setIsReportModalOpen(true)} onOpenTrace={handleEnterObserverMode}
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
