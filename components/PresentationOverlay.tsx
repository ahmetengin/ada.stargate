
import React, { useEffect, useState, useRef } from 'react';
import { Mic, Activity, X, FileText, Terminal, Volume2, VolumeX, CheckCircle2, Download, Mail, PieChart, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PresentationState, UserProfile, AgentTraceLog, TenantConfig } from '../types';
import { generateSpeech } from '../services/geminiService';
import { LiveSession } from '../services/liveService';
import { executiveExpert } from '../services/agents/executiveExpert'; 
import { introNarrative } from '../services/presenterContent';

interface PresentationOverlayProps {
    state: PresentationState;
    userProfile: UserProfile;
    onClose: () => void;
    onStartMeeting: () => void;
    onEndMeeting: () => void;
    onScribeInput: (text: string) => void;
    onStateChange: React.Dispatch<React.SetStateAction<PresentationState>>;
    agentTraces: AgentTraceLog[];
    onArchive?: (results: { minutes: string, proposal: string }) => void;
    activeTenantConfig: TenantConfig;
}

// --- AUDIO DECODING HELPERS ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const PresentationOverlay: React.FC<PresentationOverlayProps> = ({ state, userProfile, onClose, onStartMeeting, onEndMeeting, onScribeInput, onStateChange, agentTraces, onArchive, activeTenantConfig }) => {
    const [subtitles, setSubtitles] = useState<string>("");
    const [audioVis, setAudioVis] = useState<number[]>(new Array(30).fill(5));
    const [isMuted, setIsMuted] = useState(false);
    const [status, setStatus] = useState("OFFLINE");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const transcriptRef = useRef<HTMLDivElement>(null);
    const [scribeInput, setScribeInput] = useState<string>('');
    const sessionRef = useRef<LiveSession | null>(null);
    const [emailStatus, setEmailStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');
    
    // NEW: To toggle between Intro and ROI content
    const [contentMode, setContentMode] = useState<'INTRO' | 'ROI'>('INTRO'); 

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    
    const [narrativeStep, setNarrativeStep] = useState(0);

    // Filter narrative based on mode
    const activeNarrative = introNarrative.filter(line => 
        contentMode === 'INTRO' ? line.id === 'intro_01' : line.id === 'roi_sequence'
    );

    useEffect(() => {
        if (state.isActive) {
            try {
                if (!audioContextRef.current) {
                    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                    audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
                    analyserRef.current = (audioContextRef.current as any).createAnalyser();
                    analyserRef.current.fftSize = 64;
                    gainNodeRef.current = (audioContextRef.current as any).createGain();
                    gainNodeRef.current.connect(analyserRef.current);
                    analyserRef.current.connect(audioContextRef.current.destination);
                }
                setStatus("CONNECTED");
                startVisualizer();
            } catch (err) {
                console.error("Audio Context Init Failed (likely browser block):", err);
                setStatus("AUDIO_BLOCKED");
                // Don't block the visual, just the audio
            }
        } else {
            setStatus("OFFLINE");
            sessionRef.current?.disconnect();
            sessionRef.current = null;
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch((e: any) => console.error("Failed to close audio context", e));
            }
            audioContextRef.current = null;
            if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
        }
        return () => {
             if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
             sessionRef.current?.disconnect();
        };
    }, [state.isActive]);
    
    useEffect(() => {
        if (state.slide === 'scribe' && !sessionRef.current) {
            const newSession = new LiveSession();
            newSession.onStatusChange = (s) => setStatus(s);
            newSession.onTurnComplete = (userText, modelText) => {
                 onStateChange(prev => ({...prev, transcript: prev.transcript + `\n[MİSAFİR]: ${userText}\n[ADA]: ${modelText}`}));
            };
            newSession.connect(userProfile, activeTenantConfig).catch(console.error);
            sessionRef.current = newSession;
        } else if (state.slide !== 'scribe' && sessionRef.current) {
            sessionRef.current.disconnect();
            sessionRef.current = null;
        }
    }, [state.slide, userProfile, activeTenantConfig, onStateChange]);

    // Reset narrative step when switching modes
    useEffect(() => {
        setNarrativeStep(0);
        setIsSpeaking(false);
    }, [contentMode]);

    const startVisualizer = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current!.frequencyBinCount);
        const draw = () => {
            if(analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray);
                const visData = Array.from(dataArray).slice(0, 30).map(v => (v / 255) * 80 + 5);
                setAudioVis(visData);
            }
            animationFrameRef.current = requestAnimationFrame(draw);
        };
        draw();
    };

    useEffect(() => {
        if (state.slide !== 'intro' || isSpeaking || narrativeStep >= activeNarrative.length || status === 'OFFLINE') return;

        const speakNext = async () => {
            if (narrativeStep < activeNarrative.length) {
                setIsSpeaking(true);
                const narrativeLine = activeNarrative[narrativeStep];
                const textToSpeak = narrativeLine.text;
                setSubtitles(textToSpeak);
                
                try {
                    const base64Audio = await generateSpeech(textToSpeak);
                    if (base64Audio && audioContextRef.current && gainNodeRef.current) {
                        try {
                            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
                            const source = audioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(gainNodeRef.current);
                            source.start(0);
                            source.onended = () => {
                                setIsSpeaking(false);
                                setNarrativeStep(prev => prev + 1);
                            };
                        } catch (e) {
                            console.error("Audio playback failed:", e);
                            setIsSpeaking(false);
                            setNarrativeStep(prev => prev + 1);
                        }
                    } else { 
                         // Fallback for silence or error: wait based on text length
                        setTimeout(() => {
                             setIsSpeaking(false);
                             setNarrativeStep(prev => prev + 1);
                        }, textToSpeak.length * 80); 
                    }
                } catch (e) {
                     console.error("Speech Gen Error:", e);
                     setTimeout(() => {
                         setIsSpeaking(false);
                         setNarrativeStep(prev => prev + 1);
                    }, 2000); 
                }
            }
        };

        const pause = activeNarrative[narrativeStep]?.pauseAfter_ms || 1500;
        const timer = setTimeout(speakNext, narrativeStep === 0 ? 800 : pause);
        return () => clearTimeout(timer);
    }, [narrativeStep, isSpeaking, status, state.slide, activeNarrative]);

    useEffect(() => {
        if (gainNodeRef.current && audioContextRef.current) {
            gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : 1, audioContextRef.current.currentTime);
        }
    }, [isMuted]);

    // ... (Transcript scroll & email logic remains same)
    
    const handleSendEmail = async () => {
        if (!state.analysisResults) return;
        setEmailStatus('SENDING');
        const targetEmail = "theahmetengin@gmail.com"; 
        await executiveExpert.sendProposalEmail(targetEmail, "WIM - 2025 Strategic Proposal & Minutes", state.analysisResults.proposal, (t) => console.log(t.content));
        setEmailStatus('SENT');
        setTimeout(() => setEmailStatus('IDLE'), 3000);
    };

    const handleArchiveClick = () => {
        if (onArchive && state.analysisResults) {
            onArchive({
                minutes: state.analysisResults.minutes,
                proposal: state.analysisResults.proposal
            });
        }
    };

    const renderHeader = () => (
        <div className="absolute top-0 left-0 right-0 h-20 flex justify-between items-center px-8 z-50 bg-gradient-to-b from-black via-black/80 to-transparent">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-cyan-400">
                    <Activity className="animate-pulse" size={20} />
                    <span className="text-lg font-black tracking-[0.2em]">ADA.OS</span>
                </div>
                 <div className="h-8 w-px bg-white/20"></div>
                 <div className="text-[10px] text-zinc-400 flex flex-col">
                    <span>SİSTEM MODU</span>
                     <span className="text-emerald-500 font-bold">{contentMode === 'INTRO' ? 'VISION' : 'FINANCIAL CORE'}</span>
                </div>
             </div>

            <div className="flex items-center gap-4">
                <button onClick={() => setIsMuted(!isMuted)} className="p-3 hover:bg-white/10 text-zinc-500 hover:text-white rounded-full transition-all">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                
                {state.slide === 'intro' && (
                    <button 
                        onClick={() => setContentMode(prev => prev === 'INTRO' ? 'ROI' : 'INTRO')}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-widest border transition-all flex items-center gap-2 ${contentMode === 'ROI' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'}`}
                    >
                        <PieChart size={14} /> {contentMode === 'INTRO' ? 'GÖSTER: ANALİZ' : 'GÖSTER: VİZYON'}
                    </button>
                )}

                {state.slide === 'intro' ? (
                    <div className="px-8 py-3 bg-white/5 rounded-full text-xs font-bold tracking-widest text-zinc-400 border border-white/10 animate-pulse">
                        {isSpeaking ? 'ADA KONUŞUYOR...' : 'HAZIRLANIYOR...'}
                    </div>
                ) : state.slide === 'scribe' ? (
                    <button onClick={onEndMeeting} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-bold tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all flex items-center gap-2">
                        <FileText size={14} /> OTURUMU BİTİR
                    </button>
                ) : (
                    <div className="text-emerald-500 font-bold text-xs tracking-widest">SESSION COMPLETE</div>
                )}
                <button onClick={onClose} className="p-3 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 rounded-full transition-all">
                    <X size={20} />
                </button>
            </div>
        </div>
    );

    const renderIntro = () => (
        <>
            {renderHeader()}
            
            {/* CENTRAL VISUAL FOR ROI MODE */}
            {contentMode === 'ROI' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                    <div className="grid grid-cols-4 gap-8 max-w-5xl w-full p-8">
                        <div className="bg-black/60 backdrop-blur-md border border-emerald-500/30 p-6 rounded-2xl animate-in fade-in zoom-in duration-500 delay-100 flex flex-col items-center text-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                            <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest mb-2">Gelir Artışı</div>
                            <div className="text-5xl font-black text-white mb-1">%22</div>
                            <div className="text-xs text-zinc-400">Yıl Sonu EBITDA</div>
                        </div>
                        <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 p-6 rounded-2xl animate-in fade-in zoom-in duration-500 delay-300 flex flex-col items-center text-center shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                            <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest mb-2">Doluluk (TabPFN)</div>
                            <div className="text-5xl font-black text-white mb-1">%92</div>
                            <div className="text-xs text-zinc-400">Öngörülen Kapasite</div>
                        </div>
                        <div className="bg-black/60 backdrop-blur-md border border-amber-500/30 p-6 rounded-2xl animate-in fade-in zoom-in duration-500 delay-500 flex flex-col items-center text-center shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-widest mb-2">Tahsilat Hızı</div>
                            <div className="text-5xl font-black text-white mb-1">3 <span className="text-xl">Gün</span></div>
                            <div className="text-xs text-zinc-400">45 Günden Düşüş</div>
                        </div>
                        <div className="bg-black/60 backdrop-blur-md border border-purple-500/30 p-6 rounded-2xl animate-in fade-in zoom-in duration-500 delay-700 flex flex-col items-center text-center shadow-[0_0_30px_rgba(147,51,234,0.1)]">
                            <div className="text-[10px] uppercase font-bold text-purple-400 tracking-widest mb-2">ROI Süresi</div>
                            <div className="text-5xl font-black text-white mb-1">8.5</div>
                            <div className="text-xs text-zinc-400">Ay (Geri Dönüş)</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black via-black/90 to-transparent z-40 flex flex-col justify-end pb-12 items-center pointer-events-none">
                <div className="flex items-end gap-1 h-12 mb-6 opacity-60">
                    {audioVis.map((h, i) => (<div key={i} className={`w-2 rounded-t-full transition-all duration-75 ${contentMode === 'ROI' ? 'bg-amber-400' : 'bg-cyan-400'}`} style={{ height: `${h}%` }}></div>))}
                </div>
                {subtitles && (
                    <div className="bg-black/40 backdrop-blur-sm p-6 rounded-2xl max-w-4xl mx-4 border border-white/5">
                        <div className="text-xl font-light tracking-wide text-white/90 text-shadow-lg italic text-center leading-relaxed">
                            "{subtitles}"
                        </div>
                    </div>
                )}
            </div>
        </>
    );

    const renderScribe = () => (
         <div className="absolute inset-0 z-10 flex flex-col p-8 pt-24">
             {renderHeader()}
             <div className="flex-1 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center pb-6 border-b border-white/10 mb-6">
                     <div className="flex items-center gap-4"><Terminal size={24} className="text-emerald-500" /><span className="text-xl font-mono font-bold text-white tracking-wider">CANLI_KAYIT_V5.0</span></div>
                     <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div><span className="text-xs font-bold text-red-500 uppercase">Kayıt Alınıyor</span></div>
                </div>
                 <div ref={transcriptRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-4 font-mono text-lg">
                     {state.transcript ? (state.transcript.split('\n').map((line, i) => (<div key={i} className={`flex gap-4 animate-in slide-in-from-left-4 fade-in duration-300 ${line.startsWith('[ADA]') ? 'text-cyan-400' : 'text-zinc-300'}`}><span className="text-emerald-500/50 select-none">{(i+1).toString().padStart(2, '0')}</span><span>{line}</span></div>))) : (<div className="h-full flex items-center justify-center text-zinc-600 italic">Dinleniyor... Konuşmaya başlayabilirsiniz.</div>)}
                </div>
                {state.transcript.length === 0 && (
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                        <button onClick={onStartMeeting} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse transition-all flex items-center gap-2">
                            <Mic size={14} /> DİNLEMEYİ BAŞLAT
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
    
    const renderAnalysis = () => (
        <div className="absolute inset-0 z-10 flex flex-col p-8 pt-24">
            {renderHeader()}
             <div className="flex-1 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl flex flex-col relative overflow-hidden">
                <div className="pb-6 border-b border-white/10 mb-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-500"><CheckCircle2 size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Analiz Tamamlandı</span></div>
                    <h2 className="text-2xl font-bold text-white mt-2">Toplantı Özeti</h2>
                </div>
                 <div className="flex-1 grid grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
                     <div>
                         <h3 className="text-lg font-bold text-cyan-400 mb-4 border-b border-cyan-500/20 pb-2">Toplantı Tutanakları</h3>
                         <div className="prose prose-sm prose-invert prose-p:text-zinc-300 prose-li:text-zinc-300 prose-headings:text-white">
                             <ReactMarkdown>{state.analysisResults?.minutes || "Tutanak oluşturulamadı."}</ReactMarkdown>
                         </div>
                     </div>
                     <div>
                         <h3 className="text-lg font-bold text-amber-400 mb-4 border-b border-amber-500/20 pb-2">Teklif Taslağı</h3>
                         <div className="prose prose-sm prose-invert prose-p:text-zinc-300 prose-li:text-zinc-300 prose-headings:text-white">
                             <ReactMarkdown>{state.analysisResults?.proposal || "Teklif oluşturulamadı."}</ReactMarkdown>
                         </div>
                     </div>
                 </div>
                 <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-4">
                     <button onClick={handleArchiveClick} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold tracking-widest border border-white/20 transition-all"><Download size={14} /> ARŞİVLE</button>
                     
                     <button 
                        onClick={handleSendEmail} 
                        disabled={emailStatus !== 'IDLE'}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-widest shadow-lg transition-all ${
                            emailStatus === 'SENT' ? 'bg-emerald-500 text-white' : 
                            emailStatus === 'SENDING' ? 'bg-indigo-700 text-white/50 cursor-wait' : 
                            'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)]'
                        }`}
                     >
                        {emailStatus === 'SENDING' ? (
                            <><Activity className="animate-spin" size={14} /> GÖNDERİLİYOR...</>
                        ) : emailStatus === 'SENT' ? (
                            <><Check size={14} /> GÖNDERİLDİ</>
                        ) : (
                            <><Mail size={14} /> TEKLİFİ GÖNDER</>
                        )}
                     </button>
                 </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[300] bg-black text-white font-mono overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(76,29,149,0.4),_transparent_70%)] animate-pulse-slow"></div>
                <div className="grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(20,1fr)] w-full h-full">
                    {[...Array(800)].map((_, i) => (
                        <div key={i} className="border-[0.5px] border-white/5"></div>
                    ))}
                </div>
            </div>

            {state.slide === 'intro' && renderIntro()}
            {state.slide === 'scribe' && renderScribe()}
            {state.slide === 'analysis' && renderAnalysis()}
        </div>
    );
};
