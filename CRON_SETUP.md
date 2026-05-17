# Pinterest 24/7 Otomatik Pin — Windows Task Scheduler Kurulum

Her gün otomatik 3 pin yayını için Windows Task Scheduler'a görev ekle.

## Kurulum (5 dakika)

### 1. Görev Zamanlayıcı'yı aç
- `Win + R` → `taskschd.msc` → Enter
- Sağ panel: **"Görev Oluştur..."** (Create Task)

### 2. Genel sekmesi
- **Ad:** `Pinterest Daily Affiliate`
- **Açıklama:** `Her gün otomatik 3 Amazon affiliate pin yayını`
- ☑ **Kullanıcı oturum açmış olsun olmasın çalıştır**
- ☑ **En yüksek ayrıcalıklarla çalıştır**

### 3. Tetikleyiciler sekmesi → Yeni
- **Görevi başlat:** Programlanmış olarak
- **Ayarlar:** Günlük
- **Başlangıç:** Bugün, **09:00** (sabah saatleri Pinterest engagement'ı en yüksek)
- **Yinele:** Her 1 günde
- ☑ Etkin

### 4. Eylemler sekmesi → Yeni
- **Eylem:** Programı başlat
- **Program/komut dosyası:** `C:\Users\volka\OneDrive\Desktop\Yazılımlar\affiliate-auto\cron-daily-pins.bat`
- **Başlangıç (isteğe bağlı):** `C:\Users\volka\OneDrive\Desktop\Yazılımlar\affiliate-auto`

### 5. Koşullar sekmesi
- ☐ Bilgisayar AC gücüne bağlıyken başlat (laptop için aç)
- ☑ Görevi çalıştırmak için bilgisayarı uyandır

### 6. Ayarlar sekmesi
- ☑ Görevi istek üzerine çalıştırmaya izin ver
- ☑ Görev başarısız olursa yeniden başlat: **1 saatte 1 kez, 3 deneme**
- **Görev 2 saatten uzun çalışırsa durdur**

### 7. Tamam → Şifre iste → Windows hesap şifren

## Test et

Task Scheduler'da görev üstüne sağ tık → **Çalıştır**

`./logs/cron-YYYYMMDD.log` dosyasına bak → "Cron run: ..." görüyorsan çalışıyor.

## Frekans önerisi

| Strateji | Tetikleyici | Pin/gün | Risk |
|---|---|---|---|
| **Yavaş başlangıç** | 1×/gün, 09:00 | 3 | Düşük (önerilen ilk hafta) |
| **Normal** | 2×/gün, 09:00 + 19:00 | 6 | Düşük-orta |
| **Agresif** | 3×/gün, 09 + 14 + 20 | 9 | Orta — rate-limit riski |
| **Çok agresif** | Saat başı | 24+ | Yüksek — Pinterest engelleyebilir |

İlk **2 hafta yavaş başla** (3 pin/gün), sonra Pinterest hesabın "ısındıkça" arttır.

## Kategori rotasyonu

`cron-daily-pins.bat` random kategori seçiyor:
- %70 beauty
- %20 kitchen
- %10 electronics

Değiştirmek için `.bat` içindeki `RAND` mantığını düzenle.

## Bilgisayarın kapalıyken nasıl?

Windows Task Scheduler **bilgisayar uyandığında** çalıştırır (Koşullar → ☑ Görevi çalıştırmak için bilgisayarı uyandır). Tam kapalıysa atlar.

Alternatif: **VPS** (cloud server) — AWS/DigitalOcean'da küçük Linux VM, $5/ay, 7/24 açık.
