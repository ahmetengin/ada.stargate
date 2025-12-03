
```python
import json
from decimal import Decimal, ROUND_HALF_UP

def calculate_mooring_fee(loa: float, beam: float, days: int, season: str = "HIGH") -> str:
    """
    Calculates the exact mooring fee based on WIM tariffs.
    Formula: Area (m2) * Base Rate * Season Multiplier * Days + VAT
    """
    try:
        # 1. Constants (Hard Rules)
        BASE_RATE = Decimal("1.50") # EUR per m2
        VAT_RATE = Decimal("0.20")
        
        SEASON_MULTIPLIERS = {
            "HIGH": Decimal("1.2"), # Summer
            "LOW": Decimal("0.8"),  # Winter
            "MID": Decimal("1.0")
        }
        
        # 2. Calculation
        area = Decimal(str(loa)) * Decimal(str(beam))
        multiplier = SEASON_MULTIPLIERS.get(season.upper(), Decimal("1.0"))
        
        net_daily = area * BASE_RATE * multiplier
        net_total = net_daily * Decimal(days)
        vat_amount = net_total * VAT_RATE
        gross_total = net_total + vat_amount
        
        # 3. Output
        return json.dumps({
            "status": "SUCCESS",
            "breakdown": {
                "loa": loa,
                "beam": beam,
                "area_m2": float(round(area, 2)),
                "days": days,
                "season_multiplier": float(multiplier),
                "base_rate": float(BASE_RATE)
            },
            "financials": {
                "net_total_eur": float(round(net_total, 2)),
                "vat_eur": float(round(vat_amount, 2)),
                "gross_total_eur": float(round(gross_total, 2))
            }
        })
    except Exception as e:
        return json.dumps({"status": "ERROR", "message": str(e)})

def calculate_late_penalty(overstay_days: int, vessel_area: float) -> str:
    """
    Calculates penalty for unauthorized overstay (Article H.3).
    Rate: 4 EUR per m2 per day.
    """
    PENALTY_RATE = Decimal("4.0")
    penalty = Decimal(overstay_days) * Decimal(str(vessel_area)) * PENALTY_RATE
    
    return json.dumps({
        "status": "SUCCESS",
        "penalty_eur": float(round(penalty, 2)),
        "reference": "Article H.3"
    })
```
