
# 🐳 Ada Stargate: Docker Deployment Guide

Bu ortamda sistem dosyaları oluşturulamadığı için, lütfen aşağıdaki dosyaları projenizin kök dizininde manuel olarak oluşturun.

## 1. Hazırlık: Dosya Yapısı

Projeniz şu yapıda olmalıdır:

```text
/Ada-Stargate
├── backend/
│   ├── Dockerfile          <-- (Aşağıdan kopyalayın)
│   ├── main.py
│   └── ...
├── nginx/
│   └── nginx.conf          <-- (Aşağıdan kopyalayın)
├── package.json            <-- (Aşağıdan kopyalayın)
├── vite.config.ts          <-- (Aşağıdan kopyalayın)
├── Dockerfile              <-- (Aşağıdan kopyalayın)
├── docker-compose.yml      <-- (Aşağıdan kopyalayın)
└── ...
```

---

## 2. Dosya İçerikleri

### 📄 Dosya 1: `package.json`
*(React uygulamasını derlemek için gereklidir)*

```json
{
  "name": "ada-stargate",
  "version": "4.6.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^0.14.0",
    "lucide-react": "^0.400.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-markdown": "^9.0.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.9",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.5.3",
    "vite": "^5.3.3"
  }
}
```

### 📄 Dosya 2: `vite.config.ts`
*(Vite yapılandırması)*

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://ada-core:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://ada-core:8000',
        changeOrigin: true,
        ws: true
      },
      '/radio': {
        target: 'http://ada-core:8000',
        changeOrigin: true
      }
    }
  }
});
```

### 📄 Dosya 3: `Dockerfile` (Frontend)
*(React uygulamasını derler ve Nginx ile sunar)*

```dockerfile
# Stage 1: Build React App
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# API Key'i build time'da gömmek için argüman
ARG API_KEY
ENV VITE_API_KEY=$API_KEY
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 📄 Dosya 4: `backend/Dockerfile`
*(Python Backend ve Ses Kütüphaneleri)*

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for Audio/FastRTC
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

# Run API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 📄 Dosya 5: `nginx/nginx.conf`
*(Gateway ve Reverse Proxy Ayarları)*

```nginx
events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;

        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        # API Proxy
        location /api/ {
            proxy_pass http://ada-core:8000/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # WebSocket Proxy
        location /ws/ {
            proxy_pass http://ada-core:8000/ws/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }

        # FastRTC / Radio Proxy
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

### 📄 Dosya 6: `docker-compose.yml`
*(Orkestrasyon Dosyası - Güncel)*

```yaml
version: '3.9'

services:
  ada-core:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: ada_core_hyperscale
    restart: always
    ports:
      - "8000:8000"
      - "7860:7860"
    environment:
      - API_KEY=${API_KEY}
      - REDIS_URL=redis://ada-redis:6379
      - QDRANT_URL=http://ada-qdrant:6333
      - MQTT_BROKER=ada-mqtt
    depends_on:
      - ada-redis
      - ada-qdrant
      - ada-mqtt
    volumes:
      - ./backend:/app
      - ./docs:/docs

  ada-frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - API_KEY=${API_KEY}
    container_name: ada_frontend_hyperscale
    restart: always
    ports:
      - "80:80" # Mac kullanıyorsanız "3000:80" yapın
    depends_on:
      - ada-core

  ada-qdrant:
    image: qdrant/qdrant
    container_name: ada_qdrant
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

  ada-postgres:
    image: postgres:15-alpine
    container_name: ada_postgres
    environment:
      POSTGRES_USER: ada
      POSTGRES_PASSWORD: adapassword
      POSTGRES_DB: wim_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  ada-redis:
    image: redis:alpine
    container_name: ada_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  ada-mqtt:
    image: eclipse-mosquitto:2
    container_name: ada_mqtt_broker
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - mqtt_data:/mosquitto/data
      - mqtt_log:/mosquitto/log

volumes:
  postgres_data:
  qdrant_data:
  redis_data:
  mqtt_data:
  mqtt_log:
```

---

## 3. Çalıştırma Komutu

Dosyaları oluşturduktan ve `.env` dosyanıza `API_KEY` ekledikten sonra terminalde:

```bash
docker-compose up --build
```

Bu işlem:
1.  React uygulamasını derler (`npm run build`).
2.  Python kütüphanelerini yükler.
3.  Tüm veritabanlarını ve servisleri başlatır.
4.  Uygulamayı `http://localhost` (veya Mac'te `http://localhost:3000`) adresinde sunar.
