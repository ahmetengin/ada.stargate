
# 🧬 RAG Data Pipeline Strategy: From Frontend to Python Backend

**Objective:** Transform the static data assets (`.json`, `.md`, `.ts`) created for the React Frontend into a dynamic knowledge base for the Python/Gemini CLI Backend.

## 1. The Knowledge Sources (Input)

### A. Structured Data (The "Hard" Truth)
*   **Source:** `docs/ada.marina/WIM_MASTER_DATA.json`
*   **Content:** Pontoon capacities, Pricing formulas, Asset lists.
*   **Python Strategy:** 
    *   Load via `json.load()`.
    *   Use for **Function Calling** tools (e.g., `get_berth_price(loa, beam)`).
    *   *Do not* vector embed this directly; it's better used as a lookup table for zero-error calculations.

### B. Unstructured Data (The "Soft" Truth)
*   **Source:** `docs/ada.legal/*.md`, `docs/ada.sea/*.md`, `docs/ada.vhf/*.md`
*   **Content:** Contracts, Regulations, SMCP Protocols, COLREGs.
*   **Python Strategy:**
    *   **Chunking:** Split by `## Header` or Paragraph.
    *   **Embedding:** Use `GoogleGenerativeAIEmbeddings`.
    *   **Storage:** Vector DB (Chroma/Qdrant) or simple FAISS index.
    *   **Usage:** Semantic Search for "Policy" questions.

### C. Schemas (The Contract)
*   **Source:** `types.ts`
*   **Content:** Interfaces for `Invoice`, `VesselProfile`, `LogEntry`.
*   **Python Strategy:**
    *   Convert TS Interfaces -> Python **Pydantic Models**.
    *   Use with `gemini-pro` structured output mode to ensure the AI generates JSON that the Frontend can render without breaking.

---

## 2. The "Big 4" Ingestion Map

When the Python Backend initializes, it should ingest data into separate namespaces based on our architecture:

| Domain | Source Files | RAG Strategy |
| :--- | :--- | :--- |
| **Ada.Marina** | `WIM_MASTER_DATA.json` | JSON Lookup (SQL/Graph) |
| **Ada.Legal** | `WIM_CONTRACT_REGULATIONS.md`, `wim_kvkk.md` | Vector Search (High Precision) |
| **Ada.Sea** | `COLREGS_AND_STRAITS.md`, `turkish_maritime_guide.md` | Vector Search (General Knowledge) |
| **Ada.Voice** | `IMO_SMCP_STANDARD.md` | Few-Shot Prompting Examples |

---

## 3. Example Python Ingestion Snippet (Concept)

```python
# Concept code for future implementation
import json
from langchain.document_loaders import UnstructuredMarkdownLoader

def ingest_knowledge_base():
    # 1. Load Hard Facts
    with open("docs/ada.marina/WIM_MASTER_DATA.json") as f:
        master_data = json.load(f)
        print(f"Loaded {len(master_data['assets']['tenders'])} tenders.")

    # 2. Load Legal Knowledge
    loader = UnstructuredMarkdownLoader("docs/ada.legal/WIM_CONTRACT_REGULATIONS.md")
    docs = loader.load()
    # ... split and embed logic ...
    print("Legal vector store updated.")

if __name__ == "__main__":
    ingest_knowledge_base()
```
