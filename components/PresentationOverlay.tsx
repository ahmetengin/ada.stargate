
import React, { useEffect, useState, useRef } from 'react';
import { Mic, Radio, Brain, X, ChevronRight, FileText, Terminal, Volume2, VolumeX, Activity } from 'lucide-react';
import { PresentationState, UserProfile } from '../types';
import { LiveSession } from '../services/geminiService';
import { MOCK_USER_DATABASE } from '../App';

interface PresentationOverlayProps {
    state: PresentationState;
    onClose: () => void;
    onNextSlide: () => void;
    onStartQnA: () => void;
    onEndMeeting: () => void; 
}

export const PresentationOverlay: React.FC<PresentationOverlayProps> = ({ state, onClose, onNextSlide, onStartQnA, onEndMeeting }) => {
    const [subtitles, setSubtitles] = useState<string>("");
    const [audioVis, setAudioVis] = useState<number[]>(new Array(20).fill(10));
    const [isMuted, setIsMuted] = useState(false);
    const [status, setStatus] = useState("INITIALIZING");
    const transcriptRef = useRef<HTMLDivElement>(null);
    const sessionRef = useRef<LiveSession | null>(null);

    // Get Current User (Simulated for this context)
    const user = MOCK_USER_DATABASE['GENERAL_MANAGER']; 

    // --- LIVE SESSION CONNECTION ---
    useEffect(() => {
        if (!state.isActive) {
            if (sessionRef.current) {
                sessionRef.current.disconnect();
                sessionRef.current = null;
            }
            return;
        }

        const initSession = async () => {
            if (sessionRef.current) return;

            const session = new LiveSession();
            session.onStatusChange = (s) => setStatus(s.toUpperCase());
            session.onAudioLevel = (level) => {
                // Update visualizer based on real audio energy
                setAudioVis(prev => {
                    const newVis = [...prev.slice(1), Math.min(100, Math.max(10, level * 200))];
                    return newVis;
                });
            };
            
            // Capture what Ada says for subtitles
            session.onTurnComplete = (_, modelText) => {
                // We could use this to log history, but subtitles handle real-time better
            };

            await session.connect(user, 'PRESENTER');
            sessionRef.current = session;
        };

        initSession();

        return () => {
            // Cleanup on unmount
            if (sessionRef.current) {
                sessionRef.current.disconnect();
                sessionRef.current = null;
            }
        };
    }, [state.isActive]);


    // --- NARRATIVE DRIVER ---
    // Instead of hardcoded text, we send prompts to the model to "Perform" the text.
    useEffect(() => {
        if (!sessionRef.current || status !== 'CONNECTED') return;
        if (state.currentSlide > 4) return; // Slide 5 is listening mode

        const triggerSpeech = async () => {
            let prompt = "";
            switch (state.currentSlide) {
                case 1: 
                    prompt = "Say this naturally and warmly: 'Herkese merhabalar, hoş geldiniz! Ben Ada... Öncelikle şunu söylemeliyim; yeriniz gerçekten biraz uzakmış, gelirken işlemcilerim ısındı! Ama burayı görünce vay canına dedim, bu manzaraya kesinlikle değermiş. Ben sadece bir yazılım değilim, sizinle çalışmak için sabırsızlanan yeni dijital ekip arkadaşınızım.'";
                    break;
                case 2:
                    prompt = "Say this with a tone of impressive capability: 'Gözlerim biraz keskindir. Şu an 20 deniz mili ötedeki bir martının kanat çırpışını bile takip edebiliyorum. Şaka yapmıyorum, marina güvenliği benden sorulur. Rüzgarı hisseder, fırtınayı gelmeden koklarım. Sürprizleri sevmem, her şeyi önceden bilirim.'";
                    break;
                case 3:
                    prompt = "Say this confidently and intelligently: 'Biraz da beynimden bahsedeyim. Mütevazı olmayacağım, kapasitem sınırsız. Hukuktan finansa, mühendislikten müşteri ilişkilerine kadar her veriyi saniyeler içinde harmanlarım. Siz kahvenizi yudumlarken, ben arka planda tüm riskleri hesaplayıp işleri yoluna koymuş olurum.'";
                    break;
                case 4:
                    prompt = "Say this respectfully and professionally, handing over the floor: 'Ahmet Bey, vizyonunuz beni gerçekten etkiledi. Denizlerin sessizliğini yönetmek büyük bir sanat ve ben bu orkestranın şefi olmaya hazırım. Artık çok konuştum, sahneyi asıl sahibine bırakıyorum. Buyurun Ahmet Bey, söz sizde.'";
                    break;
            }

            if (prompt) {
                // Short delay to ensure session is ready
                setTimeout(() => {
                    sessionRef.current?.sendText(prompt);
                    // Update subtitles visually (The prompt text, cleaned up)
                    const cleanText = prompt.match(/'([^']+)'/)?.[1] || "";
                    simulateTyping(cleanText);
                }, 500);
            }
        };

        triggerSpeech();

    }, [state.currentSlide, status]);

    const simulateTyping = (text: string) => {
        let i = 0;
        setSubtitles("");
        const typer = setInterval(() => {
            setSubtitles(text.slice(0, i));
            i++;
            if (i > text.length) clearInterval(typer);
        }, 40);
    };

    // Auto-scroll transcript for Scribe Mode
    useEffect(() => {
        if (state.currentSlide === 5 && transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [state.transcript, state.currentSlide]);

    if (!state.isActive) return null;

    return (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex flex-col pointer-events-none transition-all duration-1000">
            {/* Top Bar (Interactive Controls) */}
            <div className="h-16 flex justify-between items-center px-8 pointer-events-auto bg-gradient-to-b from-black to-transparent border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="text-indigo-500 animate-pulse font-bold tracking-widest flex items-center gap-2">
                        <Activity size={16} /> ADA.PRESENTER
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 border-l border-zinc-800 pl-4">
                        STATUS: <span className={status === 'CONNECTED' ? 'text-emerald-500' : 'text-amber-500'}>{status}</span> | MODE: {state.currentSlide === 5 ? 'LISTENING' : 'BROADCAST'}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsMuted(!isMuted)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all">
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>

                    {state.currentSlide < 4 ? (
                        <button onClick={onNextSlide} className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-xs font-bold transition-all border border-white/10 hover:border-white/30 backdrop-blur-sm group">
                            NEXT SLIDE <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : state.currentSlide === 4 ? (
                        <button onClick={onStartQnA} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-full text-white text-xs font-bold transition-all animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                            <Mic size={14} /> ACTIVATE SCRIBE
                        </button>
                    ) : (
                        <button onClick={onEndMeeting} className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-500 rounded-full text-white text-xs font-bold transition-all border border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                            <FileText size={14} /> CONCLUDE SESSION
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-red-900/30 text-zinc-400 hover:text-red-500 rounded-full transition-all">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Center Stage */}
            <div className="flex-1 flex items-center justify-center p-8 relative">
                
                {/* Visualizer Ring (The "Halo") */}
                {(state.currentSlide >= 1 && state.currentSlide <= 4) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-96 h-96">
                            <div className="absolute inset-0 rounded-full border border-indigo-500/10 animate-[spin_20s_linear_infinite]"></div>
                            <div className="absolute inset-4 rounded-full border border-purple-500/10 animate-[spin_15s_linear_infinite_reverse]"></div>
                            {/* Dynamic Glow based on audio level */}
                            <div 
                                className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[100px] transition-all duration-75"
                                style={{ opacity: Math.max(0.2, audioVis[10] / 100) }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* The "Brain" Graphic */}
                {(state.currentSlide === 1 || state.currentSlide === 3) && (
                    <div className="relative z-10 scale-125 transition-transform duration-1000">
                        <div className="w-64 h-64 rounded-full border-2 border-indigo-500/30 animate-[spin_30s_linear_infinite]"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Brain size={80} className="text-indigo-300 drop-shadow-[0_0_50px_rgba(99,102,241,0.8)]" />
                        </div>
                    </div>
                )}
                
                {/* Scribe Mode Visuals: Live Transcription Log */}
                {state.currentSlide === 5 && (
                    <div className="flex flex-row items-stretch gap-8 w-full max-w-6xl h-[60vh] animate-in fade-in zoom-in duration-500 z-20">
                        {/* Left: Status & Visualizer */}
                        <div className="w-1/3 flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-emerald-500/20 p-8 shadow-2xl">
                            <div className="w-40 h-40 rounded-full border-4 border-emerald-500/30 flex items-center justify-center bg-black/50 mb-8 relative">
                                <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 animate-spin"></div>
                                <Mic size={48} className="text-emerald-500" />
                            </div>
                            <div className="text-emerald-400 font-mono text-sm tracking-widest bg-emerald-900/20 px-6 py-2 rounded-full border border-emerald-500/20 animate-pulse mb-6">
                                LIVE TRANSCRIPTION
                            </div>
                            <div className="text-xs text-zinc-500 font-mono text-center space-y-2">
                                <p>Processing Audio Stream...</p>
                                <p className="text-zinc-400">Analyzing Intent...</p>
                                <p className="text-emerald-600">Extracting Commitments...</p>
                            </div>
                        </div>

                        {/* Right: The Transcript Terminal */}
                        <div className="flex-1 bg-black/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-8 font-mono text-sm relative overflow-hidden flex flex-col shadow-2xl">
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                                <div className="flex items-center gap-3 text-zinc-300">
                                    <Terminal size={16} className="text-indigo-500" />
                                    <span className="text-xs uppercase tracking-widest font-bold">Meeting Ledger</span>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="text-[10px] text-red-500 font-bold">REC</span>
                                </div>
                            </div>
                            
                            <div 
                                ref={transcriptRef}
                                className="flex-1 overflow-y-auto space-y-3 pr-2 text-zinc-300 custom-scrollbar"
                            >
                                {state.transcript ? (
                                    state.transcript.split('\n').map((line, i) => (
                                        <div key={i} className="animate-in slide-in-from-left-2 fade-in duration-300 leading-relaxed">
                                            <span className="text-emerald-500 mr-3 font-bold">{'>'}</span>
                                            {line}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-zinc-600 italic mt-10 text-center">Waiting for voice input...</div>
                                )}
                                {/* Blinking Cursor at the end */}
                                <div className="w-2 h-4 bg-emerald-500 animate-pulse mt-2 inline-block"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom: Subtitles & Visualizer */}
            <div className="h-64 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end pb-16 px-12 pointer-events-auto">
                <div className="max-w-5xl mx-auto w-full text-center">
                    
                    {/* Visualizer Bars (Only visible when speaking/listening) */}
                    <div className="flex justify-center items-end gap-1.5 h-16 mb-8 opacity-80">
                        {audioVis.map((h, i) => (
                            <div 
                                key={i} 
                                className={`w-2.5 rounded-t-full transition-all duration-75 ${state.currentSlide === 5 ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                                style={{ height: `${Math.max(15, h)}%` }}
                            ></div>
                        ))}
                    </div>

                    {/* Dynamic Subtitles */}
                    {subtitles && (
                        <h1 className="text-3xl md:text-4xl font-display font-medium text-white leading-relaxed tracking-wide text-shadow-glow italic animate-in fade-in slide-in-from-bottom-2">
                            "{subtitles}"
                        </h1>
                    )}
                    
                    {state.currentSlide === 4 && (
                        <div className="mt-6 text-emerald-400 font-mono text-sm animate-pulse tracking-widest uppercase">
                            LISTENING FOR QUESTIONS...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
