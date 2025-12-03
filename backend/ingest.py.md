
```python
import os
import glob
from langchain_text_splitters import RecursiveCharacterTextSplitter
# Use Local Embeddings instead of Google's to ensure vector DB works offline
from langchain_community.embeddings import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.http import models
try:
    from backend.config import Config
except ImportError:
    from config import Config

DOCS_DIR = "../docs"

print(f"🚀 Ingesting Knowledge Base (Hybrid Mode)...")

# 1. Connect to Qdrant
client = QdrantClient(url=Config.QDRANT_URL)

# 2. Reset Collection
# Standardizes vector size to 384 (MiniLM standard) instead of 768
client.recreate_collection(
    collection_name=Config.COLLECTION_NAME, 
    vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE)
)

# 3. Initialize Local Embeddings (CPU optimized)
# This downloads the model to the Docker container once and runs locally.
print("   -> Loading Local Embedding Model (all-MiniLM-L6-v2)...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# 4. Read Files
files = glob.glob(f"{DOCS_DIR}/**/*.md", recursive=True)
print(f"📄 Found {len(files)} documents.")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
points = []

# 5. Process
for idx, file_path in enumerate(files):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            chunks = text_splitter.create_documents([content])
            
            for i, chunk in enumerate(chunks):
                print(f"   -> Local Embedding chunk {i} from {os.path.basename(file_path)}")
                vector = embeddings.embed_query(chunk.page_content)
                
                points.append(models.PointStruct(
                    id=idx * 10000 + i,
                    vector=vector,
                    payload={
                        "text": chunk.page_content, 
                        "source": os.path.basename(file_path)
                    }
                ))
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")

# 6. Upload
if points:
    client.upsert(collection_name=Config.COLLECTION_NAME, points=points)
    print(f"✅ SUCCESS: {len(points)} hybrid memories implanted.")
else:
    print("⚠️ No data found to ingest.")
```
