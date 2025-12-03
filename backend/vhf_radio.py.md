
```python
import sys
from fastrtc import ReplyOnPause, Stream, get_stt_model, get_tts_model
from loguru import logger
try:
    from backend.nano import NanoAgent
except ImportError:
    from nano import NanoAgent

# 1. Initialize Local Models (Speed)
# These run locally inside the Docker container using the libraries installed in Dockerfile
# Moonshine (STT) and Kokoro (TTS) are SOTA for speed.
stt_model = get_stt_model()
tts_model = get_tts_model()

# 2. Initialize the Voice Brain (Nano Agent)
# This connects to Gemini Flash Lite for "Thinking"
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
    4. Cümlelerini "Tamam" (Over) ile bitir.
    5. Asla matematik hesabı yapma, sadece operasyonel bilgi ver.
    """
)

# Logging config
logger.remove(0)
logger.add(sys.stderr, level="DEBUG")

def echo(audio):
    """
    The Voice Loop: Audio -> Text -> LLM -> Text -> Audio
    """
    # 1. Hear (Local STT)
    # Audio comes as (sample_rate, numpy_array)
    transcript = stt_model.stt(audio)
    
    # Filter out empty noise
    if not transcript or len(transcript.strip()) < 2: return
    
    logger.debug(f"🎤 Heard: {transcript}")
    
    # 2. Think (Cloud LLM)
    response_text = vhf_brain.chat(transcript)
    logger.debug(f"🤖 Spoke: {response_text}")
    
    # 3. Speak (Local TTS)
    # Streams audio chunks back to the browser via WebRTC
    for chunk in tts_model.stream_tts_sync(response_text):
        yield chunk

# 3. Initialize Stream
# Mode "send-receive" is crucial for 2-way audio
stream = Stream(
    ReplyOnPause(echo),
    modality="audio",
    mode="send-receive",
    ui_args={"title": "Ada VHF Radio (Channel 72)"}
)
```
