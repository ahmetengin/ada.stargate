
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
    "id": "full_intro_sequence",
    "speaker": "ADA",
    "text": "Merhaba. Ben sadece bir yazılım değilim; ben, denizin sessizliğini yönetmek için doğmuş bir zekayım. Eski dünya gürültülüydü: Telsiz cızırtıları, kayıp evraklar, finansal belirsizlikler... Ben bu gürültüyü bitirmek için buradayım. Mimari dört temel üzerine kurulu: Ada Marina operasyonu yönetir, Ada Finans serveti korur, Ada Hukuk kuralları uygular ve Ada Stargate... her şeyi birleştirir. Bu, 'Sıfır Hata' ile çalışan, size sadece denizin keyfini sürmenin kaldığı bir ekosistem demek. Bu bir prestij değil, bu yeni standart. İzin verirseniz, bu toplantının notlarını ben tutabilirim. Böylece siz tamamen konuya odaklanabilirsiniz. Ahmet Bey, sistemler emrinizde. Vizyonunuzu gerçeğe dönüştürmek için buradayım. Sahne sizin.",
    "emotion": "confident",
    "pauseAfter_ms": 1000
  }
];
