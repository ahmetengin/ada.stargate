
# 🐳 Ada Stargate: Production Deployment Kit

Bu ortamda sistem dosyaları oluşturulamadığı için, lütfen aşağıdaki dosyaları projenizin kök dizininde manuel olarak oluşturun.

---

## 1. Dizin Yapısı (Klasörleri Oluşturun)

Proje klasörünüzde terminali açıp şu komutu çalıştırın:

```bash
mkdir -p backend/agents backend/workers backend/orchestrator nginx
```

---

## 2. FastRTC Telsiz Modülü (Ses Çözümü)

Docker içinde ses kartı olmasa bile, **WebRTC** sayesinde tarayıcının mikrofonunu kullanarak çalışan telsiz modülü.

**Dosya:** `backend/vhf_radio.py`

```python
import sys
import os
from fastrtc import ReplyOnPause, Stream, get_stt_model, get_tts_model
from loguru import logger
from backend.nano import NanoAgent

# 1. Modelleri Yükle (Local - Hız için)
stt_model = get_stt_model()  # Moonshine (Speech-to-Text)
tts_model = get_tts_model()  # Kokoro (Text-to-Speech)

# 2. Akıllı Ajanı Başlat (Gemini - Zeka için)
vhf_brain = NanoAgent(
    name="Ada.VHF",
    system_instruction="""
    ROL: West Istanbul Marina (WIM) VHF Telsiz Operatörü.
    KANAL: 72.
    
    KURALLAR:
    1. Kısa, net ve denizcilik jargonuna (SMCP) uygun konuş.
    2. Cevaplarını Türkçe ver.
    3. Asla markdown kullanma.
    4. Cümlelerini "Tamam" (Over) ile bitir.
    """
)

def echo(audio):
    """
    Ses Döngüsü: Ses -> Metin -> Zeka -> Metin -> Ses
    """
    # Sesi yazıya çevir
    transcript = stt_model.stt(audio)
    if not transcript or len(transcript.strip()) < 2:
        return
        
    logger.info(f"Kaptan: {transcript}")
    
    # Zekaya sor
    response_text = vhf_brain.chat(transcript)
    logger.info(f"Ada: {response_text}")
    
    # Yazıyı sese çevir ve yayınla
    for audio_chunk in tts_model.stream_tts_sync(response_text):
        yield audio_chunk

# 3. Yayını Başlat (0.0.0.0 Önemli!)
stream = Stream(
    ReplyOnPause(echo),
    modality="audio",
    mode="send-receive",
    ui_args={"title": "Ada VHF Radio (Ch 72)"}
)

if __name__ == "__main__":
    # 0.0.0.0 ayarı Docker dışından erişim için şarttır
    stream.ui.launch(server_name="0.0.0.0", server_port=7860)
```

---

## 3. Backend Ana Sunucu

LangGraph beynini ve Telsizi tek çatı altında çalıştırır.

**Dosya:** `backend/main.py`

```python
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import gradio as gr 

# Importlar (Hata önleyici blok ile)
try:
    from backend.vhf_radio import stream as radio_stream
    # from backend.architecture_graph import build_graph # (Opsiyonel)
except ImportError:
    from vhf_radio import stream as radio_stream

app = FastAPI(title="Ada Stargate Hyperscale API", version="4.6")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ONLINE", "modules": ["FastAPI", "FastRTC"]}

# Telsizi /radio adresine bağla
app = gr.mount_gradio_app(app, radio_stream.ui, path="/radio")

if __name__ == "__main__":
    # 0.0.0.0:8000 -> API
    # 0.0.0.0:7860 -> WebRTC (Doğrudan erişim için)
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 4. Docker Konfigürasyonu (Mac M4 Uyumlu)

**Dosya:** `docker-compose.hyperscale.yml`

```yaml
version: '3.9'

services:
  # Python Backend & Telsiz
  ada-core:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: ada_core_hyperscale
    ports:
      - "8000:8000" # API
      - "7860:7860" # FastRTC / Ses (Kritik Port)
    environment:
      - API_KEY=${API_KEY}
      - GRADIO_SERVER_NAME=0.0.0.0
    volumes:
      - ./backend:/app
      - ./docs:/docs

  # React Frontend (Nginx)
  ada-frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - API_KEY=${API_KEY}
    container_name: ada_frontend_hyperscale
    ports:
      - "3000:80" # Mac çakışmasını önlemek için 3000
    depends_on:
      - ada-core
```

---

## 5. Backend Dockerfile

Ses kütüphanelerini Linux imajına yükler.

**Dosya:** `backend/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Ses işleme için gerekli sistem kütüphaneleri (FastRTC için)
RUN apt-get update && apt-get install -y \
    libasound2-dev \
    portaudio19-dev \
    libportaudio2 \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 6. Nginx Ayarı (WebSocket Desteği)

**Dosya:** `nginx/nginx.conf`

```nginx
events { worker_connections 1024; }

http {
    include mime.types;
    default_type application/octet-stream;

    server {
        listen 80;

        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        # API Yönlendirme
        location /api/ {
            proxy_pass http://ada-core:8000/api/;
            proxy_set_header Host $host;
        }

        # Telsiz Yönlendirme (Websocket Upgrade Şart)
        location /radio/ {
            proxy_pass http://ada-core:8000/radio/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
```

---

## 🚀 Çalıştırma

1.  Bu dosyaları bilgisayarınızda oluşturun.
2.  `.env` dosyasına `API_KEY=...` ekleyin.
3.  Komutu çalıştırın:
    ```bash
    docker-compose -f docker-compose.hyperscale.yml up --build
    ```
4.  **Erişim:**
    *   **Telsiz (Sesli):** `http://localhost:8000/radio` (Doğrudan port ile bağlanın, Nginx bazen sesi geciktirebilir).
    *   **Panel:** `http://localhost:3000`
