
# 🔧 Ada Stargate Environment Configuration

Bu dosya, projenin çalışması için gereken ortam değişkenlerini içerir.
Kullanmak için bu dosyanın içeriğini kopyalayıp ana dizinde `.env` isminde yeni bir dosya oluşturup içine yapıştırın.

---

## 🔑 AI & Cloud Anahtarları
# Google Gemini API Anahtarı (Zorunlu)
# Bu anahtar olmadan "Online" beyin (Gemini 2.5/3.0) çalışmaz.
# Almak için: https://aistudio.google.com/
API_KEY=AIzaSy...

---

## 🧠 Core Servisler (Docker İç Ağı)
# Aşağıdaki ayarlar `docker-compose.hyperscale.yml` dosyasındaki servis isimlerine göre ayarlanmıştır.
# Docker içinde çalıştığınız sürece bunları değiştirmenize gerek yoktur.

# Vector Database (Uzun Süreli Hafıza - RAG)
QDRANT_URL=http://ada-qdrant:6333

# Event Bus (Sinir Sistemi - Hızlı İletişim)
REDIS_URL=redis://ada-redis:6379

# Local LLM (Çevrimdışı Beyin - Ollama)
# İnternet kesildiğinde devreye giren yerel zeka.
OLLAMA_URL=http://ada-local-llm:11434

# IoT Broker (Duyu Organları - Sensörler)
# Rüzgar, Elektrik, Hareket sensörleri buraya konuşur.
MQTT_BROKER=ada-mqtt

---

## 🗄️ Veritabanı (Gerçekler)
# Faturalar, Kullanıcılar ve Ledger kayıtları burada tutulur.
POSTGRES_USER=ada
POSTGRES_PASSWORD=adapassword
POSTGRES_DB=wim_db
POSTGRES_HOST=ada-postgres
POSTGRES_PORT=5432

---

## ⚙️ Sistem Ayarları

# Debug Modu
# 'true' yapılırsa backend loglarında detaylı "Düşünce Zinciri" (Chain of Thought) görünür.
ADA_DEBUG=true

# Timezone (İstanbul/WIM)
TZ=Europe/Istanbul

# Mac M3 / Apple Silicon Optimizasyonu
# Eğer "exec format error" hatası alırsanız, Docker Desktop ayarlarından 
# "Use Rosetta for x86/amd64 emulation" seçeneğinin açık olduğundan emin olun.
