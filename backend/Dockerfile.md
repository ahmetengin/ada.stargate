
```dockerfile
# Use Python 3.11 slim image for smaller footprint but recent features
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# 1. Install System Dependencies (CRITICAL for Voice/FastRTC)
# - build-essential: For compiling some python packages
# - libasound2-dev: ALSA sound library (Linux Audio interface)
# - portaudio19-dev: Cross-platform audio I/O (Required by PyAudio/SoundDevice)
# - libportaudio2: Runtime library for PortAudio
# - libsndfile1: Reading/writing audio files (Required by SoundFile)
# - ffmpeg: Audio processing/conversion backbone (Required by Gradio/FastRTC)
RUN apt-get update && apt-get install -y \
    build-essential \
    libasound2-dev \
    portaudio19-dev \
    libportaudio2 \
    libsndfile1 \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# 2. Copy Requirements
COPY requirements.txt .

# 3. Install Python Dependencies
# Upgrade pip first to avoid binary incompatibility
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 4. Copy Application Code
COPY . .

# 5. Expose Ports
# 8000: Main FastAPI Application (Brain & API)
# 7860: FastRTC / Gradio Interface (Direct Voice Stream)
EXPOSE 8000
EXPOSE 7860

# 6. Run the Application
# We run main.py directly. It starts Uvicorn programmatically.
CMD ["python", "main.py"]
```
