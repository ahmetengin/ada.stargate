
import { AgentTraceLog, NodeName, AgentAction } from '../../types';
import { generateSimpleResponse } from '../geminiService'; // Reusing the Gemini connection
import { MOCK_USER_DATABASE } from '../../App'; // Import user DB or pass as needed, for now utilizing context

const createLog = (node: NodeName, step: AgentTraceLog['step'], content: string, persona: 'ORCHESTRATOR' | 'EXPERT' | 'WORKER' = 'ORCHESTRATOR'): AgentTraceLog => ({
    id: `trace_exec_${Date.now()}_${Math.random()}`,
    timestamp: new Date().toLocaleTimeString(),
    node,
    step,
    content,
    persona
});

export const executiveExpert = {
    
    // Skill: Analyze Meeting Transcript & Generate Documents
    analyzeMeeting: async (transcript: string, clientName: string, addTrace: (t: AgentTraceLog) => void): Promise<{ minutes: string, proposal: string }> => {
        
        addTrace(createLog('ada.executive', 'THINKING', `Processing ${transcript.length} characters of meeting context. Initializing Gemini 1.5 Pro...`, 'EXPERT'));

        const prompt = `
        You are Ada, the Executive Partner and AI Chief of Staff for West Istanbul Marina.
        You have just listened to a strategic meeting between the General Manager (Ahmet Engin) and a client named ${clientName}.
        
        FULL TRANSCRIPT:
        "${transcript}"
        
        YOUR MISSION:
        1. **Meeting Minutes (Toplantı Tutanağı):** Summarize key discussion points, decisions made, and action items. Be formal and precise, using Markdown for formatting.
        2. **Final Proposal (Teklif):** Draft a formal email/proposal to ${clientName} reflecting exactly what was negotiated. Include pricing if mentioned, or standard rates if not. If a discount was promised, include it. Use Markdown for formatting.
        
        OUTPUT FORMAT:
        Return a JSON object with two fields: "minutes" (Markdown string) and "proposal" (Markdown string for Email).
        `;

        // In a real application, this would call generateSimpleResponse with a higher-context model like Gemini-3-Pro
        // For the demo, if the transcript is very short (simulated), we provide a default structured output.
        
        // Simulating the "Thinking" delay of a large context model
        await new Promise(resolve => setTimeout(resolve, 3000)); // Increased thinking time for realism

        addTrace(createLog('ada.executive', 'TOOL_EXECUTION', `Extracting financial commitments and deliverables from transcript...`, 'WORKER'));
        
        let minutesOutput = "";
        let proposalOutput = "";

        if (transcript.length > 100) { // If a substantial transcript exists, try to use LLM (simulated)
            try {
                const llmResponse = await generateSimpleResponse(
                    prompt, 
                    MOCK_USER_DATABASE['GENERAL_MANAGER'], // Pass GM profile for context
                    [], [], 0, [], // Empty registry, tenders, vesselsInPort, messages for this specific call
                    { id: 'wim', name: 'West Istanbul Marina', fullName: 'ADA.MARINA.WIM', network: 'wim.ada.network', node_address: 'ada.marina.wim', status: 'ONLINE', mission: '', contextSources: [], rules: {}, doctrine: '', masterData: {} } // Minimal tenant config
                );
                
                // Attempt to parse JSON response
                const jsonMatch = llmResponse.match(/```json\n(.*)\n```/s);
                if (jsonMatch && jsonMatch[1]) {
                    const parsed = JSON.parse(jsonMatch[1]);
                    minutesOutput = parsed.minutes || "";
                    proposalOutput = parsed.proposal || "";
                } else {
                    // Fallback if LLM doesn't return perfect JSON
                    minutesOutput = `**TOPLANTI TUTANAĞI:**\n\nLLM JSON döndüremedi. İşte transkriptten özet:\n${llmResponse.substring(0, 500)}...`;
                    proposalOutput = `**TEKLİF TASLAĞI:**\n\nLLM JSON döndüremedi. İşte transkriptten özet:\n${llmResponse.substring(500, 1000)}...`;
                }

            } catch (llmError) {
                console.error("LLM Analysis Error:", llmError);
                addTrace(createLog('ada.executive', 'ERROR', `LLM analysis failed: ${llmError}. Generating default documents.`, 'EXPERT'));
                // Fallback to default if LLM fails
                minutesOutput = generateDefaultMinutes(clientName);
                proposalOutput = generateDefaultProposal(clientName);
            }
        } else {
            // Default structured output for short/empty transcripts (demo scenario)
            minutesOutput = generateDefaultMinutes(clientName);
            proposalOutput = generateDefaultProposal(clientName);
        }

        addTrace(createLog('ada.executive', 'OUTPUT', `Documents Generated. Ready for review.`, 'EXPERT'));

        return {
            minutes: minutesOutput.trim(),
            proposal: proposalOutput.trim()
        };
    }
};

// Helper function to generate default minutes
const generateDefaultMinutes = (clientName: string) => `
**TOPLANTI TUTANAĞI**
**Tarih:** ${new Date().toLocaleDateString()}
**Katılımcılar:** Ahmet Engin (GM), ${clientName}, Ada (AI Partner)

**Özet:**
Sayın ${clientName} ile yapılan görüşmede, WIM ekosistemine katılım ve uzun dönemli bağlama opsiyonları değerlendirilmiştir. Özellikle S/Y Phisedelia için 2025 sezonu kontrat yenileme koşulları ve ek hizmetler üzerinde duruldu.

**Alınan Kararlar:**
1. S/Y Phisedelia için yıllık kontrat yenilemesi onaylandı.
2. 2025 sezonu için %10 "Erken Ödeme İndirimi" uygulanacak.
3. Ada.Sea.One (Uzaktan Kontrol) modülü ücretsiz olarak tekneye entegre edilecek.
4. Kumsal restoranlarında %15 "Member Discount" tanımlanacak.

**Aksiyonlar:**
- Finans departmanı revize faturayı 24 saat içinde iletecek.
- Teknik ekip IoT kurulumu için randevu oluşturacak.
`;

// Helper function to generate default proposal
const generateDefaultProposal = (clientName: string) => `
**KONU: 2025 Sezonu Teklif ve İş Birliği Detayları**

Sayın ${clientName},

Bugünkü verimli toplantımız için teşekkür ederim. Konuştuğumuz üzere, West Istanbul Marina olarak sizi aramızda görmekten mutluluk duyuyoruz. Ada ile birlikte notlarımızı derledik ve üzerinde el sıkıştığımız nihai teklifi aşağıda sunuyoruz:

**1. Yıllık Bağlama (20.4m x 5.6m)**
- Liste Fiyatı: €12,500
- **Anlaşılan Tutar:** €11,250 (%10 İskonto Uygulanmıştır)

**2. Teknoloji Paketi (Hediye)**
- Ada Sea ONE Entegrasyonu (Değer: €1,500) - **ÜCRETSİZ**
- 7/24 Dijital Palamar Desteği

Bu teklif 7 gün süreyle geçerlidir. Onayınız durumunda Ada.Finance üzerinden ödeme linki iletilecektir.

Saygılarımla,

**Ahmet Engin**
Genel Müdür, West Istanbul Marina
*(Drafted by Ada Executive AI)*
`;
