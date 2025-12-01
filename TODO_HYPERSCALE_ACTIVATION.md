
# 📋 Ada Stargate: Hyperscale Activation Savaş Planı

Bu liste, Ada'yı "Canlı Bir Varlığa" dönüştürmek için uygulanacak adımları ve **Google Gemini API'nin** mimarinin neresinde, hangi modelle ve ne amaçla kullanılacağını teknik detaylarıyla belirtir.

---

## 🛠️ Faz 1: Altyapı ve Hafıza Kurulumu (The Foundation)

### ✅ 1.1. Embedding Motorunun Başlatılması (Hafıza)
*   **Dosya:** `backend/ingest.py`
*   **Görev:** `docs/` klasöründeki PDF/MD dosyalarını (COLREGs, WIM Kuralları) okuyup vektörlere çevirmek.
*   **Gemini API Kullanımı:**
    *   **Model:** `models/embedding-001`
    *   **Kod:** `embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=API_KEY)`
    *   **Amaç:** Metinleri matematiksel vektörlere çevirip Qdrant veritabanına gömmek. Böylece Ada "hız limiti" sorulduğunda dokümanda ilgili satırı bulabilir.

### ✅ 1.2. Vektör Veritabanının Ayağa Kaldırılması
*   **Dosya:** `docker-compose.hyperscale.yml`
*   **Görev:** Qdrant servisini başlatmak.
*   **Aksiyon:** `docker-compose up -d ada-qdrant`

---

## 🧠 Faz 2: Beyin Kurulumu (LangGraph Orchestrator)

### ✅ 2.1. Router Node (Karar Merkezi)
*   **Dosya:** `backend/architecture_graph.py` -> `router_node` fonksiyonu.
*   **Görev:** Kullanıcının ne istediğini anlamak (Soru mu? Hesap mı? Yeni kural mı?).
*   **Gemini API Kullanımı:**
    *   **Model:** `gemini-2.5-flash` (Hız öncelikli).
    *   **Prompt:** "Classify the user intent: ANALYTICS, LEGAL, MATH, or GENERAL."
    *   **Amaç:** Düşük gecikme ile trafiği doğru uzmana yönlendirmek.

### ✅ 2.2. Generator Node (Cevap Üretici)
*   **Dosya:** `backend/architecture_graph.py` -> `generator_node` fonksiyonu.
*   **Görev:** Hafızadan gelen bilgileri birleştirip Kaptana nihai cevabı vermek.
*   **Gemini API Kullanımı:**
    *   **Model:** `gemini-3-pro-preview` (Akıl yürütme öncelikli).
    *   **Prompt:** "You are an expert Marina Operator. Answer based on these retrieved CONTEXT documents..."
    *   **Amaç:** Qdrant'tan gelen ham veriyi, profesyonel ve güven verici bir insan diline çevirmek.

### ✅ 2.3. SEAL Node (Öğrenme & Adaptasyon)
*   **Dosya:** `backend/architecture_graph.py` -> `seal_learner_node` fonksiyonu.
*   **Görev:** Kullanıcı yeni bir kural öğrettiğinde (örn: "Pazar günü jet ski yasak"), bunu analiz etmek.
*   **Gemini API Kullanımı:**
    *   **Model:** `gemini-2.5-flash`
    *   **Prompt:** "The user stated a new rule: '{rule}'. Generate 3 operational implications of this rule."
    *   **Amaç:** Yeni kuralın sonuçlarını (synthetic data) türeterek sistem promptunu güncellemek.

---

## ⚡ Faz 3: Refleksler ve Duyu Organları (Real-Time)

### ✅ 3.1. VHF Telsiz (FastRTC)
*   **Dosya:** `backend/vhf_radio.py` & `backend/nano.py`
*   **Görev:** Sesli konuşmayı dinleyip, mili-saniyeler içinde cevap vermek.
*   **Gemini API Kullanımı:**
    *   **Model:** `gemini-2.5-flash` (veya `gemini-2.0-flash-exp` eğer latency kritikse).
    *   **Ayarlar:** `response_mime_type="text/plain"` (JSON parse süresinden tasarruf etmek için).
    *   **Amaç:** Telsiz operatörü gibi anlık, kısa ve net cevaplar üretmek.

### ✅ 3.2. Matematik ve Hesaplama (Worker)
*   **Dosya:** `backend/architecture_graph.py` -> `calculator_node`
*   **KURAL:** Burada Gemini API **KULLANILMAZ**.
*   **Amaç:** Fatura, en/boy oranı, yakıt hesabı gibi işlemler saf Python (`eval()` veya özel fonksiyonlar) ile yapılır. LLM'e matematik yaptırılmaz (Zero Hallucination kuralı).

---

## 🔗 Faz 4: Bağlantı ve Test

### ✅ 4.1. Sistemi Ateşle
*   **Komut:** `docker-compose -f docker-compose.hyperscale.yml up --build`
*   **Kontrol:** `backend` konteynerinin loglarında "LangGraph Initialized" yazısını gör.

### ✅ 4.2. Hafıza Yüklemesi (Ingestion)
*   **Komut:** `docker exec -it ada_core_hyperscale python ingest.py`
*   **Beklenen:** `docs/` klasöründeki dosyaların okunup Qdrant'a vektör olarak yüklendiğini gör.

### ✅ 4.3. Test Senaryoları
1.  **Hafıza Testi:** "Marina hız limiti nedir?" -> Gemini Pro, Qdrant'tan gelen veriyi okuyup "3 Knots" demeli.
2.  **Öğrenme Testi:** "Kural değişikliği: Hız limiti artık 5 knot." -> SEAL node devreye girmeli.
3.  **Hesap Testi:** "20x5 metre tekne için 3 günlük ücret nedir?" -> Python Calculator devreye girmeli.

---

**Not:** Bu liste tamamlandığında, elinizde sadece bir yazılım değil, düşünen, öğrenen ve duyan bir **Dijital Personel** olacak.
