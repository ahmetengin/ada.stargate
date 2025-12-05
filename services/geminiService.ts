
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { Message, ModelType, GroundingSource, RegistryEntry, Tender, UserProfile, TenantConfig, MessageRole } from "../types";
import { generateBaseSystemInstruction, generateContextBlock } from "./prompts";
import { handleGeminiError, formatHistory } from "./geminiUtils";

const createClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// COST OPTIMIZATION: Max history length to send to API
export const MAX_HISTORY_LENGTH = 10; 

// @FIX: Implemented streamChatResponse with the correct signature to match the call in App.tsx.
export const streamChatResponse = async (
  messages: Message[],
  modelType: ModelType,
  useSearch: boolean,
  _useVision: boolean, // Not used, but keeping for signature match
  registry: RegistryEntry[],
  tenders: Tender[],
  userProfile: UserProfile,
  vesselsInPort: number,
  tenantConfig: TenantConfig,
  onChunk: (chunk: string, grounding?: GroundingSource[]) => void
) => {
  try {
    const ai = createClient();
    const modelName = modelType === ModelType.Pro ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
    
    const systemInstruction = generateBaseSystemInstruction(tenantConfig);
    const contextBlock = generateContextBlock(registry, tenders, userProfile, vesselsInPort);
    const history = formatHistory(messages);

    const lastMessage = history.pop();
    if (!lastMessage) return;

    // Inject live context into the last user message
    lastMessage.parts.unshift({ text: contextBlock });

    const contents = [...history, lastMessage];

    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: useSearch ? [{ googleSearch: {} }] : undefined,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
      let sources: GroundingSource[] = [];

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
    onChunk("Sorry, I encountered an error while processing your request.");
  }
};

// @FIX: Implemented and exported generateSimpleResponse, which was missing.
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
    // Executive agent tasks are complex and benefit from the Pro model
    const modelName = 'gemini-3-pro-preview';
    const systemInstruction = generateBaseSystemInstruction(tenantConfig);
    
    const fullMessages: Message[] = [...messages, {id: 'current', role: MessageRole.User, text: prompt, timestamp: Date.now()}];
    const history = formatHistory(fullMessages);
    const contextBlock = generateContextBlock(registry, tenders, userProfile, vesselsInPort);
    
    const lastMessage = history.pop();
    if (!lastMessage) return "Error: No message to process.";
    
    lastMessage.parts.unshift({ text: contextBlock });
    const contents = [...history, lastMessage];

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
                systemInstruction,
            },
        });
        return response.text ?? "No response text was generated.";
    } catch (error) {
        handleGeminiError(error);
        return "An error occurred while generating the response.";
    }
};

// @FIX: Implemented and exported generateSpeech, which was missing.
export const generateSpeech = async (text: string): Promise<string | null> => {
    const ai = createClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say with a calm, professional tone: ${text}` }] }],
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
        console.error("Speech generation failed:", error);
        handleGeminiError(error);
        return null;
    }
};
