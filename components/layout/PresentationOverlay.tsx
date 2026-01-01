
import React, { useEffect, useState, useRef } from 'react';
import { Activity, X, FileText, Terminal, Volume2, VolumeX, CheckCircle2, Download, Mail, PieChart, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PresentationState, UserProfile, TenantConfig } from '../../types';
import { generateSpeech } from '../../services/geminiService';
import { LiveSession } from '../../services/liveService';
import { executiveExpert } from '../../services/agents/executiveExpert'; 
import { introNarrative } from '../../services/presenterContent';

interface PresentationOverlayProps {
    state: PresentationState;
    userProfile: UserProfile;
    onClose: () => void;
    onStartMeeting: () => void;
    onEndMeeting: () => void;
    onScribeInput: (text: string) => void;
    onStateChange: React.Dispatch<React.SetStateAction<PresentationState>>;
    activeTenantConfig: TenantConfig;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

export const PresentationOverlay: React.FC<PresentationOverlayProps> = ({ state, userProfile, onClose, onStartMeeting, onEndMeeting, onStateChange, activeTenantConfig }) => {
    const [subtitles, setSubtitles] = useState<string>("");
    const [audioVis, setAudioVis] = useState<number[]>(new Array(30).fill(5));
    const [isMuted, setIsMuted] = useState(false);
    const [status, setStatus] = useState("OFFLINE");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const transcriptRef = useRef<HTMLDivElement>(null);
    const sessionRef = useRef<LiveSession | null>(null);
    const [emailStatus, setEmailStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');
    const [contentMode, setContentMode] = useState<'INTRO' | 'ROI'>('INTRO'); 
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const [narrativeStep, setNarrativeStep] = useState(0);

    const activeNarrative = introNarrative.filter(line => 
        contentMode === 'INTRO' ? line.id === 'intro_01' : line.id === 'roi_sequence'
    );

    useEffect(() => {
        if (state.isActive) {
            if (!audioContextRef.current) {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 64;
                gainNodeRef.current = audioContextRef.current.createGain();
                gainNodeRef.current.connect(analyserRef.current);
                analyserRef.current.connect(audioContextRef.current.destination);
            }
            setStatus("CONNECTED");
            const dataArray = new Uint8Array(analyserRef.current!.frequencyBinCount);
            const draw = () => {
                if(analyserRef.current) {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    setAudioVis(Array.from(dataArray).slice(0, 30).map(v => (v / 255) * 80 + 5));
                }
                animationFrameRef.current = requestAnimationFrame(draw);
            };
            draw();
        } else {
            setStatus("OFFLINE");
            sessionRef.current?.disconnect();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
            if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
        }
    }, [state.isActive]);
    
    useEffect(() => {
        if (state.slide === 'intro' && !isSpeaking && narrativeStep < activeNarrative.length && status === 'CONNECTED') {
            const speakNext = async () => {
                setIsSpeaking(true);
                const narrativeLine = activeNarrative[narrativeStep];
                setSubtitles(narrativeLine.text);
                const base64Audio = await generateSpeech(narrativeLine.text);
                if (base64Audio && audioContextRef.current && gainNodeRef.current) {
                    const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
                    const source = audioContextRef.current.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(gainNodeRef.current);
                    source.start(0);
                    source.onended = () => { setIsSpeaking(false); setNarrativeStep(prev => prev + 1); };
                } else {
                    setTimeout(() => { setIsSpeaking(false); setNarrativeStep(prev => prev + 1); }, 3000);
                }
            };
            const timer = setTimeout(speakNext, narrativeStep === 0 ? 800 : 1500);
            return () => clearTimeout(timer);
        }
    }, [narrativeStep, isSpeaking, status, state.slide, activeNarrative]);

    const handleSendEmail = async () => {
        if (!state.analysisResults) return;
        setEmailStatus('SENDING');
        await executiveExpert.sendProposalEmail("theahmetengin@gmail.com", "WIM - Proposal", state.analysisResults.proposal, () => {});
        setEmailStatus('SENT');
        setTimeout(() => setEmailStatus('IDLE'), 3000);
    };

    return (
        <div className="fixed inset-0 z-[300] bg-black text-white font-mono overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-20 flex justify-between items-center px-8 z-50 bg-gradient-to-b from-black to-transparent">
                <div className="flex items-center gap-2 text-cyan-400">
                    <Activity className="animate-pulse" size={20} />
                    <span className="text-lg font-black tracking-[0.2em]">ADA.OS</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setContentMode(prev => prev === 'INTRO' ? 'ROI' : 'INTRO')} className="px-4 py-2 rounded-full text-[10px] font-bold border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2">
                        <PieChart size={14} /> {contentMode === 'INTRO' ? 'ROI ANALİZİ' : 'VİZYON'}
                    </button>
                    <button onClick={onClose} className="p-3 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 rounded-full transition-all"><X size={20} /></button>
                </div>
            </div>

            {state.slide === 'intro' && (
                <div className="absolute bottom-0 left-0 right-0 h-64 flex flex-col justify-end pb-12 items-center">
                    <div className="flex items-end gap-1 h-12 mb-6 opacity-60">
                        {audioVis.map((h, i) => (<div key={i} className="w-2 bg-cyan-400 rounded-t-full" style={{ height: `${h}%` }}></div>))}
                    </div>
                    <div className="bg-black/40 backdrop-blur-sm p-6 rounded-2xl max-w-4xl mx-4 border border-white/5 italic text-center text-xl font-light">"{subtitles}"</div>
                </div>
            )}

            {state.slide === 'analysis' && (
                <div className="p-24 pt-32 h-full overflow-y-auto">
                    <div className="max-w-6xl mx-auto grid grid-cols-2 gap-12">
                        <div><h3 className="text-cyan-400 font-bold mb-4">Minutes</h3><ReactMarkdown>{state.analysisResults?.minutes || ""}</ReactMarkdown></div>
                        <div><h3 className="text-amber-400 font-bold mb-4">Proposal</h3><ReactMarkdown>{state.analysisResults?.proposal || ""}</ReactMarkdown></div>
                    </div>
                    <div className="fixed bottom-12 right-12 flex gap-4">
                        <button onClick={handleSendEmail} className="px-8 py-3 bg-indigo-600 rounded-full font-bold flex items-center gap-2">
                            {emailStatus === 'SENDING' ? <Activity className="animate-spin" size={16}/> : <Mail size={16}/>} {emailStatus === 'SENT' ? 'GÖNDERİLDİ' : 'TEKLİFİ GÖNDER'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
