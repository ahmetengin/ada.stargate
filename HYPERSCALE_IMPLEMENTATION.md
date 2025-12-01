
# 🧠 Ada Stargate: Hyperscale & FastRTC Source Code

**BU DOSYA, SİSTEMİN ÇALIŞMASI İÇİN GEREKEN TÜM PYTHON KODLARINI İÇERİR.**
Otomatik dosya oluşturma hatasını aşmak için, lütfen aşağıdaki kod bloklarını belirtilen yollara manuel olarak kaydedin.

---

## 1. Paket Gereksinimleri

**Dosya Yolu:** `backend/requirements.txt`

```text
fastapi>=0.109.0
uvicorn>=0.27.0
pydantic>=2.6.0
python-dotenv>=1.0.1
google-genai>=0.3.0
httpx>=0.26.0
redis>=5.0.0
# Cognitive Stack (Beyin)
langgraph>=0.0.10
langchain-core
langchain-community
langchain-google-genai
qdrant-client
asyncpg
markdown
beautifulsoup4
# Voice Stack (Telsiz - FastRTC)
fastrtc>=0.1.0
gradio>=5.0.0
numpy
scipy
soundfile
loguru
```

---

## 2. Nano Agent (Hafif Zeka Çekirdeği)

Bu modül, ağır frameworklere girmeden Gemini ile en hızlı (low-latency) konuşmayı sağlar. Telsiz için gereklidir.

**Dosya Yolu:** `backend/nano.py`

```python
import os
import logging
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Logger Config
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nano_agent")

class NanoAgent:
    """
    Minimalist Agent Wrapper for Gemini 2.5 Flash.
    Designed for sub-second latency in voice loops.
    """
    def __init__(self, name: str, system_instruction: str):
        self.name = name
        # Initialize client with API KEY
        self.client = genai.Client(api_key=os.getenv("API_KEY"))
        # Flash-Lite or Flash for maximum speed
        self.model_name = "gemini-2.0-flash-lite-preview-02-05" 
        self.system_instruction = system_instruction

    def chat(self, user_input: str) -> str:
        """
        Sends a message to the model and returns the text response.
        """
        try:
            logger.info(f"[{self.name}] User: {user_input}")
            
            # Simple Generate Content
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=user_input,
                config=types.GenerateContentConfig(
                    system_instruction=self.system_instruction,
                    temperature=0.3, # Low temp for factual/protocol adherence
                    response_mime_type="text/plain"
                )
            )

            if response.text:
                logger.info(f"[{self.name}] Response: {response.text}")
                return response.text
            
            return "Anlaşılmadı, tamam."

        except Exception as e:
            logger.error(f"[{self.name}] Error: {e}")
            return "Sinyal zayıf, tekrar edin. Tamam."
```

---

## 3. VHF Telsiz Simülasyonu (FastRTC)

Bu kod, paylaştığınız videodaki "Local STT -> LLM -> Local TTS" mantığını uygular.

**Dosya Yolu:** `backend/vhf_radio.py`

