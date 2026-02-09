
import os
import glob
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from qdrant_client import QdrantClient, models
from dotenv import load_dotenv

load_dotenv()
DOCS_DIR = "../docs"
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = "ada_memory"

print(f"🚀 Ingesting Knowledge Base (Hybrid Mode)...")

# 1. Connect to Qdrant
client = QdrantClient(url=QDRANT_URL)
client.recreate_collection(
    collection_name=COLLECTION_NAME, 
    vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE)
)

# 2. Initialize Local Embeddings (CPU optimized)
print("   -> Loading Local Embedding Model (all-MiniLM-L6-v2)...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# 3. Read Files
files = glob.glob(f"{DOCS_DIR}/**/*.md", recursive=True) + glob.glob(f"{DOCS_DIR}/**/*.json", recursive=True)
print(f"📄 Found {len(files)} documents.")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
points = []
point_id = 0

# 4. Process
for file_path in files:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            chunks = text_splitter.create_documents([content])
            
            for chunk in chunks:
                vector = embeddings.embed_query(chunk.page_content)
                
                points.append(models.PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "text": chunk.page_content, 
                        "source": os.path.basename(file_path)
                    }
                ))
                point_id += 1
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")

# 5. Upload
if points:
    client.upsert(collection_name=COLLECTION_NAME, points=points)
    print(f"✅ SUCCESS: {len(points)} memories implanted into {COLLECTION_NAME}.")
else:
    print("⚠️ No data found to ingest.")
