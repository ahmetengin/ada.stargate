import os
import redis
import json
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Redis Connection
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

try:
    r = redis.from_url(REDIS_URL, decode_responses=True)
    logger.info(f"Connected to Redis at {REDIS_URL}")
except Exception as e:
    logger.error(f"Failed to connect to Redis: {e}")
    r = None

def publish_event(event_type: str, payload: str):
    """
    Publishes an event to the 'ada_events' channel.
    The Go Gateway subscribes to this channel and broadcasts to WebSockets.
    """
    if not r:
        logger.warning("Redis not connected, skipping publish.")
        return

    message = json.dumps({
        "type": event_type,
        "payload": payload
    })
    
    try:
        r.publish("ada_events", message)
        logger.info(f"Published event: {event_type}")
    except Exception as e:
        logger.error(f"Error publishing to Redis: {e}")

def listen_for_inputs():
    """
    Generator that listens to 'ada_input' channel (from Go Gateway).
    Yields user messages to be processed by the Brain.
    """
    if not r:
        return

    pubsub = r.pubsub()
    pubsub.subscribe("ada_input")
    
    logger.info("Listening for inputs on 'ada_input'...")

    for message in pubsub.listen():
        if message['type'] == 'message':
            yield message['data']
