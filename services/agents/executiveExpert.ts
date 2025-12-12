
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

        // Simulating the "Thinking" delay of a large context model
        await new Promise(resolve => setTimeout(resolve, 2000));

        addTrace(createLog('ada.executive', 'TOOL_EXECUTION', `Extracting financial commitments and deliverables from transcript...`, 'WORKER'));
        
        let minutesOutput = "";
        let proposalOutput = "";

        if (transcript.length > 100) { 
            try {
                const llmResponse = await generateSimpleResponse(
                    prompt, 
                    MOCK_USER_DATABASE['GENERAL_MANAGER'],
                    [], [], 0, [], 
                    { id: 'wim', name: 'West Istanbul Marina', fullName: 'ADA.MARINA.WIM', network: 'wim.ada.network', node_address: 'ada.marina.wim', status: 'ONLINE', mission: '', contextSources: [], rules: {}, doctrine: '', masterData: {} }
                );
                
                const jsonMatch = llmResponse.match(/```json\n(.*)\n```/s);
                if (jsonMatch && jsonMatch[1]) {
                    const parsed = JSON.parse(jsonMatch[1]);
                    minutesOutput = parsed.minutes || "";
                    proposalOutput = parsed.proposal || "";
                } else {
                    minutesOutput = `**TOPLANTI TUTANAĞI:**\n\nLLM JSON döndüremedi. İşte transkriptten özet:\n${llmResponse.substring(0, 500)}...`;
                    proposalOutput = `**TEKLİF TASLAĞI:**\n\nLLM JSON döndüremedi. İşte transkriptten özet:\n${llmResponse.substring(500, 1000)}...`;
                }

            } catch (llmError) {
                console.error("LLM Analysis Error:", llmError);
                addTrace(createLog('ada.executive', 'ERROR', `LLM analysis failed: ${llmError}. Generating default documents.`, 'EXPERT'));
                minutesOutput = generateDefaultMinutes(clientName);
                proposalOutput = generateDefaultProposal(clientName);
            }
        } else {
            minutesOutput = generateDefaultMinutes(clientName);
            proposalOutput = generateDefaultProposal(clientName);
        }

        addTrace(createLog('ada.executive', 'OUTPUT', `Documents Generated. Ready for review.`, 'EXPERT'));

        return {
            minutes: minutesOutput.trim(),
            proposal: proposalOutput.trim()
        };
    },

    // NEW SKILL: Send Email
    sendProposalEmail: async (recipient: string, subject: string, body: string, addTrace: (t: AgentTraceLog) => void): Promise<{ success: boolean, message: string }> => {
        addTrace(createLog('ada.executive', 'THINKING', `Preparing secure email transmission to ${recipient}...`, 'EXPERT'));
        
        // 1. Generate PDF (Simulation)
        addTrace(createLog('ada.executive', 'TOOL_EXECUTION', `Rendering PDF: 'WIM_Proposal_2025.pdf'...`, 'WORKER'));
        await new Promise(resolve => setTimeout(resolve, 800));

        // 2. Connect to SMTP (Simulation)
        addTrace(createLog('ada.executive', 'TOOL_EXECUTION', `Connecting to SMTP Relay (smtp.ada.network)... Authenticated.`, 'WORKER'));
        await new Promise(resolve => setTimeout(resolve, 600));

        // 3. Send
        addTrace(createLog('ada.executive', 'OUTPUT', `EMAIL SENT: To: ${recipient} | Subject: ${subject}`, 'EXPERT'));

        return {
            success: true,
            message: `Proposal successfully sent to **${recipient}**.`
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
