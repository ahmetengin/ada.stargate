
```python
import json
import random

def get_live_weather(sensor_id: str = "WIM_MAIN") -> str:
    """
    Simulates reading from a local NMEA2000 weather station.
    """
    # In production, this connects to MQTT
    return json.dumps({
        "sensor_id": sensor_id,
        "wind_speed_knots": round(random.uniform(10, 15), 1),
        "wind_dir": "NW",
        "pressure_hpa": 1013,
        "humidity": 65,
        "alert_level": "GREEN"
    })

def control_pedestal(pedestal_id: str, action: str) -> str:
    """
    Sends command to smart pedestal (PLC).
    Action: ON / OFF / RESET
    """
    # Verify format
    if not pedestal_id.startswith("PED-"):
        return json.dumps({"status": "ERROR", "message": "Invalid ID format"})
        
    return json.dumps({
        "target": pedestal_id,
        "command": action.upper(),
        "status": "EXECUTED",
        "timestamp": "LIVE"
    })
```
