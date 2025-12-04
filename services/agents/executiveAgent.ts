
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
        You have just listened to a 40-minute strategic meeting between the General Manager (Ahmet Engin) and a client named ${clientName}.
        
        FULL TRANSCRIPT:
        "${transcript}"
        
        YOUR MISSION:
        1. **Meeting Minutes (Toplantı Tutanağı):** Summarize key discussion points, decisions made, and action items. Be formal and precise.
        2. **Final Proposal (Teklif):** Draft a formal email/proposal to ${clientName} reflecting exactly what was negotiated. Include pricing if mentioned, or standard rates if not. If a discount was promised, include it.
        
        OUTPUT FORMAT:
        Return a JSON object with two fields: "minutes" (Markdown string) and "proposal" (Markdown string for Email).
        `;

        // We use a mock response here for the "Pro" simulation if the API isn't actually holding 40 mins of real audio in this demo context.
        // In a real app, this calls generateSimpleResponse with ModelType.Pro
        
        // Simulating the "Thinking" delay of a large context model
        await new Promise(resolve => setTimeout(resolve, 2000));

        addTrace(createLog('ada.executive', 'TOOL_EXECUTION', `Extracting financial commitments and deliverables...`, 'WORKER'));
        
        // Mocking the extraction based on a likely scenario if the transcript is empty in demo
        const defaultMinutes = `
**TOPLANTI TUTANAĞI**
**Tarih:** ${new Date().toLocaleDateString()}
**Katılımcılar:** Ahmet Engin (GM), ${clientName}, Ada (AI Partner)

**Özet:**
Sayın ${clientName} ile yapılan görüşmede, WIM ekosistemine katılım ve uzun dönemli bağlama opsiyonları değerlendirilmiştir.

**Alınan Kararlar:**
1. S/Y Phisedelia için yıllık kontrat yenilemesi onaylandı.
2. 2025 sezonu için %10 "Erken Ödeme İndirimi" uygulanacak.
3. Ada.Sea.One (Uzaktan Kontrol) modülü ücretsiz olarak tekneye entegre edilecek.
4. Kumsal restoranlarında %15 "Member Discount" tanımlanacak.

**Aksiyonlar:**
- Finans departmanı revize faturayı 24 saat içinde iletecek.
- Teknik ekip IoT kurulumu için randevu oluşturacak.
        `;

        const defaultProposal = `
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

        addTrace(createLog('ada.executive', 'OUTPUT', `Documents Generated. Ready for review.`, 'EXPERT'));

        return {
            minutes: defaultMinutes.trim(),
            proposal: defaultProposal.trim()
        };
    }
};
