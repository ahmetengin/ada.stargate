
```python
import json
import math

def check_berth_suitability(vessel_loa: float, vessel_draft: float, berth_id: str) -> str:
    """
    Determines if a specific berth is physically safe for a vessel.
    """
    # Mock Database of Berths
    BERTH_SPECS = {
        "A-12": {"max_loa": 25.0, "depth": 5.5},
        "B-05": {"max_loa": 15.0, "depth": 3.0},
        "VIP-01": {"max_loa": 90.0, "depth": 8.0}
    }
    
    berth = BERTH_SPECS.get(berth_id)
    if not berth:
        return json.dumps({"status": "ERROR", "message": "Berth ID not found"})
        
    safety_margin_depth = 0.5 # meters under keel
    
    is_length_ok = vessel_loa <= berth["max_loa"]
    is_depth_ok = vessel_draft + safety_margin_depth <= berth["depth"]
    
    return json.dumps({
        "status": "OK" if (is_length_ok and is_depth_ok) else "UNSAFE",
        "checks": {
            "length_fit": is_length_ok,
            "depth_fit": is_depth_ok,
            "berth_capacity": berth
        }
    })

def find_nearest_tender(vessel_lat: float, vessel_lng: float, tenders: list) -> str:
    """
    Finds the closest idle tender using Haversine distance.
    """
    def haversine(lat1, lon1, lat2, lon2):
        R = 6371 # Earth radius km
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        a = math.sin(dLat/2) * math.sin(dLat/2) + \
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
            math.sin(dLon/2) * math.sin(dLon/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

    best_tender = None
    min_dist = float('inf')
    
    for tender in tenders:
        if tender['status'] != 'IDLE': continue
        
        dist = haversine(vessel_lat, vessel_lng, tender['lat'], tender['lng'])
        if dist < min_dist:
            min_dist = dist
            best_tender = tender
            
    if best_tender:
        return json.dumps({
            "status": "FOUND",
            "tender_id": best_tender['id'],
            "distance_km": round(min_dist, 2),
            "eta_minutes": round((min_dist / 30) * 60) # Assuming 30km/h avg speed
        })
    else:
        return json.dumps({"status": "NONE_AVAILABLE"})
```
