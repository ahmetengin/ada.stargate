
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { UserProfile } from '../types';
import { getVoiceSystemInstruction } from './voicePrompts'; // Import the new prompt generator
import { TENANT_CONFIG } from './config'; // Import active tenant config

export class LiveSession {
    private ai?: GoogleGenAI;
    private sessionPromise?: Promise<any>;
    private inputAudioContext?: AudioContext;
    private outputAudioContext?: AudioContext;
    private scriptProcessor?: ScriptProcessorNode;
    private microphoneStream?: MediaStream;

    private nextStartTime = 0;
    private sources = new Set<AudioBufferSourceNode>();

    private currentInputTranscription = '';
    private currentOutputTranscription = '';

    public onStatusChange: ((state: string) => void) | null = null;
    public onAudioLevel: ((level: number) => void) | null = null;
    public onTurnComplete: ((userText: string, modelText: string) => void) | null = null;

    constructor() {
        if (process.env.API_KEY) {
            this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
    }

    private setStatus(state: string) {
        if (this.onStatusChange) this.onStatusChange(state);
    }
    
    public async connect(userProfile: UserProfile) {
        if (!this.ai) {
            console.error("Gemini API key not configured.");
            this.setStatus('error');
            return;
        }
        if (this.sessionPromise) return;
        this.setStatus('connecting');

        try {
            this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            this.microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Generate the dynamic system instruction (The Persona)
            const systemInstruction = getVoiceSystemInstruction(userProfile, TENANT_CONFIG);

            this.sessionPromise = this.ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { 
                        voiceConfig: { 
                            prebuiltVoiceConfig: { 
                                // Voice options: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
                                // 'Kore' is usually calm and feminine, good for Ada.
                                // 'Fenrir' is deeper, more masculine (good for a rugged captain persona).
                                voiceName: 'Kore' 
                            } 
                        } 
                    },
                    systemInstruction: systemInstruction, // Inject the prompt here
                    inputAudioTranscription: {},
                    outputAudioTranscription: {}
                },
                callbacks: {
                    onopen: () => this.handleSessionOpen(),
                    onmessage: (message: LiveServerMessage) => this.handleSessionMessage(message),
                    onerror: (e: ErrorEvent) => this.handleSessionError(e),
                    onclose: (e: CloseEvent) => this.handleSessionClose(e),
                }
            });
        } catch (error) {
            console.error("Failed to connect live session or get user media:", error);
            this.setStatus('error');
            this.disconnect();
        }
    }

    public disconnect() {
        this.sessionPromise?.then(session => session.close()).catch((e) => { console.error("Error closing session:", e); });
        this.sessionPromise = undefined;
        this.scriptProcessor?.disconnect();
        this.scriptProcessor = undefined;
        this.microphoneStream?.getTracks().forEach(track => track.stop());
        this.microphoneStream = undefined;

        if (this.inputAudioContext && this.inputAudioContext.state !== 'closed') {
            this.inputAudioContext.close().catch((e) => { console.error("Error closing input audio context:", e); });
        }
        this.inputAudioContext = undefined;

        if (this.outputAudioContext && this.outputAudioContext.state !== 'closed') {
            this.outputAudioContext.close().catch((e) => { console.error("Error closing output audio context:", e); });
        }
        this.outputAudioContext = undefined;
        
        this.sources.forEach(s => s.stop());
        this.sources.clear();
        this.setStatus('disconnected');
    }

    private handleSessionOpen() {
        this.setStatus('connected');
        const source = this.inputAudioContext!.createMediaStreamSource(this.microphoneStream!);
        this.scriptProcessor = this.inputAudioContext!.createScriptProcessor(4096, 1, 1);

        this.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            
            // Audio Level Calculation (RMS)
            let sum = 0.0;
            for (let i = 0; i < inputData.length; ++i) sum += inputData[i] * inputData[i];
            const rms = Math.sqrt(sum / inputData.length);
            
            // Normalize slightly for visualizer sensitivity (boost low signals)
            const normalizedLevel = Math.min(rms * 5, 1); 
            if (this.onAudioLevel) this.onAudioLevel(normalizedLevel);

            // CONTINUOUS STREAMING (Hands-Free)
            const pcmBlob = this.createBlob(inputData);
            this.sessionPromise?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
            });
        };

        source.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.inputAudioContext!.destination);
    }
    
    private async handleSessionMessage(message: LiveServerMessage) {
        if (message.serverContent?.outputTranscription) {
            this.currentOutputTranscription += message.serverContent.outputTranscription.text;
        } else if (message.serverContent?.inputTranscription) {
            this.currentInputTranscription += message.serverContent.inputTranscription.text;
        }

        if (message.serverContent?.turnComplete) {
            if (this.onTurnComplete && (this.currentInputTranscription || this.currentOutputTranscription)) {
                this.onTurnComplete(this.currentInputTranscription, this.currentOutputTranscription);
            }
            this.currentInputTranscription = '';
            this.currentOutputTranscription = '';
        }

        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio) {
            this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext!.currentTime);
            const audioBuffer = await this.decodeAudioData(this.decode(base64Audio));
            const source = this.outputAudioContext!.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.outputAudioContext!.destination);
            source.addEventListener('ended', () => this.sources.delete(source));
            source.start(this.nextStartTime);
            this.nextStartTime += audioBuffer.duration;
            this.sources.add(source);
        }

        if (message.serverContent?.interrupted) {
            for (const source of this.sources.values()) source.stop();
            this.sources.clear();
            this.nextStartTime = 0;
        }
    }

    private handleSessionError(e: ErrorEvent) {
        console.error("Live session error:", e);
        this.setStatus('error');
        this.disconnect();
    }

    private handleSessionClose(e: CloseEvent) {
        this.setStatus('disconnected');
        this.disconnect();
    }

    private createBlob(data: Float32Array): Blob {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
        return { data: this.encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
    }

    private encode = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));
    private decode = (base64: string): Uint8Array => Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    private async decodeAudioData(data: Uint8Array): Promise<AudioBuffer> {
        const dataInt16 = new Int16Array(data.buffer);
        const frameCount = dataInt16.length;
        const buffer = this.outputAudioContext!.createBuffer(1, frameCount, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i] / 32768.0;
        return buffer;
    }
}
