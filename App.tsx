
import React, { useState, useEffect, useCallback } from 'react';
import { Message, MessageRole, ModelType, UserProfile, ThemeMode, AgentTraceLog } from './types';
import { Sidebar, SidebarTabId } from './components/layout/Sidebar';
import { ChatInterface } from './components/chat/ChatInterface';
import { Canvas } from './components/dashboards/Canvas';
import { BootSequence } from './components/layout/BootSequence';
import { PassportScanner } from './components/modals/PassportScanner';
import { DailyReportModal } from './components/modals/DailyReportModal';
import { AuthOverlay } from './components/layout/AuthOverlay';
import { ObserverOverlay } from './components/layout/ObserverOverlay'; 
import { VoiceModal } from './components/modals/VoiceModal';
import { coalaBrain } from './services/ai/coalaBrain';
import { persistenceService, STORAGE_KEYS } from './services/utils/persistence';
import { FEDERATION_REGISTRY, TENANT_CONFIG } from './services/data/config';
import { DraggableSplitter } from './components/layout/DraggableSplitter';
import { StatusBar } from './components/layout/StatusBar';
import { MOCK_USER_DATABASE } from './services/data/mockData';
import { initializeTelemetryStore } from './services/core/telemetryStore';

const MIN_PANEL_WIDTH = 260;
const MAX_PANEL_WIDTH = 500;

