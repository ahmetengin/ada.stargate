# 🦠 The Nano Agent Pattern

**Philosophy:** "As simple as possible, but no simpler."

## 1. Overview
In the **Big 3 Architecture** (Orchestrator -> Expert -> Worker), the **Experts** do not need to be heavy, complex applications. They often just need:
1.  A specific System Prompt (Persona).
2.  Access to specific Python Functions (Skills).
3.  A short-term memory (Conversation History).

The **Nano Agent** is a minimalist class (under 100 lines of code) that satisfies these requirements without the overhead of LangChain or LangGraph.

## 2. Why Nano?
*   **Latency:** No overhead from complex graph traversals for simple tasks.
*   **Debuggability:** You can step through the `chat()` loop in a standard debugger. No "magic" callbacks.
*   **Portability:** A Nano Agent is just a Python file. It can be moved to a Lambda function, a Docker container, or a Raspberry Pi easily.

## 3. Integration with Ada
*   **Ada Router (LangGraph):** Handles the high-level state and routing.
*   **Ada Experts (Nano Agents):** 
    *   `ada.finance`: A Nano Agent with access to `parasut_client.py`.
    *   `ada.marina`: A Nano Agent with access to `kpler_client.py`.
*   **Workers:** The raw Python functions passed to the Nano Agents as `tools`.

## 4. The Loop
The Nano Agent utilizes the native `enable_automatic_function_calling` feature of the Google GenAI SDK.
1.  **Ingest:** User message.
2.  **Think:** LLM generates a tool call if needed.
3.  **Act:** SDK executes Python Function -> Sends Result back to LLM.
4.  **Observe:** LLM processes result.
5.  **Respond:** Final answer to user.

## 5. Migration Guide
To convert a heavy agent to a Nano Agent:
1.  Extract its tools into pure Python functions.
2.  Write a clean, markdown-based System Prompt.
3.  Instantiate `NanoAgent(name="MyExpert", tools=[my_tool], system=...)`.
