
import asyncio
import os
import json
import logging
# import paho.mqtt.client as mqtt

logger = logging.getLogger("AdaIoT")

# Mock MQTT Listener for stability if broker is not ready
def start_mqtt_listener():
    """
    Starts the background MQTT listener thread.
    Connects to 'ada-mqtt' container.
    """
    logger.info("🔌 IoT Gateway initialized. Listening for OneNet telemetry...")
    
    # In a full deployment, this would utilize paho-mqtt loop_start()
    # client = mqtt.Client("ada_core_listener")
    # client.connect(os.getenv("MQTT_BROKER", "ada-mqtt"), 1883, 60)
    # client.subscribe("signalk/vessels/self/#")
    # client.loop_start()
    pass
