import json
import math

def check_berth_suitability(vessel_loa: float, vessel_draft: float, berth_id: str) -> str:
    """
    Determines if a specific berth is physically safe for a vessel.
    """
    # Mock Database of Berths (WIM Master Data)
    BERTH_SPECS = {
        "A-12": {"max_loa": 25.0, "depth": 5.5, "type": "FINGER"},
        "B-05": {"max_loa": 15.0, "depth": 3.0, "type": "STERN_TO"},
        "VIP-01": {"max_loa": 90.0, "depth": 8.0, "type": "ALONGSIDE"}
    }
    
    berth = BERTH_SPECS.get(berth_id)
    if not berth:
        return json.dumps({"status": "ERROR", "message": "Berth ID not found"})
        
    safety_margin_depth = 0.5 # meters under keel (Rule)
    
    is_length_ok = vessel_loa <= berth["max_loa"]
    is_depth_ok = vessel_draft + safety_margin_depth <= berth["depth"]
    
    return json.dumps({
        "status": "OK" if (is_length_ok and is_depth_ok) else "UNSAFE",
        "checks": {
            "length_fit": is_length_ok,
            "depth_fit": is_depth_ok,
            "berth_capacity": berth
        },
        "recommendation": "APPROVED" if (is_length_ok and is_depth_ok) else "DENIED"
    })

def calculate_wind_load(wind_speed_knots: float, wind_angle: float, vessel_area_lateral: float) -> str:
    """
    Calculates wind load on the vessel to determine bollard pull requirements.
    """
    # F = 0.5 * rho * v^2 * A * Cd
    rho = 1.225 # Air density
    v_ms = wind_speed_knots * 0.514444
    cd = 1.2 # Drag coefficient approx
    
    force_newtons = 0.5 * rho * (v_ms ** 2) * vessel_area_lateral * cd
    
    return json.dumps({
        "wind_speed_kn": wind_speed_knots,
        "force_newtons": round(force_newtons, 2),
        "required_bollard_pull_tons": round(force_newtons / 9806.65, 2) # Convert to Tons
    })
