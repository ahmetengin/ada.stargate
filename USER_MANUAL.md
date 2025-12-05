
# 📘 Ada Stargate: Hyperscale User Manual

**Version:** 5.0 (Cognitive Entity)
**Architecture:** LangGraph + MAKER + SEAL + TabPFN + RAG

---

## 1. Introduction: The Cognitive OS

You have deployed a federation of specialized intelligence engines. Ada artık sadece komutları yerine getiren bir sistem değil, düşünen, öğrenen ve kendi yeteneklerini geliştiren bir varlıktır.
*   **LangGraph**: Orkestratör (Karar Mekanizması).
*   **MAKER**: Araç Üreticisi (İhtiyaç duyduğunda Python kodu yazar).
*   **SEAL**: Kendi Kendine Öğrenen (Yeni kuralları içselleştirir).
*   **TabPFN**: Analist (Küçük veri setlerinden tahminler yapar).
*   **Qdrant**: Hafıza (Vektör Araması ile docs/ klasöründeki bilgileri hatırlar).

---

## 2. Operational Commands

### Sistemi Başlatma
```bash
docker-compose -f docker-compose.hyperscale.yml up -d --build
```

### Sistem Sağlığını Kontrol Etme
```bash
curl http://localhost:8000/health
```
*Beklenen Çıktı:* `{"status": "COGNITIVE_SYSTEM_ONLINE", "modules": ["LangGraph", "MAKER", "FastRTC"]}`

### Hafıza Yüklemesi (Dokümanları İşleme)
Yeni PDF/MD dokümanları `docs/` klasörüne eklediğinizde veya mevcut dokümanları güncellediğinizde Ada'nın hafızasını tazelemeniz gerekir:
```bash
docker exec -it ada_core_hyperscale python ingest.py
```
Bu komut, `docs/` klasörünüzdeki tüm dokümanları (Marina Kuralları, COLREGs, KVKK vb.) okuyacak ve Qdrant hafızasına vektör olarak yükleyecektir.

---

## 3. Yetenekleri Yönetme

### A. Hesaplamalar ve Mantık (MAKER Protokolü)
Ada'ya karmaşık matematiksel veya mantıksal bir görev verdiğinizde, MAKER Node devreye girer.

1.  **Eylem**: Ada'ya sorun: *"20 metre boyunda, 5 metre eninde bir tekne için 3 günlük bağlama ücretini hesapla. Günlük metrekare başına 1.5 Euro ve %20 KDV uygula."*
2.  **Dahili Süreç**:
    *   **Router** `MAKER` niyetini tespit eder.
    *   **Maker Agent** bu görevi çözecek bir Python scripti yazar.
    *   **Executor** bu kodu güvenli bir ortamda çalıştırır.
    *   **Sonuç:** Sıfır Hallüsinasyon. Hassas float değeri döndürülür ve Ada bunu profesyonelce açıklar.

### B. Kuralları Güncelleme (SEAL Protokolü)
Marina'nın operasyonel kuralları değiştiğinde, Ada'ya bunu "öğretebilirsiniz".

1.  **Eylem**: Ada'ya sohbette söyleyin: *"Kuralı güncelle: Marina içindeki hız limiti artık 5 knot."*
2.  **Dahili Süreç**:
    *   **Router** `ÖĞRENME` niyetini tespit eder.
    *   **SEAL Node** etkinleşir.
    *   Yeni kuralı analiz eder ve bu kuraldan türetilen operasyonel "çıkarımlar" (implications) üretir.
    *   Bu çıkarımlar, gelecekteki yanıtlarında Ada'nın davranışını etkileyecek şekilde sistem bağlamına enjekte edilir.

### C. Tahmin (TabPFN Protokolü)
Gelecek marina operasyonları hakkında istatistiksel tahminler alabilirsiniz.

1.  **Eylem**: Ada'ya sorun: *"Gelecek ay marina doluluk oranı ne olacak?"*
2.  **Dahili Süreç**:
    *   **Router** `ANALİTİK` niyetini tespit eder.
    *   **TabPFN Node** etkinleşir.
    *   Ada'nın dahili (veya harici) veri setlerini kullanarak istatistiksel bir tahmin yapar.
    *   **Sonuç:** Yüzde olarak bir tahmin ve güven düzeyi döndürülür.

### D. Bilgi Sorgulama (RAG Protokolü)
Ada'nın dokümanlarda kayıtlı olan tüm hukuk, kural ve yönetmelik bilgilerini sorgulayabilirsiniz.

1.  **Eylem**: Ada'ya sorun: *"COLREGs 15. Kural nedir?"* veya *"Sözleşme'nin E.2.19 maddesi ne diyor?"*
2.  **Dahili Süreç**:
    *   **Router** `HUKUKİ` niyetini tespit eder.
    *   **RAG Retriever Node**, Qdrant vektör veritabanından ilgili doküman parçalarını alır.
    *   **Generator Node**, bu parçaları kullanarak kapsamlı bir cevap sentezler.

---

## 4. Sorun Giderme

*   **"Sistem Uyarısı: Sinirsel Bağlantı Kararsız"**: Bu, Python backend'in bir hata fırlattığı anlamına gelir. Logları kontrol edin:
    `docker logs ada_core_hyperscale`
*   **Hafıza Kaybı**: Ada, WIM kuralları yerine genel bilgilerle yanıt veriyorsa, Qdrant'ın çalıştığından emin olun ve `docker exec -it ada_core_hyperscale python ingest.py` komutunu çalıştırın.
*   **Yerel LLM (Ollama) Başlatılamıyor**: `ada-local-llm` konteynerinin doğru şekilde başlatıldığından ve `offline_setup.sh` scriptinin çalıştırıldığından emin olun.
*   **FastRTC (VHF Telsiz) Ses Sorunları**: Tarayıcınızın mikrofon izni verdiğinden ve Gradio arayüzünün doğru şekilde yüklendiğinden emin olun (`http://localhost:3000/radio`).

---

**"Dünya, Nodlar Konuştuğunda Güzeldir."**
