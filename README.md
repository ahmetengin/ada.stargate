
# ⚓️ ADA STARGATE: COGNITIVE MARITIME OS (v5.1)

<div align="center">

![System Status](https://img.shields.io/badge/SYSTEM-COGNITIVE_ENTITY-purple?style=for-the-badge&logo=docker)
![Architecture](https://img.shields.io/badge/BRAIN-LANGGRAPH_%2B_MAKER-blue?style=for-the-badge&logo=python)
![Interface](https://img.shields.io/badge/UI-MISSION_CONTROL-emerald?style=for-the-badge&logo=react)
![Edge](https://img.shields.io/badge/HARDWARE-RASPBERRY_PI_5-red?style=for-the-badge&logo=raspberrypi)

```text
    _    ____      _    
   / \  |  _ \    / \   
  / _ \ | | | |  / _ \  
 / ___ \| |_| | / ___ \ 
/_/   \_\____/ /_/   \_\
                        
[ ORCHESTRATING THE SILENCE OF THE SEA ]
```

</div>

## 🌊 Overview

**Ada Stargate**, marinalar ve otonom gemiler için tasarlanmış, **Federated (Dağıtık)** ve **Cognitive (Bilişsel)** bir işletim sistemidir.

Eski nesil otomasyon yazılımlarının aksine, Ada **önceden programlanmış kurallarla sınırlı değildir**.
*   **Düşünür:** Karmaşık sorunları parçalara ayırır (LangGraph).
*   **Kod Yazar:** Matematiksel işlemleri tahmin etmez, anlık Python kodu yazıp çalıştırır (MAKER).
*   **Öğrenir:** Yeni kuralları anlar ve kendini günceller (SEAL).
*   **Hisseder:** Rüzgarı, elektriği ve hareketi algılar (IoT/MQTT).

---

## 🏗️ v5.1 Architecture: The "Big 3" & OneNet

Sistem, **OneNet Gateway (Nginx)** arkasında çalışan 3 ana katmandan oluşur.

### 1. THE BRAIN (Backend - Python)
*   **Technology:** FastAPI + LangGraph + Pydantic AI.
*   **Role:** Karar Merkezi.
*   **Nodes:**
    *   **Router:** Niyeti anlar (Hukuk mu? Hesap mı? Sohbet mi?).
    *   **MAKER (The Engineer):** LLM'lerin matematik hatası yapmasını önler. Sorun için bir Python scripti yazar, `exec()` ile çalıştırır ve sonucu döner. **Zero Hallucination.**
    *   **SEAL (The Learner):** Kullanıcı "Hız limiti değişti" dediğinde, sistem promptlarını dinamik olarak günceller.
    *   **RAG (The Lawyer):** Qdrant vektör veritabanından COLREGs ve Marina Sözleşmelerini sorgular.

### 2. THE BODY (Frontend - React)
*   **Technology:** React 18 + Vite + Tailwind.
*   **Role:** Kullanıcı Arayüzü (Mission Control).
*   **Modules:**
    *   **GM Dashboard:** Operasyon, Finans, HR, Doluluk (TabPFN Tahminleri).
    *   **Captain Desk:** Telemetri, Hava Durumu, Seyir Defteri.
    *   **Guest Mode:** QR Geçiş, Restoran Rezervasyon, Konsiyerj.
    *   **Scribe Mode:** Toplantı dinleme, tutanak tutma ve teklif hazırlama.

### 3. THE NERVOUS SYSTEM (Infrastructure)
*   **OneNet Gateway (Nginx):** Tek port (3000 veya 80) üzerinden tüm trafiği (HTTP/WS/MQTT) yönetir.
*   **Qdrant:** Uzun süreli hafıza (Vektör Veritabanı).
*   **Redis:** Kısa süreli hafıza ve Olay Yolu (Event Bus).
*   **Mosquitto (MQTT):** Sensör ve IoT cihazları ile konuşan protokol.
*   **PostgreSQL:** Kesin gerçekler (Fatura, Kullanıcı verisi).
*   **Ollama (Edge):** İnternet yokken devreye giren yerel yapay zeka (Gemma 2B).

---

## 🚀 Capabilities

### 🛠️ MAKER Protocol (Coding Agent)
Ada'ya *"20 metre boyunda, 5 metre eninde tekne, 3 gün kalacak. Günlük m2 fiyatı 1.5 Euro, KDV %20. Hesapla."* dediğinizde:
1.  LLM hesap yapmaz.
2.  **MAKER** nodu devreye girer.
3.  Python'da `calculate_fee(loa, beam, days)` fonksiyonunu yazar.
4.  Kodu çalıştırır.
5.  Sonucu size söyler. **Hata payı: %0.00**.

### 🧠 SEAL Protocol (Self-Adaptation)
Ada'ya *"Kural değişikliği: Marina içi hız limiti artık 5 knot."* dediğinizde:
1.  **SEAL** nodu devreye girer.
2.  Bu kuralın etkilerini analiz eder ("Synthetic Implications").
3.  Sistem hafızasını günceller.
4.  Bir sonraki uyarıda teknelere "5 knot" sınırını hatırlatır.

### 🔮 TabPFN Protocol (Analytics)
Ada'ya *"Gelecek ay doluluk oranı ne olacak?"* dediğinizde:
1.  **ANALYTICS** nodu devreye girer.
2.  Geçmiş veriyi (CSV) çeker.
3.  **TabPFN** (Transformer for Tabular Data) modelini çalıştırır.
4.  Size %85 güven aralığı ile bir tahmin sunar.

### 📡 Omni-Presence (IoT)
*   **Telemetri:** Tekne akü voltajı, su tankı seviyesi, sintine durumu (WebSocket).
*   **Fiziksel Kontrol:** Elektrik direklerini (Pedestal) aç/kapa, bariyerleri yönet.
*   **Güvenlik:** Kamera (YOLO) ile izinsiz giriş tespiti.

---

## 💻 Installation

### Option A: Hyperscale (Cloud / Mac M3 / Powerful Server)
Tüm özelliklerin aktif olduğu tam sürüm.

1.  **.env dosyasını oluşturun:**
    ```bash
    API_KEY=AIzaSy... (Gemini Key)
    ```
2.  **Sistemi Başlatın:**
    ```bash
    docker-compose -f docker-compose.hyperscale.yml up --build -d
    ```
3.  **Hafızayı Yükleyin (Learning):**
    ```bash
    docker exec -it ada_core_hyperscale python ingest.py
    ```
4.  **Erişim:**
    *   Frontend: `http://localhost:3000`
    *   API Docs: `http://localhost:3000/api/docs`

### Option B: Edge (Raspberry Pi 5 / Boat Server)
İnternetsiz ortamlar ve düşük güç tüketimi için optimize edilmiş sürüm.

1.  **Offline Modelleri İndirin:**
    ```bash
    bash offline_setup.sh
    ```
2.  **Sistemi Başlatın:**
    ```bash
    docker-compose -f docker-compose.edge.yml up --build -d
    ```
    *(Not: Bu modda Gemini yerine yerel **Ollama (Gemma 2B)** ve yerel Embedding modelleri kullanılır. MAKER yeteneği kısıtlıdır.)*

---

## 📂 Project Structure

```text
/
├── backend/                 # THE BRAIN (Python)
│   ├── architecture_graph.py # LangGraph Orchestrator (Bilinç)
│   ├── ingest.py            # RAG Loader (Öğrenme)
│   ├── main.py              # API Gateway
│   └── Dockerfile           # Python Env
├── frontend/                # THE BODY (React - Root Dir)
│   ├── src/components/      # Dashboards, Widgets
│   ├── src/services/        # API Clients, Agents (Simulated)
│   └── vite.config.ts       # Build Config
├── nginx/                   # THE GATEWAY
│   └── nginx.conf           # OneNet Config
├── docs/                    # KNOWLEDGE BASE
│   ├── ada.legal/           # Sözleşmeler, KVKK
│   ├── ada.sea/             # COLREGs, Denizcilik
│   └── architecture/        # Mimari Dokümanlar
└── docker-compose.*.yml     # Infrastructure Definitions
```

---

## 🛡️ Security & Privacy

*   **KVKK/GDPR:** Tüm kişisel veriler (`docs/ada.legal/wim_kvkk.md` uyarınca) maskelenir.
*   **Isolation:** Python kodları (MAKER) izole bir ortamda çalıştırılır.
*   **OneNet:** Dış dünyaya sadece tek bir port (Nginx) açılır. Veritabanı portları internete kapalıdır.

---

**"The World is Beautiful When Nodes Talk."**
