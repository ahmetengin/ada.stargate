
# 🧬 Ada Stargate: Hyperscale Architecture Spec

**Target:** Enterprise Maritime Operations
**Core Philosophy:** "Zero Error" Calculation + "Fluid" Reasoning.

## 1. The Stack Selection Rationale

### A. Compute & Routing (The Backbone)
*   **FastAPI:** Seçildi çünkü native AsyncIO desteği var. 1000'lerce eşzamanlı WebSocket bağlantısını (Canlı Telemetri) kaldırabilir.
*   **LangGraph:** Seçildi çünkü marina operasyonları doğrusal değildir (Linear değil, Cyclic). Bir karar verilir, hava durumu kontrol edilir, eğer kötüyse karar değiştirilir. LangGraph bu "State Machine" yapısını mükemmel modeller.

### B. Advanced AI Components (The Cortex)
*   **TabPFN v2:** Tabular Data için eğitilmiş bir Transformer. `ada.analytics` nodunun, devasa veri setlerine ihtiyaç duymadan (Zero-Shot) marina doluluğu veya gelir tahmini yapmasını sağlar.
*   **SEAL (Self-Adapting LLMs):** Marinalarda kurallar sık değişir. SEAL, yeni bir kural metni verildiğinde (örn. "Yeni vergi yasası"), sistemin kendi kendini yeniden eğitmesini (Prompt Engineering'i dinamik yapmasını) sağlar.
*   **MAKER (LATM):** LLM'ler matematikte kötüdür. MAKER nodu, finansal hesaplamalar için anlık Python kodu yazar ve çalıştırır. Hallüsinasyon riskini ortadan kaldırır.

### C. Memory Fabric (The Hippocampus)
*   **Qdrant:** "Soft Truth". Milyonlarca vektörü saklar (Sözleşmeler, Kanunlar). Rust tabanlı olduğu için çok hızlıdır.
*   **Redis:** "The Now". Kısa süreli konuşma hafızası ve Event Bus (Olay Yolu).
*   **PostgreSQL:** "Hard Truth". Fatura kayıtları, kullanıcı kimlikleri.

## 2. Data Flow (Veri Akışı)

1.  **Ingest:** Kullanıcı Mesajı -> `FastAPI` -> `LangGraph`.
2.  **Route:** `Router Node` niyeti sınıflandırır (Hesaplama mı? Tahmin mi? Hukuk mu?).
3.  **Process:**
    *   Eğer Tahmin -> `TabPFN Node`.
    *   Eğer Kural Değişimi -> `SEAL Node`.
    *   Eğer Hesaplama -> `MAKER Node` -> `Executor Node`.
    *   Eğer Hukuk/Bilgi -> `RAG Node`.
4.  **Respond:** `Generator Node` tüm verileri birleştirir ve nihai cevabı üretir.

---

## 3. Why "Big 3"? (Neden Bu Mimari?)

Eski sistemlerde (Single Agent), tek bir LLM her şeyi yapmaya çalışırdı ve sık sık hata yapardı.
**Big 3 (Router -> Expert -> Worker)** mimarisinde:
1.  **Router** sadece yönlendirir.
2.  **Expert** (Uzman) işi planlar.
3.  **Worker** (İşçi/Kod) işi yapar.

Bu, "Sıfır Hata" (Zero Error) operasyonun anahtarıdır.
