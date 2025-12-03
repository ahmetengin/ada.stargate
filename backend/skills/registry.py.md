
```python
from backend.skills.finance import calculate_mooring_fee, calculate_late_penalty
from backend.skills.marina import check_berth_suitability, find_nearest_tender
from backend.skills.sea import colregs_analysis, calculate_fuel_consumption
from backend.skills.iot import get_live_weather, control_pedestal

# This dictionary is loaded by the Nano Agent / LangGraph 
# to allow the LLM to call functions by name.

SKILL_REGISTRY = {
    # Finance
    "finance_calc_mooring": calculate_mooring_fee,
    "finance_calc_penalty": calculate_late_penalty,
    
    # Marina Ops
    "marina_check_berth": check_berth_suitability,
    "marina_find_tender": find_nearest_tender,
    
    # Sea / Navigation
    "sea_colregs_check": colregs_analysis,
    "sea_fuel_calc": calculate_fuel_consumption,
    
    # IoT / Hardware
    "iot_get_weather": get_live_weather,
    "iot_control_pedestal": control_pedestal
}

def get_skill(name):
    return SKILL_REGISTRY.get(name)
```
