
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { UserProfile } from "../types";

export type LiveSessionMode = 'RADIO' | 'PRESENTER';

/**
 * Pure Client-Side Live Session
 * Connects directly to Google Gemini Multimodal Live API via WebSockets.
 * No Python Backend required.
 */
export class LiveSession {
  private client: GoogleGenAI;
  private session: any = null;
  private audioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  public onStatusChange: ((status: string) => void) | null = null;
  public onAudioLevel: ((level: number) => void) | null = null;
  public onTurnComplete: ((userText: string, modelText: string) => void) | null = null;
  
  // Audio Queue Management
  private nextStartTime = 0;
  private isConnected = false;
  
  // Buffers for seamless playback
  private audioQueue: AudioBuffer[] = [];
  private isPlaying = false;

  private currentInputTranscription = '';
  private currentOutputTranscription = '';

  constructor() {
    this.client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Initializes AudioContext ensuring it is active (not suspended).
   */
  private async ensureAudioContext() {
      if (!this.audioContext) {
          // Use standard AudioContext
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
      }
  }

  async connect(userProfile: UserProfile, mode: LiveSessionMode = 'RADIO') {
    try {
      await this.ensureAudioContext();
      
      this.onStatusChange?.('connecting');
      this.isConnected = false;
      this.nextStartTime = this.audioContext!.currentTime + 0.1;
      this.audioQueue = [];

      // --- SYSTEM INSTRUCTION ---
      let instruction = "SYSTEM: You are ADA, the AI Operator of West Istanbul Marina (WIM). ";
      instruction += "LANGUAGE: Speak ONLY Turkish (Istanbul accent). ";
      instruction += "TONE: Professional, calm, concise. Like a maritime radio operator. ";
      instruction += "RULES: Keep responses short. End transmissions with 'Tamam' (Over). ";
      
      if (mode === 'RADIO') {
          instruction += "CONTEXT: You are on VHF Channel 72. You manage traffic, docking, and fuel requests. ";
          instruction += `USER: Captain of ${userProfile.name || 'Unknown Vessel'}. `;
      }

      const sessionPromise = this.client.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
           responseModalities: [Modality.AUDIO], // Audio-to-Audio
           systemInstruction: { parts: [{ text: instruction }] },
           speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } // 'Kore' has a good neutral tone
           },
        },
        callbacks: {
            onopen: async () => {
                this.isConnected = true;
                this.onStatusChange?.('connected');
                // Start capturing microphone
                this.startMicrophone(sessionPromise);
            },
            onmessage: async (msg: LiveServerMessage) => {
                await this.handleMessage(msg);
            },
            onerror: (e: any) => {
                console.error("Live API Error:", e);
                this.onStatusChange?.('error');
                this.disconnect();
            },
            onclose: () => {
                this.onStatusChange?.('disconnected');
                this.disconnect();
            }
        }
      });

      this.session = await sessionPromise;

    } catch (e) {
      console.error("Connection failed:", e);
      this.onStatusChange?.('error');
    }
  }

  private async handleMessage(msg: LiveServerMessage) {
      // 1. Audio Output (The Voice)
      const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        if (this.audioContext?.state === 'suspended') await this.audioContext.resume();
        const buffer = await this.base64ToAudioBuffer(audioData);
        this.scheduleBuffer(buffer);
      }
      
      // 2. Transcription (Optional, for UI logs)
      if (msg.serverContent?.inputTranscription) {
          this.currentInputTranscription += msg.serverContent.inputTranscription.text;
      }
      if (msg.serverContent?.outputTranscription) {
          this.currentOutputTranscription += msg.serverContent.outputTranscription.text;
      }

      if (msg.serverContent?.turnComplete) {
        if (this.onTurnComplete) {
            this.onTurnComplete(this.currentInputTranscription.trim(), this.currentOutputTranscription.trim());
        }
        this.currentInputTranscription = '';
        this.currentOutputTranscription = '';
      }
  }

  private scheduleBuffer(buffer: AudioBuffer) {
      if (!this.audioContext) return;

      // Calculate visualization level
      const rawData = buffer.getChannelData(0);
      let sum = 0;
      for(let i=0; i<rawData.length; i+=50) sum += Math.abs(rawData[i]);
      const avg = sum / (rawData.length/50);
      this.onAudioLevel?.(avg * 10); // Amplify for UI

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);

      // Playback scheduling to prevent gaps
      const currentTime = this.audioContext.currentTime;
      if (this.nextStartTime < currentTime) {
          this.nextStartTime = currentTime + 0.05; 
      }
      source.start(this.nextStartTime);
      this.nextStartTime += buffer.duration;
  }

  private async base64ToAudioBuffer(base64Str: string): Promise<AudioBuffer> {
     // Gemini sends 24kHz PCM 16-bit Little Endian
     const binaryString = atob(base64Str);
     const len = binaryString.length;
     const bytes = new Uint8Array(len);
     for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
     }
     
     const view = new DataView(bytes.buffer);
     const float32 = new Float32Array(len / 2);
     
     for (let i = 0; i < len; i += 2) {
         const sample = view.getInt16(i, true);
         float32[i / 2] = sample / 32768.0;
     }

     const buffer = this.audioContext!.createBuffer(1, float32.length, 24000); 
     buffer.getChannelData(0).set(float32);
     return buffer;
  }

  private async startMicrophone(sessionPromise: Promise<any>) {
     if (!this.audioContext) return;

     try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true
        }});
        
        this.inputSource = this.audioContext.createMediaStreamSource(stream);
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
        
        this.processor.onaudioprocess = (e) => {
            if (!this.isConnected) return;

            const inputData = e.inputBuffer.getChannelData(0);
            
            // Send mic level to UI
            let sum = 0;
            for(let i=0; i<inputData.length; i+=100) sum += Math.abs(inputData[i]);
            const avg = sum / (inputData.length/100);
            this.onAudioLevel?.(avg * 5);

            // Convert Float32 to Int16 PCM Base64
            const b64Data = this.float32To16BitPCM(inputData);
            
            sessionPromise.then(session => {
                session.sendRealtimeInput({ 
                    media: { mimeType: 'audio/pcm;rate=16000', data: b64Data }
                });
            });
        };

        this.inputSource.connect(this.processor);
        this.processor.connect(this.audioContext.destination); // Required for script processor to run

     } catch (err) {
        console.error("Microphone denied:", err);
        this.onStatusChange?.('error');
     }
  }
  
  private float32To16BitPCM(data: Float32Array): string {
      const int16 = new Int16Array(data.length);
      for (let i = 0; i < data.length; i++) {
        let val = Math.max(-1, Math.min(1, data[i]));
        int16[i] = val < 0 ? val * 32768 : val * 32767;
      }
      const bytes = new Uint8Array(int16.buffer);
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
  }

  disconnect() {
    this.isConnected = false;
    
    if (this.session) {
        // Just close it, don't await potentially hung promises
        try { this.session.close(); } catch {}
    }
    
    if (this.inputSource) {
        this.inputSource.disconnect();
        this.inputSource = null;
    }
    
    if (this.processor) {
        this.processor.disconnect();
        this.processor = null;
    }
    
    // Suspend context to stop processing but keep it ready for next time
    this.audioContext?.suspend();
    
    this.onStatusChange?.('disconnected');
    this.session = null;
  }
}
