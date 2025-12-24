
// App.tsx (Updated for Episodes)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Message, MessageRole, ModelType, RegistryEntry, Tender, UserProfile, AisTarget, ThemeMode, TenantConfig, PresentationState, AgentTraceLog, WeatherForecast } from './types';
import { Sidebar, SidebarTabId } from './components/layout/Sidebar';
import { ChatInterface } from './components/chat/ChatInterface';
import { Canvas } from './components/dashboards/Canvas';
import { BootSequence } from './components/layout/BootSequence';
import { PassportScanner } from './components/modals/PassportScanner';
import { DailyReportModal } from './components/modals/DailyReportModal';
import { AuthOverlay } from './components/layout/AuthOverlay';
import { PresentationOverlay } from './components/PresentationOverlay';
import { ObserverOverlay } from './components/ObserverOverlay'; 
import { VoiceModal } from './components/modals/VoiceModal';
import { coalaBrain } from './services/coalaBrain';
import { persistenceService, STORAGE_KEYS } from './services/persistence';
import { FEDERATION_REGISTRY, TENANT_CONFIG } from './services/config';
import { telemetryStream } from './services/telemetryStream';
import { DraggableSplitter } from './components/layout/DraggableSplitter';
import { StatusBar } from './components/layout/StatusBar';
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
  
  const [theme, setTheme] = useState<ThemeMode>(persistenceService.load(STORAGE_KEYS.THEME, 'dark'));
  
  const [messages, setMessages] = useState<Message[]>([
    {
        id: 'sys_init',
        role: MessageRole.System,
        text: 'Protocol Initialized',
        timestamp: Date.now()
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.Flash);
  const [registry, setRegistry] = useState<RegistryEntry[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [agentTraces, setAgentTraces] = useState<AgentTraceLog[]>([]);
  const [aisTargets, setAisTargets] = useState<AisTarget[]>([]);
  const [vesselsInPort, setVesselsInPort] = useState(542);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  
  const activeTenantConfig = FEDERATION_REGISTRY.peers.find(p => p.id === activeTenantId) || TENANT_CONFIG;

  useEffect(() => {
    const timer = setTimeout(() => setShowBootSequence(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  const handleRoleChange = (role: string) => {
    setShowAuthOverlay(true);
    setTargetRole(role);
  };

  const handleAuthComplete = () => {
    setUserProfile(MOCK_USER_DATABASE[targetRole as keyof typeof MOCK_USER_DATABASE] || MOCK_USER_DATABASE['VISITOR']);
    setShowAuthOverlay(false);
  };
  
  const handleSend = async (text: string, attachments: File[]) => {
    setIsLoading(true);
    const newUserMessage: Message = {
      id: `user_${Date.now()}`, role: MessageRole.User, text: text, timestamp: Date.now(),
    };
    
    // Optimistic Update
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    
    // Update Memory immediately
    coalaBrain.setHistory(newMessages);

    try {
        const stats = { vessels: vesselsInPort, tenders: tenders.length };
        const response = await coalaBrain.cycle(
            text, 
            userProfile, 
            activeTenantConfig, 
            stats, 
            (trace) => setAgentTraces(prev => [trace, ...prev])
        );

        const newMessagesList = [...newMessages];

        // If an episode is detected, add a cinematic message
        if (response.episodeId && response.episodeId !== 'NONE') {
            newMessagesList.push({
                id: `epi_${Date.now()}`,
                role: MessageRole.Episode,
                text: response.text,
                timestamp: Date.now(),
                episodeId: response.episodeId,
                nodePath: response.nodePath
            });
        } else {
            newMessagesList.push({
                id: `mod_${Date.now()}`,
                role: MessageRole.Model,
                text: response.text || "...",
                timestamp: Date.now(),
                nodePath: response.nodePath
            });
        }
        
        setMessages(newMessagesList);

    } catch (e: any) {
        console.error("CoALA Cycle Failed:", e);
        // Visible Error Handling in Chat
        setMessages(prev => [...prev, {
            id: `err_${Date.now()}`,
            role: MessageRole.Model,
            text: `⚠️ **Sistem Hatası / System Error**\n\nBağlantı kurulamadı veya bir hata oluştu.\n*Detay: ${e.message || 'Unknown Error'}*`,
            timestamp: Date.now()
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (userText: string, modelText: string) => {
    if (!userText && !modelText) return;
    const timestamp = Date.now();
    setMessages(prev => [...prev, 
        { id: `vuser_${timestamp}`, role: MessageRole.User, text: `[VHF_RADIO]: ${userText}`, timestamp },
        { id: `vada_${timestamp + 1}`, role: MessageRole.Model, text: modelText, timestamp: timestamp + 1 }
    ]);
  };

  const handleSidebarTabChange = (tabId: SidebarTabId) => {
    if (tabId === 'observer') setIsObserverOpen(true);
    else if (tabId === 'vhf') setIsVoiceModalOpen(true);
    else if (tabId === 'crm') setGmDashboardTab('customer');
    else if (tabId === 'tech') setGmDashboardTab('commercial'); 
    else if (tabId === 'hr') setGmDashboardTab('hr');
    else setGmDashboardTab(undefined);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  const getActiveSidebarTab = (): SidebarTabId => {
      if (isObserverOpen) return 'observer';
      if (appMode === 'presentation') return 'presenter';
      if (isVoiceModalOpen) return 'vhf';
      if (gmDashboardTab === 'customer') return 'crm';
      if (gmDashboardTab === 'commercial') return 'tech';
      if (gmDashboardTab === 'hr') return 'hr';
      return 'none';
  };

  return (
    <div className="w-screen h-screen font-sans flex flex-col transition-colors duration-300">
      {showBootSequence && <BootSequence />}
      {showAuthOverlay && <AuthOverlay targetRole={targetRole} onComplete={handleAuthComplete} />}
      
      <ObserverOverlay isOpen={isObserverOpen} onClose={() => setIsObserverOpen(false)} traces={agentTraces} />

      <VoiceModal 
        isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)}
        userProfile={userProfile} activeTenantConfig={activeTenantConfig}
        onTranscriptReceived={handleVoiceTranscript} channel="72"
      />

      <DailyReportModal 
        isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)}
        registry={registry} logs={agentTraces} vesselsInPort={vesselsInPort}
        userProfile={userProfile} activeTenantConfig={activeTenantConfig}
        weatherData={[{ temp: 24, condition: 'Sunny', windSpeed: 12, windDir: 'NW' }]}
        tenders={tenders} agentTraces={agentTraces} aisTargets={aisTargets}
        onOpenReport={() => setIsReportModalOpen(true)} onOpenTrace={() => setIsObserverOpen(true)}
      />

      <PassportScanner 
        isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)}
        onScanComplete={(result) => handleSend(`Kimlik/Pasaport tarandı: ${result.data.name}`, [])}
      />

      {appMode === 'main' && !showBootSequence && !showAuthOverlay && (
        <>
            {/* MOBILE MENU OVERLAY */}
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-[100] lg:hidden flex">
                <div 
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                ></div>
                
                <div className="relative w-[80%] max-w-[300px] h-full bg-[#020617] border-r border-white/10 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                  <Sidebar 
                    userProfile={userProfile} 
                    onRoleChange={handleRoleChange} 
                    activeTab={getActiveSidebarTab()} 
                    onTabChange={handleSidebarTabChange}
                    onPulseClick={() => {
                        // Optional pulse logic
                    }}
                  />
                </div>
              </div>
            )}

            <main className="flex-1 flex overflow-hidden relative">
            
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex flex-col flex-shrink-0 border-r border-white/5" style={{ width: `${sidebarWidth}px` }}>
                <Sidebar 
                    userProfile={userProfile} onRoleChange={handleRoleChange} 
                    activeTab={getActiveSidebarTab()} onTabChange={handleSidebarTabChange}
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
                    onTraceClick={() => setIsObserverOpen(true)}
                    onRadioClick={() => setIsVoiceModalOpen(true)}
                    onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} // Simplified toggle for mobile
                    onToggleSidebar={() => setIsMobileMenuOpen(true)} 
                />
            </div>
            
            <div className="hidden xl:block">
                <DraggableSplitter onDrag={handleCanvasDrag} />
            </div>
            
            <div className="hidden xl:flex flex-col border-l border-white/5 bg-[var(--bg-secondary)]" style={{ width: `${canvasWidth}px` }}>
                <Canvas 
                    vesselsInPort={vesselsInPort} registry={registry} tenders={tenders} userProfile={userProfile}
                    onOpenReport={() => setIsReportModalOpen(true)} onOpenTrace={() => setIsObserverOpen(true)}
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
    </div>
  );
};

export default App;
