
# 📘 Ada Stargate: Hyperscale User Manual

**Version:** 5.0 (Cognitive Entity)
**Architecture:** LangGraph + MAKER + SEAL + TabPFN + RAG

---

## 1. Giriş: Bilişsel İşletim Sistemi (Cognitive OS)

Bu kurulumla birlikte Ada, basit bir bottan; düşünen, hesaplayan, öğrenen ve kendini güncelleyen bir **Bilişsel Varlığa** dönüşmüştür.

*   **LangGraph (Orkestratör):** Karar mekanizması. İsteğin türüne göre hangi uzmana (Hukuk, Finans, İstatistik) gidileceğine karar verir.
*   **MAKER (Mühendis):** Karmaşık hesaplamalar için anlık Python kodu yazar ve çalıştırır. Hallüsinasyonu sıfırlar.
*   **SEAL (Öğrenci):** Yeni kuralları (örn: "Hız limiti değişti") öğrenir ve sistem davranışını buna göre günceller.
*   **TabPFN (Analist):** Küçük veri setlerinden (Marina doluluğu gibi) yüksek doğrulukla tahmin yapar.
*   **Qdrant (Hafıza):** `docs/` klasöründeki binlerce sayfalık dokümanı (Sözleşmeler, Kanunlar) saniyeler içinde tarar.

---

## 2. Operasyonel Komutlar

### Sistemi Başlatma
Tüm "Big 3" mimarisini (Frontend, Backend, DB'ler) tek komutla ayağa kaldırır.
```bash
docker-compose -f docker-compose.hyperscale.yml up -d --build
```

### Sistem Sağlığını Kontrol Etme
Backend'in ve bilişsel modüllerin aktif olup olmadığını kontrol eder.
```bash
curl http://localhost:8000/health
```
*Beklenen Çıktı:* `{"status": "COGNITIVE_SYSTEM_ONLINE", "modules": ["LangGraph", "MAKER", "SEAL", "TabPFN"]}`

### Hafıza Yüklemesi (Learning Protocol)
`docs/` klasörüne yeni bir PDF/MD eklediğinizde veya bir kuralı değiştirdiğinizde Ada'nın hafızasını tazelemeniz gerekir.
```bash
# Backend konteyneri içinde ingest scriptini çalıştırır
docker exec -it ada_core_hyperscale python ingest.py
```
*Bu işlem Qdrant vektör veritabanını günceller.*

---

## 3. Yetenek Yönetimi

### A. Hesaplamalar (MAKER Protokolü)
Ada'ya matematiksel veya mantıksal bir görev verdiğinizde:
1.  **Siz:** *"20m boyunda, 5m eninde tekne, 3 gün kalacak. Günlük m2 fiyatı 1.5 Euro, KDV %20. Hesapla."*
2.  **Ada:** Python kodu yazar -> Çalıştırır -> Sonucu söyler.
3.  **Fark:** LLM matematik yapmaz, Python yapar. Sonuç %100 kesindir.

### B. Kural Öğretme (SEAL Protokolü)
Marina kuralları değiştiğinde kod değiştirmenize gerek yoktur.
1.  **Siz:** *"Kural güncellemesi: Marina içi hız limiti artık 5 knot."*
2.  **Ada:** SEAL nodu devreye girer. Bu kuralı analiz eder ve sistem prompt'una "Synthetic Context" olarak ekler. Artık tüm cevaplarında bu kuralı dikkate alır.

### C. Geleceği Görme (TabPFN Protokolü)
İstatistiksel tahminler için.
1.  **Siz:** *"Gelecek ay doluluk oranı tahmini nedir?"*
2.  **Ada:** TabPFN nodu devreye girer. Geçmiş veriyi (CSV) analiz eder ve bir olasılık dağılımı (Confidence Level) ile tahmin yapar.

---

## 4. Sorun Giderme

*   **"System Alert: Neural Link Unstable"**: Python backend çökmüş olabilir. Logları kontrol edin:
    `docker logs ada_core_hyperscale`
*   **Hafıza Kaybı**: Ada genel geçer cevaplar veriyorsa (WIM kurallarını bilmiyorsa), Qdrant boş olabilir. `ingest.py` komutunu tekrar çalıştırın.
*   **Port Çakışması**: Mac M3 kullanıyorsanız ve 80 portu doluysa, `docker-compose.yml` içinde frontend portunu `3000:80` olarak değiştirin.

---

**"Dünya, Nodlar Konuştuğunda Güzeldir."**
