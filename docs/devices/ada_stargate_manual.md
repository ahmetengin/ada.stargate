
# Ada Stargate Bilişsel İşletim Sistemi - Yönetim Kılavuzu

**Sürüm:** v5.1 (Cognitive Entity)
**Rol:** Marina ve Gemi İşletim Sistemi

---

## 🟢 SEVİYE 1: KULLANICI & MİSAFİR (User Guide)
*Misafirler, tekne sahipleri ve ofis personeli için.*

### Ada Nedir?
Ada, marina içindeki işlemleri, rezervasyonları ve soruları yöneten yapay zeka asistanıdır. Ona bir insan gibi soru sorabilirsiniz.

### Neler Yapabilirim?
*   "Hava durumu nasıl?"
*   "Misafir internet şifresi nedir?"
*   "Poem restoranda rezervasyon yap."
*   "Buggy (Golf aracı) çağır."

---

## 🟡 SEVİYE 2: KAPTAN & OPERASYON (Crew Guide)
*Kaptanlar, palamar ekibi ve ön büro için.*

### Operasyonel Komutlar
*   **Giriş/Çıkış:** "S/Y Phisedelia için kalkış izni istiyorum." (Ada finansal ve güvenlik kontrolü yapar).
*   **Teknik:** "Mavi Kart atık alımı istiyorum." (Ada atık teknesini yönlendirir ve bakanlığa bildirim yapar).
*   **Acil Durum:** "Ponton A'da yangın var!" (Ada, Guardian Protokolünü devreye sokar).

### VHF Telsiz Modu
Ada, Kanal 72 ve 16'yı dinler. Telsiz konuşmalarını otomatik olarak metne döker ve loglar.

---

## 🔴 SEVİYE 3: SİSTEM YÖNETİCİSİ (DevOps & IT)
*Sadece geliştiriciler ve IT personeli içindir.*

### Sistemi Başlatma (Restart)
Sistem donarsa veya güncellenmesi gerekirse:
```bash
docker-compose -f docker-compose.hyperscale.yml restart ada_core_hyperscale
```

### Hafıza Güncelleme (Learning)
`docs/` klasörüne yeni bir PDF veya kural eklendiğinde:
```bash
# Backend konteyneri içinde ingest scriptini tetikler
docker exec -it ada_core_hyperscale python ingest.py
```

### Logları İzleme (Debug)
Ada'nın ne düşündüğünü görmek için:
```bash
docker logs -f ada_core_hyperscale
```

---

## 🟣 SEVİYE 4: GENEL MÜDÜR (GM Guide)
*Stratejik ve finansal yönetim.*

### Kuralları Değiştirme (SEAL Protokolü)
Kod yazmaya gerek yoktur. Ada'ya emretmeniz yeterli:
*   *"Kural güncellemesi: Marina içi hız limiti artık 3 knot değil 5 knot."*
*   *"Politika değişimi: 20 metreden büyük teknelerden peşin ödeme alınacak."*
Ada bu kuralları öğrenir ve operasyonu buna göre günceller.

### Raporlama (Analytics)
*   *"Gelecek ay doluluk tahmini nedir?"* (TabPFN ile istatistiksel tahmin yapar).
*   *"Hangi teknelerin sigortası bitmek üzere?"* (Veritabanını tarar).
