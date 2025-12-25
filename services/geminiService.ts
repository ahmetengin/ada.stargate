
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { Message, ModelType, GroundingSource, RegistryEntry, Tender, UserProfile, TenantConfig, MessageRole } from "../types";
import { generateBaseSystemInstruction, generateContextBlock } from "./prompts";
import { handleGeminiError, formatHistory } from "./geminiUtils";

const createClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// COST OPTIMIZATION: Max history length to send to API
export const MAX_HISTORY_LENGTH = 10; 

/**
 * Handles real-time streaming from Gemini with Search Grounding support.
 * Injected context ensures Ada remembers users (e.g. Ahmet Engin, Kpt. Barbaros).
 */
export const streamChatResponse = async (
  messages: Message[],
  modelType: ModelType,
  useSearch: boolean,
  _useVision: boolean, 
  registry: RegistryEntry[],
  tenders: Tender[],
  userProfile: UserProfile,
  vesselsInPort: number,
  tenantConfig: TenantConfig,
  onChunk: (chunk: string, grounding?: GroundingSource[]) => void
) => {
  try {
    const ai = createClient();
    // Using gemini-3-flash-preview for standard tasks and gemini-3-pro-preview for complex reasoning
    const modelName = modelType === ModelType.Pro ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    
    const systemInstruction = generateBaseSystemInstruction(tenantConfig);
    const contextBlock = generateContextBlock(userProfile, { vessels: vesselsInPort, tenders: tenders.length });
    
    // Format history and limit length for token efficiency
    const history = formatHistory(messages.slice(-MAX_HISTORY_LENGTH));

    const lastMessage = history.pop();
    if (!lastMessage) return;

    // INJECT RAG CONTEXT: We place the live operational context into the latest message
    // so the model is always aware of the user's specific state and history.
    lastMessage.parts.unshift({ text: contextBlock });

    const contents = [...history, lastMessage];

    const config: any = {
      systemInstruction: systemInstruction,
      tools: useSearch ? [{ googleSearch: {} }] : undefined,
    };

    // Add Thinking Config only for 2.5 and 3 series models
    if (modelType === ModelType.Pro) {
       config.thinkingConfig = { thinkingBudget: 1024 }; // Enable moderate thinking for Pro
    }

    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents: contents,
      config: config
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
      let sources: GroundingSource[] = [];

      // Extract Grounding Sources (Search Results)
      if (groundingMetadata?.groundingChunks) {
        sources = groundingMetadata.groundingChunks
          .filter((c: any) => c.web)
          .map((c: any) => ({ uri: c.web.uri, title: c.web.title }));
      }
      
      if (text) {
        onChunk(text, sources.length > 0 ? sources : undefined);
      }
    }
  } catch (error) {
    handleGeminiError(error);
    onChunk("⚠️ Bilişsel bağlantı hatası. Lütfen tekrar deneyin.");
  }
};

export const generateSimpleResponse = async (
    prompt: string,
    userProfile: UserProfile,
    messages: Message[],
    registry: RegistryEntry[],
    vesselsInPort: number,
    tenders: Tender[],
    tenantConfig: TenantConfig
): Promise<string> => {
    const ai = createClient();
    // Default to the most capable model for internal reasoning tasks
    const modelName = 'gemini-3-pro-preview';
    const systemInstruction = generateBaseSystemInstruction(tenantConfig);
    
    const contextBlock = generateContextBlock(userProfile, { vessels: vesselsInPort, tenders: tenders.length });
    const history = formatHistory(messages);
    
    const contents = [...history, { role: 'user', parts: [{ text: contextBlock }, { text: prompt }] }];

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: { 
                systemInstruction,
                thinkingConfig: { thinkingBudget: 1024 } 
            },
        });
        return response.text ?? "Yanıt üretilemedi.";
    } catch (error) {
        handleGeminiError(error);
        return "Bir hata oluştu.";
    }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
    const ai = createClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Profesyonel bir sesle söyle: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Ses sentezleme hatası:", error);
        return null;
    }
};