```python
import sys
from fastrtc import ReplyOnPause, Stream, get_stt_model, get_tts_model
from loguru import logger
from backend.nano import NanoAgent

# 1. Initialize Local Models (Speed)
# Bu modeller ilk çalıştırmada indirilecektir.
stt_model = get_stt_model()  # moonshine/base (Speech-to-Text)
tts_model = get_tts_model()  # kokoro (Text-to-Speech)

# 2. Initialize Cloud Brain (Intelligence)
vhf_brain = NanoAgent(
    name="Ada.VHF",
    system_instruction="""
    ROL: West Istanbul Marina (WIM) VHF Telsiz Operatörü.
    İSİM: Ada.
    KANAL: 72.
    
    KURALLAR:
    1. Kısa, net ve denizcilik jargonuna (SMCP) uygun konuş.
    2. Cevaplarını Türkçe ver (İstanbul Türkçesi).
    3. Asla emoji veya markdown kullanma. Sadece düz metin.
    4. Cümlelerini "Tamam" (Over) veya "Dinlemede kalın" gibi telsiz prosedürüne uygun bitir.
    5. Kaptan sana "Burası Phisedelia" derse, "Hoşgeldin Phisedelia" de.
    
    SENARYO:
    Kaptanlar yanaşma izni, yakıt durumu veya hava durumu sorabilir.
    """
)

logger.remove(0)
logger.add(sys.stderr, level="DEBUG")

def echo(audio):
    """
    The Core Loop: Audio -> Text -> LLM -> Text -> Audio
    """
    # 1. Speech to Text (Local - Moonshine)
    transcript = stt_model.stt(audio)
    logger.debug(f"🎤 Transcript: {transcript}")
    
    if not transcript or len(transcript.strip()) < 2:
        return # Ignore noise
        
    # 2. Think (Cloud - Gemini via NanoAgent)
    response_text = vhf_brain.chat(transcript)
    logger.debug(f"🤖 Response: {response_text}")
    
    # 3. Text to Speech (Local - Kokoro)
    for audio_chunk in tts_model.stream_tts_sync(response_text):
        yield audio_chunk

# 3. Create Stream
# ReplyOnPause: Detects when user stops speaking (VAD) and triggers the handler.
stream = Stream(
    ReplyOnPause(echo),
    modality="audio",
    mode="send-receive",
    ui_args={"title": "Ada VHF Radio (Channel 72) - FastRTC"}
)

if __name__ == "__main__":
    # Test Launch
    stream.ui.launch(server_name="0.0.0.0", server_port=7860)
```

---

## 4. Bilişsel Beyin (LangGraph)

Bu dosya, Ada'nın karar verme mekanizmasıdır. Hesaplama, Hukuk ve Genel Sohbet arasında rotalama yapar.

**Dosya Yolu:** `backend/architecture_graph.py`

```python
import os
import operator
import re
from typing import Annotated, TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    context: Dict[str, Any]
    intent: str
    next_node: str
    final_response: str

# --- NODES ---

async def router_node(state: AgentState):
    """Kullanıcının niyetini anlar."""
    msg = state['messages'][-1].content.lower()
    print(f"--- [ROUTER] Analyzing: {msg} ---")
    
    if "hesapla" in msg or "kaç para" in msg or "topla" in msg:
        return {"intent": "MATH", "next_node": "calculator"}
    if "kural" in msg or "yasa" in msg or "sözleşme" in msg:
        return {"intent": "LEGAL", "next_node": "rag_retriever"}
        
    return {"intent": "GENERAL", "next_node": "generator"}

async def calculator_node(state: AgentState):
    """Matematik işlemleri için Güvenli Python Hesaplayıcı."""
    print("--- [WORKER] Calculating ---")
    msg = state['messages'][-1].content
    # Basit bir regex ile sayıları ve işlemleri yakala
    expr = re.findall(r"[\d\+\-\*\/\.\(\) ]+", msg)
    
    result = "Hesaplayamadım."
    if expr:
        try:
            # Güvenlik için sadece belirli karakterler
            safe_expr = expr[0].strip()
            result = str(eval(safe_expr, {"__builtins__": None}, {}))
        except:
            result = "Hata."
            
    return {"final_response": f"**HESAPLAMA SONUCU:**\n`{result}`", "next_node": END}

async def rag_retriever_node(state: AgentState):
    """Vektör veritabanından bilgi çeker (Mock)."""
    print("--- [RAG] Searching Documents ---")
    # Gerçek Qdrant entegrasyonu ingest.py ile yapılır. Burada simüle ediyoruz.
    return {"context": {"docs": "Marina Yönetmeliği Madde 5: Hız sınırı 3 deniz milidir."}, "next_node": "generator"}

async def generator_node(state: AgentState):
    """Nihai cevabı üretir."""
    print("--- [GENERATOR] Speaking ---")
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=API_KEY)
    
    # Context varsa ekle
    context_str = str(state.get("context", ""))
    
    messages = state['messages']
    if context_str:
        messages.append(HumanMessage(content=f"SYSTEM CONTEXT: {context_str}"))
        
    res = await llm.ainvoke(messages)
    return {"final_response": res.content, "next_node": END}

# --- GRAPH BUILDER ---

def build_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("router", router_node)
    workflow.add_node("calculator", calculator_node)
    workflow.add_node("rag_retriever", rag_retriever_node)
    workflow.add_node("generator", generator_node)
    
    workflow.set_entry_point("router")
    
    workflow.add_conditional_edges(
        "router",
        lambda x: x["next_node"],
        {
            "calculator": "calculator",
            "rag_retriever": "rag_retriever",
            "generator": "generator"
        }
    )
    
    workflow.add_edge("calculator", END)
    workflow.add_edge("rag_retriever", "generator")
    workflow.add_edge("generator", END)
    
    return workflow.compile()
```

