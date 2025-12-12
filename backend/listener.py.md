import asyncio
import threading
from events import listen_for_inputs, publish_event
# Assuming architecture_graph is available in the same package context
from architecture_graph import build_hyperscale_graph
from langchain_core.messages import HumanMessage

def start_redis_listener():
    """
    Continuous loop that bridges Redis inputs to the LangGraph brain.
    """
    print("🧠 Ada Brain Listener Activated...")
    
    # Initialize the Graph
    brain = build_hyperscale_graph()
    
    # Listen to the "Nervous System" (Redis)
    for user_input in listen_for_inputs():
        print(f"📥 Received Input: {user_input}")
        
        # Create minimal state for the graph
        initial_state = {
            "messages": [HumanMessage(content=user_input)],
            "context": {},
            "intent": "UNKNOWN",
            "next_node": "router",
            "final_response": ""
        }
        
        # Run the Graph (Synchronously for this loop, or use asyncio.run)
        # In a real heavy-load scenario, this would be pushed to a Celery task
        try:
            # We use a helper to run the async graph in this sync generator loop
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            final_state = loop.run_until_complete(brain.ainvoke(initial_state))
            
            response_text = final_state.get("final_response", "Processing Error")
            
            # Speak back to the Nervous System
            publish_event("response", response_text)
            
        except Exception as e:
            print(f"🔥 Brain Error: {e}")
            publish_event("error", "An internal cognitive error occurred.")

if __name__ == "__main__":
    start_redis_listener()
