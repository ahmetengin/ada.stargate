
# 🏔️ Ada Stargate: Mountain Mode Setup (Survival Kit)

Bu script, Ada sistemini **internet bağlantısı olmayan** ortamlarda (açık deniz, güvenli sığınak, dağ evi) çalıştırmak için gerekli yapay zeka modellerini önceden indirir.

**Kullanım:** İnternet bağlantınız varken bu scripti bir kez çalıştırın.

---

```bash
#!/bin/bash

# Renkler
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "    _    ____      _         "
echo "   / \  |  _ \    / \        "
echo "  / _ \ | | | |  / _ \       "
echo " / ___ \| |_| | / ___ \      "
echo "/_/   \_\____/ /_/   \_\     "
echo -e "${NC}"
echo -e "${GREEN}>>> ADA STARGATE: SURVIVAL KIT INSTALLER <<<${NC}"
echo "---------------------------------------------"
echo "Hedef: Tam Çevrimdışı Operasyon (Mountain Mode)"
echo "---------------------------------------------"

# 1. Docker Kontrolü
if ! command -v docker &> /dev/null
then
    echo -e "${RED}[HATA] Docker bulunamadı. Lütfen önce Docker Desktop'ı kurun.${NC}"
    exit 1
fi

# 2. Servisleri Başlat
echo -e "\n${BLUE}[1/4] Altyapı başlatılıyor (Docker)...${NC}"
docker-compose -f docker-compose.hyperscale.yml up -d ada-local-llm ada-redis ada-qdrant

echo "Servislerin ısınması bekleniyor (10sn)..."
sleep 10

# 3. Yerel LLM İndirme (Ollama - Gemma 2B)
echo -e "\n${BLUE}[2/4] Yerel Beyin (Gemma 2B) indiriliyor...${NC}"
echo "Bu işlem internet hızınıza bağlı olarak zaman alabilir (1.5 GB)."

if docker exec -it ada_local_llm ollama list | grep -q "gemma:2b"; then
    echo -e "${GREEN}[OK] Gemma 2B zaten yüklü.${NC}"
else
    docker exec -it ada_local_llm ollama pull gemma:2b
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[OK] Yerel Beyin hazır.${NC}"
    else
        echo -e "${RED}[HATA] Model indirilemedi.${NC}"
        exit 1
    fi
fi

# 4. Embedding Modeli İndirme (RAG için)
# Python container içinde huggingface modelini cache'e çeker.
echo -e "\n${BLUE}[3/4] Hafıza Modelleri (Embeddings) önbelleğe alınıyor...${NC}"

docker exec -it ada_core_hyperscale python -c "
from langchain_community.embeddings import HuggingFaceEmbeddings
print('Downloading all-MiniLM-L6-v2...')
try:
    embeddings = HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')
    print('SUCCESS: Model cached locally.')
except Exception as e:
    print(f'ERROR: {e}')
"

# 5. Doğrulama
echo -e "\n${BLUE}[4/4] Sistem Doğrulaması...${NC}"

# Test Ollama
RESPONSE=$(curl -s -X POST http://localhost:11434/api/generate -d '{
  "model": "gemma:2b",
  "prompt": "Say System Online",
  "stream": false
}')

if [[ $RESPONSE == *"System Online"* ]]; then
    echo -e "${GREEN}[TEST] Yerel Zeka: AKTİF${NC}"
else
    echo -e "${RED}[TEST] Yerel Zeka: YANIT YOK${NC}"
fi

echo -e "\n---------------------------------------------"
echo -e "${GREEN}✅ MOUNTAIN MODE HAZIR${NC}"
echo "Artık internet kablosunu çekebilirsiniz."
echo "Ada yerel zeka ile çalışmaya devam edecektir."
echo "---------------------------------------------"
```
