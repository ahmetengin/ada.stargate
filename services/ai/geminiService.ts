
import { GoogleGenAI, Modality } from "@google/genai";
import { Message, ModelType, RegistryEntry, Tender, UserProfile, TenantConfig } from "../../types";
import { generateBaseSystemInstruction, generateContextBlock } from "./prompts";
import { handleGeminiError, formatHistory } from "./geminiUtils";

const createClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });
export const MAX_HISTORY_LENGTH = 10; 

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
  onChunk: (chunk: string) => void
) => {
  try {
    const ai = createClient();
    const modelName = modelType === ModelType.Pro ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    
    const systemInstruction = generateBaseSystemInstruction(tenantConfig);
    const contextBlock = generateContextBlock(userProfile, { vessels: vesselsInPort, tenders: tenders.length });
    
    const history = formatHistory(messages.slice(-MAX_HISTORY_LENGTH));
    const lastMessage = history.pop();
    if (!lastMessage) return;

    lastMessage.parts.unshift({ text: contextBlock });
    const contents = [...history, lastMessage];

    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: useSearch ? [{ googleSearch: {} }] : undefined,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) onChunk(chunk.text);
    }
  } catch (error) {
    handleGeminiError(error);
    onChunk("⚠️ Bilişsel bağlantı hatası.");
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
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (error) {
        console.error("Speech error:", error);
        return null;
    }
};
