
# 🧠 Ada Stargate: Agentic Workflow Definition

This directory contains the **Cognitive Blueprint** for Ada Stargate.
It decouples the *intelligence* definitions from the *application code*.

## 📂 Structure

- **`agents/`**: The specialized personas. Each file (`marina.md`, `finance.md`) is a System Prompt + Tool Config.
- **`skills/`**: The executable logic. These are Python scripts (formerly "Workers") that perform deterministic tasks.
- **`commands/`**: Output templates for structured responses (Reports, Receipts).
- **`hooks/`**: The nervous system. Scripts that run automatically on system events (Startup, Error, Log).

## 🚀 How to Use

1. **Bootstrap:** The `backend/main.py` (FastAPI) loads these definitions at startup.
2. **Routing:** The `architecture_graph.py` uses the `agents/` definitions to build the LangGraph nodes dynamically.
3. **Execution:** When an agent needs to calculate, it executes the script in `skills/`.

**"The World is Beautiful When Nodes Talk."**
