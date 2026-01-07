
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Tool } from "@google/genai";
import { UserProfile, TenantConfig } from '../../types';
import { getVoiceSystemInstruction } from '../ai/voicePrompts';

export class LiveSession {
    private ai: GoogleGenAI | null = null;
    private sessionPromise?: Promise<any>;
    private inputAudioContext?: AudioContext;
    private outputAudioContext?: AudioContext;
    private scriptProcessor?: ScriptProcessorNode;
    private outputAnalyser?: AnalyserNode;
    private microphoneStream?: MediaStream;
    private volumeInterval?: any;

    private nextStartTime = 0;
    private sources = new Set<AudioBufferSourceNode>();

    private currentInputTranscription = '';
    private currentOutputTranscription = '';

    public onStatusChange: ((state: string) => void) | null = null;
    public onAudioLevel: ((level: number) => void) | null = null;
    public onTurnComplete: ((userText: string, modelText: string) => void) | null = null;
    public onToolCall: ((functionCalls: any[]) => Promise<any[]>) | null = null;

    constructor() {}

    private setStatus(state: string) {
        if (this.onStatusChange) this.onStatusChange(state);
    }
    
    public async connect(userProfile: UserProfile, tenantConfig: TenantConfig, tools?: Tool[]) {
        if (this.sessionPromise) return;
        this.setStatus('connecting');

        try {
            const apiKey = process.env.API_KEY || '';
            this.ai = new GoogleGenAI({ apiKey });

            this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            this.outputAnalyser = this.outputAudioContext.createAnalyser();
            this.outputAnalyser.fftSize = 256;
            this.outputAnalyser.connect(this.outputAudioContext.destination);

            this.microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const systemInstruction = getVoiceSystemInstruction(userProfile, tenantConfig);

            this.sessionPromise = this.ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { 
                        voiceConfig: { 
                            prebuiltVoiceConfig: { voiceName: 'Kore' } 
                        } 
                    },
                    systemInstruction: systemInstruction,
                    tools: tools, 
                    inputAudioTranscription: {}, 
                    outputAudioTranscription: {} 
                },
                callbacks: {
                    onopen: () => this.handleSessionOpen(),
                    onmessage: (message: LiveServerMessage) => this.handleSessionMessage(message),
                    onerror: (e: any) => this.handleSessionError(e),
                    onclose: (e: CloseEvent) => this.handleSessionClose(e),
                }
            });
        } catch (error: any) {
            this.setStatus('error');
            this.disconnect();
        }
    }

    public disconnect() {
        if (this.volumeInterval) clearInterval(this.volumeInterval);
        if (this.sessionPromise) {
            this.sessionPromise.then(session => session.close()).catch(() => {});
            this.sessionPromise = undefined;
        }
        this.scriptProcessor?.disconnect();
        this.microphoneStream?.getTracks().forEach(track => track.stop());
        if (this.inputAudioContext && this.inputAudioContext.state !== 'closed') {
            this.inputAudioContext.close().catch(() => {});
        }
        if (this.outputAudioContext && this.outputAudioContext.state !== 'closed') {
            this.outputAudioContext.close().catch(() => {});
        }
        this.sources.forEach(s => { try { s.stop(); } catch(e) {} });
        this.sources.clear();
        this.setStatus('disconnected');
    }

    private handleSessionOpen() {
        this.setStatus('connected');
        if (!this.inputAudioContext || !this.microphoneStream) return;
        const source = this.inputAudioContext.createMediaStreamSource(this.microphoneStream);
        this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
        let inputLevel = 0;
        this.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            let sum = 0.0;
            for (let i = 0; i < inputData.length; ++i) sum += inputData[i] * inputData[i];
            inputLevel = Math.sqrt(sum / inputData.length);
            const pcmBlob = this.createBlob(inputData);
            this.sessionPromise?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
            });
        };
        source.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.inputAudioContext.destination);

        this.volumeInterval = setInterval(() => {
            let outputLevel = 0;
            if (this.outputAnalyser) {
                const dataArray = new Uint8Array(this.outputAnalyser.frequencyBinCount);
                this.outputAnalyser.getByteFrequencyData(dataArray);
                outputLevel = (dataArray.reduce((a, b) => a + b) / dataArray.length) / 255; 
            }
            if (this.onAudioLevel) this.onAudioLevel(Math.min(Math.max(inputLevel * 5, outputLevel * 2), 1));
        }, 50);
    }
    
    private async handleSessionMessage(message: LiveServerMessage) {
        if (message.serverContent?.outputTranscription) this.currentOutputTranscription += message.serverContent.outputTranscription.text;
        else if (message.serverContent?.inputTranscription) this.currentInputTranscription += message.serverContent.inputTranscription.text;

        if (message.serverContent?.turnComplete) {
            if (this.onTurnComplete) this.onTurnComplete(this.currentInputTranscription, this.currentOutputTranscription);
            this.currentInputTranscription = '';
            this.currentOutputTranscription = '';
        }

        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio && this.outputAudioContext) {
            this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
            try {
                const audioBuffer = await this.decodeAudioData(this.decode(base64Audio));
                const source = this.outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(this.outputAnalyser || this.outputAudioContext.destination);
                source.addEventListener('ended', () => this.sources.delete(source));
                source.start(this.nextStartTime);
                this.nextStartTime += audioBuffer.duration;
                this.sources.add(source);
            } catch (e) {}
        }
    }

    private handleSessionError(e: any) { this.setStatus('error'); this.disconnect(); }
    private handleSessionClose(e: CloseEvent) { this.setStatus('disconnected'); this.disconnect(); }

    private createBlob(data: Float32Array): Blob {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            const s = Math.max(-1, Math.min(1, data[i]));
            int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return { data: this.encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
    }

    private encode(bytes: Uint8Array): string {
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    }

    private decode(base64: string): Uint8Array {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        return bytes;
    }

    private async decodeAudioData(data: Uint8Array): Promise<AudioBuffer> {
        if (!this.outputAudioContext) throw new Error("Audio context error");
        const dataInt16 = new Int16Array(data.buffer);
        const buffer = this.outputAudioContext.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
        return buffer;
    }
}
