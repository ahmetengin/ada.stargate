
```python
import os
import glob
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.http import models
try:
    from backend.config import Config
except ImportError:
    from config import Config

DOCS_DIR = "../docs"

print(f"🚀 Ingesting Knowledge Base from: {DOCS_DIR}")

# 1. Connect to Qdrant
client = QdrantClient(url=Config.QDRANT_URL)

# 2. Reset Collection
client.recreate_collection(
    collection_name=Config.COLLECTION_NAME, 
    vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE)
)

# 3. Embeddings
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=Config.API_KEY)

# 4. Read Files
files = glob.glob(f"{DOCS_DIR}/**/*.md", recursive=True)
print(f"📄 Found {len(files)} documents.")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
points = []

# 5. Process
for idx, file_path in enumerate(files):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            chunks = text_splitter.create_documents([content])
            
            for i, chunk in enumerate(chunks):
                print(f"   -> Embedding chunk {i} from {os.path.basename(file_path)}")
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
    print(f"✅ SUCCESS: {len(points)} memory fragments implanted into Qdrant.")
else:
    print("⚠️ No data found to ingest.")
```
