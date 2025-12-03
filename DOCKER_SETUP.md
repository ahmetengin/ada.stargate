# 🐳 Ada Stargate: Production Deployment Kit

Bu rehber, Ada Stargate'in "Big 3" mimarisini (Frontend, Backend, Database) Docker ile nasıl ayağa kaldıracağınızı anlatır.

## 1. Dizin Yapısı

Projenin kök dizininde şu komutu çalıştırarak gerekli klasörleri oluşturun:

```bash
mkdir -p backend/agents backend/workers backend/orchestrator nginx docs
```

## 2. Kurulum

### Adım 1: .env Dosyası
Kök dizinde `.env` dosyası oluşturun ve API anahtarınızı ekleyin:
```properties
API_KEY=AIzaSyYourGeminiKeyHere
```

### Adım 2: Backend Kodları
Aşağıdaki dosyaların `backend/` klasöründe olduğundan emin olun:
- `backend/requirements.txt`
- `backend/nano.py`
- `backend/vhf_radio.py`
- `backend/architecture_graph.py`
- `backend/ingest.py`
- `backend/main.py`
- `backend/Dockerfile`

### Adım 3: Çalıştır
Docker Compose ile tüm sistemi başlatın:

```bash
docker-compose -f docker-compose.hyperscale.yml up --build -d
```

## 3. Servisler

| Servis | URL | Açıklama |
| :--- | :--- | :--- |
| **Frontend** | `http://localhost:80` | Ana Yönetim Paneli (React) |
| **Backend API** | `http://localhost:8000/docs` | Swagger API Dokümantasyonu |
| **Telsiz (FastRTC)** | `http://localhost:8000/radio` | Sesli İletişim Arayüzü |
| **Qdrant** | `http://localhost:6333` | Vektör Veritabanı |

## 4. Hafıza Yükleme (RAG)

Sistemi başlattıktan sonra, `docs/` klasöründeki belgeleri Qdrant'a yüklemek için:

```bash
docker exec -it ada_core_hyperscale python backend/ingest.py
```

Bu işlem `docs/` altındaki `.md` dosyalarını okur, vektörleştirir ve hafızaya yazar.