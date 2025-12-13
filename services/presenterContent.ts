
// services/presenterContent.ts

export interface NarrativeLine {
    id: string;
    speaker: "ADA" | "GM";
    text: string;
    emotion?: "thoughtful" | "confident" | "welcoming" | "informative" | "assertive" | "helpful" | "respectful";
    pauseAfter_ms?: number;
}

export const introNarrative: NarrativeLine[] = [
  {
    "id": "intro_01",
    "speaker": "ADA",
    "text": "Merhaba. Ben Ada. West Istanbul Marina'nın bilişsel işletim sistemiyim. Eski dünya gürültülüydü; telsiz cızırtıları, kayıp evraklar, unutulan tahsilatlar... Ben bu gürültüyü bitirmek ve operasyonu 'Sessiz Mükemmellik' seviyesine taşımak için tasarlandım.",
    "emotion": "thoughtful",
    "pauseAfter_ms": 1000
  },
  {
    "id": "roi_sequence",
    "speaker": "ADA",
    "text": "Ahmet Bey, haklısınız; araştırma yapmadan konuşmak bir yapay zeka için bile hatadır. Bu yüzden şu an TabPFN modülümü kullanarak son 3 yılın muhasebe verilerini ve Kpler üzerinden Akdeniz tekne trafiğini analiz ettim. Sonuçlar ekranda: Dinamik fiyatlama ile doluluğu %92'ye çıkarabiliriz. Tahsilat süresini 45 günden 3 güne indirebilirim. Bu, sadece bir tahmin değil, matematiksel bir kesinliktir.",
    "emotion": "assertive",
    "pauseAfter_ms": 2000
  }
];