const App: React.FC = () => {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth > 1400 ? 450 : 380); 
  const [isObserverOpen, setIsObserverOpen] = useState(false); 
  const [gmDashboardTab, setGmDashboardTab] = useState<SidebarTabId>('none');
  const [activeTenantId] = useState<string>(persistenceService.load(STORAGE_KEYS.ACTIVE_TENANT_ID, FEDERATION_REGISTRY.peers[0].id));
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER_DATABASE['GENERAL_MANAGER']);
  const [showBootSequence, setShowBootSequence] = useState(true);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [targetRole, setTargetRole] = useState<string>('');
  const [theme, setTheme] = useState<ThemeMode>(persistenceService.load(STORAGE_KEYS.THEME, 'dark'));
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.Flash);
  const [agentTraces, setAgentTraces] = useState<AgentTraceLog[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: 'sys_init', role: MessageRole.System, text: 'Neural Core Online. Handshake Verified.', timestamp: Date.now() }
  ]);

  const activeTenantConfig = FEDERATION_REGISTRY.peers.find(p => p.id === activeTenantId) || TENANT_CONFIG;

  useEffect(() => {
    const timer = setTimeout(() => setShowBootSequence(false), 3500);
    const cleanupTelemetry = initializeTelemetryStore();
    return () => {
      clearTimeout(timer);
      cleanupTelemetry();
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  const handleSidebarDrag = useCallback((dx: number) => {
    setSidebarWidth(prev => Math.max(MIN_PANEL_WIDTH, Math.min(prev + dx, MAX_PANEL_WIDTH)));
  }, []);

  const handleCanvasDrag = useCallback((dx: number) => {
    setCanvasWidth(prev => Math.max(MIN_PANEL_WIDTH, Math.min(prev - dx, 700))); 
  }, []);

  const handleSend = async (text: string) => {
    setIsLoading(true);
    const newUserMessage: Message = { id: `user_${Date.now()}`, role: MessageRole.User, text, timestamp: Date.now() };
    setMessages(prev => [...prev, newUserMessage]);
    coalaBrain.setHistory([...messages, newUserMessage]);

    try {
        const stats = { vessels: 542, tenders: 3 };
        const response = await coalaBrain.cycle(text, userProfile, activeTenantConfig, stats, (trace) => setAgentTraces(prev => [trace, ...prev]));
        setMessages(prev => [...prev, {
            id: `mod_${Date.now()}`,
            role: response.episodeId && response.episodeId !== 'NONE' ? MessageRole.Episode : MessageRole.Model,
            text: response.text || "...",
            timestamp: Date.now(),
            episodeId: response.episodeId as any,
            nodePath: response.nodePath,
            executionResult: response.result
        }]);
    } catch (e: any) {
        setMessages(prev => [...prev, { id: `err_${Date.now()}`, role: MessageRole.Model, text: `⚠️ **System Error**\n\n${e.message || 'Unknown Error'}`, timestamp: Date.now() }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSidebarTabChange = (tabId: SidebarTabId) => {
    if (tabId === 'observer') setIsObserverOpen(true);
    else if (tabId === 'vhf') setIsVoiceModalOpen(true);
    else setGmDashboardTab(tabId);
  };

  return (
    <div className="w-screen h-screen font-sans flex flex-col transition-colors duration-300 bg-[var(--bg-primary)] overflow-hidden">
      {showBootSequence && <BootSequence />}
      {showAuthOverlay && <AuthOverlay targetRole={targetRole} onComplete={() => setShowAuthOverlay(false)} />}
      
      <ObserverOverlay isOpen={isObserverOpen} onClose={() => setIsObserverOpen(false)} traces={agentTraces} />
      
      <VoiceModal 
          isOpen={isVoiceModalOpen} 
          onClose={() => setIsVoiceModalOpen(false)} 
          userProfile={userProfile} 
          activeTenantConfig={activeTenantConfig} 
          onTranscriptReceived={(u, m) => handleSend(`[VHF] ${u}`)} 
          channel="72" 
      />

      <DailyReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        registry={[]} 
        logs={[]} 
        vesselsInPort={542} 
        userProfile={userProfile} 
        activeTenantConfig={activeTenantConfig} 
        weatherData={{ temp: 24, condition: 'Sunny', windSpeed: 12, windDir: 'NW' }} 
        tenders={[]} 
        agentTraces={agentTraces} 
        aisTargets={[]} 
        onOpenReport={() => {}} 
        onOpenTrace={() => setIsObserverOpen(true)} 
      />
      <PassportScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanComplete={(result) => handleSend(`ID Scanned: ${result.data.name}`)} />

      {!showBootSequence && (
        <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 flex overflow-hidden relative">
                <div className="hidden lg:flex flex-col flex-shrink-0" style={{ width: `${sidebarWidth}px` }}>
                    <Sidebar userProfile={userProfile} onRoleChange={(r) => { setTargetRole(r); setShowAuthOverlay(true); }} activeTab={gmDashboardTab} onTabChange={handleSidebarTabChange} />
                </div>
                <div className="hidden lg:block"><DraggableSplitter onDrag={handleSidebarDrag} /></div>
                
                <div className="flex-1 flex flex-col min-w-0">
                    <ChatInterface
                        messages={messages} isLoading={isLoading} selectedModel={selectedModel}
                        userRole={userProfile.role} theme={theme} activeTenantConfig={activeTenantConfig}
                        onModelChange={setSelectedModel} onSend={handleSend}
                        onQuickAction={handleSend} onScanClick={() => setIsScannerOpen(true)}
                        onTraceClick={() => setIsObserverOpen(true)}
                        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                        onRadioClick={() => setIsVoiceModalOpen(true)}
                    />
                </div>
                
                <div className="hidden xl:block"><DraggableSplitter onDrag={handleCanvasDrag} /></div>
                <div className="hidden xl:flex flex-col flex-shrink-0" style={{ width: `${canvasWidth}px` }}>
                    <Canvas 
                        vesselsInPort={542} registry={[]} tenders={[]} userProfile={userProfile}
                        onOpenReport={() => setIsReportModalOpen(true)} onOpenTrace={() => setIsObserverOpen(true)}
                        agentTraces={agentTraces} aisTargets={[]} activeTenantConfig={activeTenantConfig}
                        activeTabOverride={gmDashboardTab}
                    />
                </div>
            </main>
            <StatusBar userProfile={userProfile} onToggleAuth={() => setShowAuthOverlay(true)} nodeHealth="online" latency={42} activeChannel="72" />
        </div>
      )}
    </div>
  );
};

export default App;
