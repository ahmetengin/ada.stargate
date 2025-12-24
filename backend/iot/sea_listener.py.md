```python
import os
import json
import paho.mqtt.client as mqtt
import logging
import requests

# ⚓️ Configuration
MQTT_HOST = os.getenv("MQTT_BROKER_HOST", "ada-mqtt")
MQTT_PORT = 1883
TOPIC = "signalk/vessels/self/#"
BRAIN_ENDPOINT = "http://localhost:8000/api/v1/event"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AdaSeaReflex")

def on_connect(client, userdata, flags, rc):
    logger.info(f"Connected to OneNet Backbone. Senses Active. Code: {rc}")
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload)
        # Parse SignalK delta format
        if "updates" in data:
            for update in data["updates"]:
                for val_obj in update.get("values", []):
                    path = val_obj.get("path")
                    value = val_obj.get("value")
                    
                    # Reflexive Analysis (Refleksif Analiz)
                    check_reflexes(path, value)
    except Exception as e:
        logger.error(f"Error parsing telemetry: {e}")

def check_reflexes(path, value):
    """
    Reflexive Logic: Immediate detection of safety-critical thresholds.
    """
    # 1. Depth Hazard
    if path == "navigation.depth.belowTransducer" and value < 2.5:
        notify_brain("CRITICAL_DEPTH", f"Shallow water hazard: {value}m. Adjusting course support.")

    # 2. Wind Hazard (Gale Force)
    if path == "environment.wind.speedApparent" and value > 40.0:
        notify_brain("GALE_WARNING", f"Dangerous wind speed: {value} knots detected. Activating port lock protocol.")

    # 3. Security (Unauthorized Access)
    if path == "notifications.security.breach" and value == "alarm":
        notify_brain("SECURITY_BREACH", "Unauthorized vessel intrusion detected on Pontoon A.")

def notify_brain(event_type, message):
    """
    Pushes an 'Observation' to the LangGraph brain state.
    """
    logger.warning(f"🚨 [REFLEX ALERT] {event_type}: {message}")
    try:
        # Pushing to internal orchestrator
        # r.publish('ada_events', json.dumps({"severity": "critical", "type": event_type, "payload": message}))
        pass
    except Exception as e:
        logger.error(f"Failed to transmit reflex: {e}")

if __name__ == "__main__":
    client = mqtt.Client("ada_reflex_listener")
    client.on_connect = on_connect
    client.on_message = on_message

    logger.info(f"Ada Stargate: OneNet Listener starting on {MQTT_HOST}...")
    client.connect(MQTT_HOST, MQTT_PORT, 60)
    client.loop_forever()
```
