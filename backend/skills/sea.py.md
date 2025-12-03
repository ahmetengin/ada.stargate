
```python
import json

def colregs_analysis(my_course: float, target_course: float, target_bearing: float) -> str:
    """
    Analyzes collision risk based on COLREGs Rule 15 (Crossing Situation).
    """
    # Normalize angles 0-360
    relative_bearing = (target_bearing - my_course) % 360
    
    situation = "UNKNOWN"
    action = "MONITOR"
    role = "GIVE_WAY" # Default safe
    
    # 1. Crossing
    if 0 < relative_bearing < 112.5: # Target on Starboard
        situation = "CROSSING_STARBOARD"
        action = "TURN_STARBOARD_PASS_ASTERN"
        role = "GIVE_WAY"
    elif 247.5 < relative_bearing < 360: # Target on Port
        situation = "CROSSING_PORT"
        action = "MAINTAIN_COURSE_SPEED"
        role = "STAND_ON"
        
    # 2. Overtaking (Target is overtaking us or we them - simplified)
    # ... (Overtaking logic would be more complex with speed vectors) ...
    
    return json.dumps({
        "rule": "COLREGs Rule 15",
        "situation": situation,
        "role": role,
        "recommended_action": action,
        "bearing_diff": relative_bearing
    })

def calculate_fuel_consumption(distance_nm: float, speed_knots: float, consumption_curve: str = "MOTOR_YACHT_24M") -> str:
    """
    Estimates fuel usage for a voyage.
    """
    # Mock Consumption Curves (Liters per Hour at Speed)
    curves = {
        "MOTOR_YACHT_24M": {8: 40, 10: 60, 15: 120, 20: 250},
        "SAILING_YACHT_50FT": {6: 4, 8: 8}
    }
    
    curve = curves.get(consumption_curve, {10: 50})
    
    # Find closest consumption point
    lph = 50
    for s, c in curve.items():
        if speed_knots <= s:
            lph = c
            break
            
    hours = distance_nm / speed_knots if speed_knots > 0 else 0
    total_fuel = hours * lph
    
    return json.dumps({
        "distance_nm": distance_nm,
        "speed_knots": speed_knots,
        "duration_hours": round(hours, 1),
        "fuel_consumption_liters": round(total_fuel, 1),
        "lph_used": lph
    })
```