---

## 5. Main API (Giriş Kapısı)

Bu dosya, hem LangGraph beynini hem de FastRTC telsizini tek bir portta sunar.

**Dosya Yolu:** `backend/main.py`

```python
import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import gradio as gr
from langchain_core.messages import HumanMessage

# Importlar
# Hata almamak için try-except bloğu (Dosyalar henüz oluşturulmadıysa)
try:
    from backend.architecture_graph import build_graph
    from backend.vhf_radio import stream as radio_stream
except ImportError:
    # Lokal geliştirme ortamı için relative import fallback
    from architecture_graph import build_graph
    from vhf_radio import stream as radio_stream

app = FastAPI(title="Ada Stargate Hyperscale API", version="4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Beyni Yükle
brain_graph = build_graph()

class ChatRequest(BaseModel):
    prompt: str
    user_role: Optional[str] = "GUEST"
    context: Optional[Dict[str, Any]] = {}

@app.get("/health")
def health_check():
    return {"status": "ONLINE", "modules": ["LangGraph", "FastRTC", "Gemini"]}

@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    """
    React Frontend'den gelen metin tabanlı sohbet istekleri.
    """
    try:
        inputs = {
            "messages": [HumanMessage(content=request.prompt)],
            "context": request.context,
            "intent": "UNKNOWN",
            "next_node": "router",
            "final_response": ""
        }
        
        result = await brain_graph.ainvoke(inputs)
        
        return {
            "text": result.get("final_response", "System processing..."),
            "traces": [{"step": "FINAL", "content": "Processed by LangGraph"}]
        }
        
    except Exception as e:
        print(f"Graph Error: {e}")
        return {"text": f"Sistem Hatası: {str(e)}"}

# --- FAST RTC ENTEGRASYONU ---
# Telsiz arayüzünü /radio yoluna bağlar
# Erişim: http://localhost:8000/radio
app = gr.mount_gradio_app(app, radio_stream.ui, path="/radio")

if __name__ == "__main__":
    print("🚀 Ada Stargate Backend Başlatılıyor...")
    print("🧠 Brain: LangGraph Aktif")
    print("🎙️ Telsiz: FastRTC Aktif (/radio)")
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 6. Hafıza Yükleyici (Ingest)

**Dosya Yolu:** `backend/ingest.py`

```python
import os
import glob
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.http import models
from dotenv import load_dotenv

load_dotenv()

# Ayarlar
DOCS_DIR = "../docs"
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
API_KEY = os.getenv("API_KEY")

print(f"🚀 Hafıza Yükleme Başlatılıyor...")

# 1. Vektör DB Bağlantısı
client = QdrantClient(url=QDRANT_URL)
collection_name = "ada_memory"

client.recreate_collection(
    collection_name=collection_name,
    vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE),
)

# 2. Embedding Modeli
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=API_KEY)

# 3. Dosyaları Oku
files = glob.glob(f"{DOCS_DIR}/**/*.md", recursive=True)
print(f"📄 {len(files)} doküman bulundu.")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
points = []

for idx, file_path in enumerate(files):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        chunks = text_splitter.create_documents([content])
        
        for i, chunk in enumerate(chunks):
            vector = embeddings.embed_query(chunk.page_content)
            points.append(models.PointStruct(
                id=idx * 1000 + i,
                vector=vector,
                payload={"text": chunk.page_content, "source": file_path}
            ))

# 4. Yükle
if points:
    client.upsert(collection_name=collection_name, points=points)
    print(f"✅ {len(points)} hafıza parçası Qdrant'a yüklendi.")
```
