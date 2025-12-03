
```python
import sys
import json
import re
from typing import Dict, Any

# Import Skills directly (Zero Latency)
try:
    from backend.skills.registry import SKILL_REGISTRY
except ImportError:
    from skills.registry import SKILL_REGISTRY

class EdgeRouter:
    """
    Bu Router, internet olmadığında veya cihaz gücü düşük olduğunda (Raspberry Pi) devreye girer.
    LLM kullanmaz (veya çok az kullanır), bunun yerine Regex ve Anahtar Kelime eşleşmesi ile 
    doğrudan Python fonksiyonlarını (Skills) çağırır.
    
    HIZ: < 10ms
    BAĞIMLILIK: Sıfır
    """
    
    def __init__(self):
        print("🏔️ Mountain Mode Router Activated.")

    def route_and_execute(self, user_input: str) -> str:
        text = user_input.lower()
        
        # 1. Finansal Hesaplamalar
        if "bağlama" in text or "mooring" in text:
            # Regex ile sayıları yakala: "20 metre boy 5 metre en 3 gün"
            loa = re.search(r'(\d+)[.,]?\d*\s*(m|metre|loa)', text)
            beam = re.search(r'(\d+)[.,]?\d*\s*(m|metre|en|beam)', text)
            days = re.search(r'(\d+)\s*(gün|day)', text)
            
            if loa and beam:
                l_val = float(re.findall(r"[\d\.]+", loa.group(0))[0])
                b_val = float(re.findall(r"[\d\.]+", beam.group(0))[0])
                d_val = int(re.findall(r"\d+", days.group(0))[0]) if days else 1
                
                result = SKILL_REGISTRY["finance_calc_mooring"](l_val, b_val, d_val)
                return self._format_result(result)

        # 2. Denizcilik Kuralları (COLREGs)
        if "çatışma" in text or "colreg" in text or "geçiş" in text:
            # Basit kural tabanlı cevap
            return "EDGE: Çatışma riski durumunda sancak (sağ) tarafındaki tekneye yol ver. Hızını düşür."

        # 3. Sistem Kontrolü (IoT)
        if "pedestal" in text or "elektrik" in text:
            if "aç" in text or "on" in text:
                return SKILL_REGISTRY["iot_control_pedestal"]("PED-AUTO", "ON")
            if "kapat" in text or "off" in text:
                return SKILL_REGISTRY["iot_control_pedestal"]("PED-AUTO", "OFF")

        # Fallback
        return "Dağ modundayım. Sadece 'hesapla', 'kural' veya 'kontrol' komutlarını işleyebilirim."

    def _format_result(self, json_str: str) -> str:
        try:
            data = json.loads(json_str)
            if "financials" in data:
                fin = data["financials"]
                return f"HESAPLANDI:\nNet: €{fin['net_total_eur']}\nKDV: €{fin['vat_eur']}\nTOPLAM: €{fin['gross_total_eur']}"
            return str(data)
        except:
            return json_str

# Test
if __name__ == "__main__":
    router = EdgeRouter()
    print(router.route_and_execute("20m boyunda 5m eninde tekne için 3 günlük bağlama ücreti hesapla"))
```
