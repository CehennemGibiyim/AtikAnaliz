# 🦅 AtikAnaliz — Hızla Analiz Et, Akılla Kazan

<div align="center">

<img src="https://img.shields.io/badge/Version-1.0.0-00E5A0?style=for-the-badge&logo=github"/>
<img src="https://img.shields.io/badge/Android-APK-3DDC84?style=for-the-badge&logo=android"/>
<img src="https://img.shields.io/badge/Windows-EXE-0078D4?style=for-the-badge&logo=windows"/>
<img src="https://img.shields.io/badge/iOS-IPA-000000?style=for-the-badge&logo=apple"/>
<img src="https://img.shields.io/badge/License-MIT-f0b90b?style=for-the-badge"/>

**Kripto para analiz, sinyal ve otomatik işlem platformu.**  
Binance · Bitget · Bybit · OKX — STOCHRSI · KDJ · MACD · Bollinger Bands

</div>

---

## ⬇️ Hızlı İndirme

<div align="center">

| Platform | İndir | Gereksinim |
|----------|-------|-----------|
| 🤖 **Android** | [📦 AtikAnaliz.apk](releases/AtikAnaliz.apk) | Android 8.0+ |
| 🖥️ **Windows** | [💿 AtikAnaliz-Setup.exe](releases/AtikAnaliz-Setup.exe) | Windows 10/11 |
| 🍎 **iOS** | [📱 AtikAnaliz.ipa](releases/AtikAnaliz.ipa) | iOS 14+ (AltStore) |

</div>

---

## 📋 İçindekiler

- [✨ Özellikler](#-özellikler)
- [📱 Android Kurulum](#-android-apk-kurulum)
- [🖥️ Windows Kurulum](#️-windows-exe-kurulum)
- [🍎 iOS Kurulum](#-ios-ipa-kurulum)
- [🔔 Arka Plan Bildirimleri](#-arka-plan-bildirimleri)
- [🔧 Geliştirici Kurulumu](#-geliştirici-kurulumu)
- [📡 API Ayarları](#-api-ayarları)
- [🤖 Telegram Bot Kurulumu](#-telegram-bot-kurulumu)

---

## ✨ Özellikler

```
📊 Gerçek Zamanlı Mum Grafikleri    🔔 Push + Telegram Bildirimleri
📡 STOCHRSI · KDJ · MACD · BB       🟢 Manuel Long/Short Emirleri  
🤖 Otomatik İşlem Motoru            ⚡ 12 Coin Eş Zamanlı Tarama
🛡️ Düşük/Orta/Yüksek Risk Filtresi  💼 Portföy & P&L Takibi
🌐 Binance · Bitget · Bybit · OKX   📱 Android + iOS + Windows
```

---

## 📱 Android APK Kurulum

### Adım 1 — APK'yı İndir
```
Releases sekmesine git → AtikAnaliz.apk → İndir
```

### Adım 2 — Bilinmeyen Kaynaklara İzin Ver
```
Ayarlar → Güvenlik → Bilinmeyen Kaynaklar → AÇ
(veya: Ayarlar → Uygulamalar → Özel Uygulama Erişimi → Bilinmeyen Uygulamalar)
```

### Adım 3 — APK Kur
```
Dosya Yöneticisi → AtikAnaliz.apk → Yükle → Aç
```

### Adım 4 — İzinleri Ver
```
✅ Bildirimler → İzin Ver
✅ İnternet → Otomatik
```

> ✅ Kurulum tamamlandı! Uygulama kapalı olsa bile bildirimler gelir.

---

## 🖥️ Windows EXE Kurulum

### Adım 1 — Kurulum Dosyasını İndir
```
Releases → AtikAnaliz-Setup.exe → İndir
```

### Adım 2 — Kur
```
AtikAnaliz-Setup.exe → Çift tıkla
"Windows PC'nizi korudu" uyarısı → "Daha fazla bilgi" → "Yine de çalıştır"
Kurulum sihirbazını takip et → Kur
```

### Adım 3 — Başlangıçta Otomatik Başlat (Opsiyonel)
```
Sistem Tepsisi → AtikAnaliz simgesi → Sağ tık → "Windows ile başlat" → AÇ
```

> ✅ Program arka planda çalışır, bildirimler sistem tepsisinden gelir.

---

## 🍎 iOS IPA Kurulum

> ⚠️ App Store dışı yükleme için **AltStore** gereklidir.

### Adım 1 — AltStore Kur (Bilgisayarda)
```
1. altstore.io → AltServer indir (Windows veya Mac)
2. AltServer'ı çalıştır
3. iPhone'u USB ile bağla → iTunes ile eşleştir
4. System Tray → AltStore → "Install AltStore" → iPhone'unu seç
5. Apple ID gir → Kur
```

### Adım 2 — IPA'yı Telefona Aktar
```
1. AtikAnaliz.ipa'yı iPhone'una AirDrop veya dosya aktarımı ile gönder
2. AltStore uygulamasını aç
3. "My Apps" → "+" → AtikAnaliz.ipa seç → Yükle
```

### Adım 3 — Güven Ayarı
```
Ayarlar → Genel → VPN ve Cihaz Yönetimi
→ Apple ID'niz → "Güven" → Onayla
```

> ⚠️ AltStore sertifikası her 7 günde yenilenir. Wi-Fi üzerinden otomatik yenilenir.

---

## 🔔 Arka Plan Bildirimleri

AtikAnaliz **üç farklı** bildirim sistemi destekler:

---

### 🅰️ Telegram Bot (Önerilen — Her platformda çalışır)

Uygulama tamamen kapalıyken bile bildirim gelir. Backend sunucusu sürekli tarar.

```bash
# 1. Telegram'da @BotFather'a yaz:
/newbot → İsim ver → Token kopyala

# 2. @userinfobot'a yaz → Chat ID'ni al

# 3. AtikAnaliz Ayarlar → Telegram → Token + Chat ID gir
```

---

### 🅱️ Lokal Python Arka Plan Motoru

Kendi bilgisayarında/telefonunda çalışır. İnternet bağlantısı yeterli.

```bash
# Kurulum:
pip install -r backend/requirements.txt

# Başlat:
python backend/scanner.py --telegram-token BOT_TOKEN --chat-id CHAT_ID

# Windows'ta arka planda (görünmez) çalıştır:
pythonw backend/scanner.py --telegram-token BOT_TOKEN --chat-id CHAT_ID

# Başlangıçta otomatik başlat (Windows):
scripts/windows-autostart.bat
```

---

### 🅲 Ücretsiz Bulut Sunucu (Railway/Render)

7/24 çalışır, bilgisayarını kapatsan bile.

```bash
# Railway (Önerilen):
1. railway.app → GitHub ile giriş
2. "New Project" → "Deploy from GitHub Repo"
3. AtikAnaliz reposunu seç → backend/ klasörünü seç
4. Variables ekle:
   TELEGRAM_TOKEN = senin_token
   CHAT_ID = senin_chat_id
   BINANCE_API = api_key (opsiyonel)
5. Deploy → 7/24 çalışır ✅

# Render (Alternatif):
1. render.com → New Web Service
2. GitHub repo bağla → Root: backend/
3. Build: pip install -r requirements.txt
4. Start: python scanner.py
5. Environment Variables ekle → Deploy
```

---

## 🔧 Geliştirici Kurulumu

### Gereksinimler
```
Node.js 18+     → nodejs.org
Python 3.10+    → python.org
Git             → git-scm.com
```

### Repoyu Klonla
```bash
git clone https://github.com/KULLANICI_ADIN/atik-analiz.git
cd atik-analiz
```

### Web Versiyonu (Tarayıcıda çalıştır)
```bash
cd mobile
npm install
npm start
# → http://localhost:3000
# Aynı Wi-Fi'den telefonda: http://192.168.X.X:3000
```

### Android APK Derle
```bash
# React Native kurulumu:
npm install -g react-native-cli
cd mobile
npm install

# Android Studio kurulumu gerekli (developer.android.com)
npx react-native run-android        # Test
cd android && ./gradlew assembleRelease  # APK üret
# APK: android/app/build/outputs/apk/release/
```

### Windows EXE Derle
```bash
cd desktop
npm install
npm run build         # React build
npm run make          # Electron Forge → .exe üretir
# EXE: desktop/out/make/squirrel.windows/
```

### iOS IPA Derle (Mac gerekli)
```bash
cd mobile
npm install
npx react-native run-ios            # Simulator test
# Xcode → Product → Archive → Distribute → IPA
```

### Backend (Python Tarama Motoru)
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# .env dosyasını düzenle (API anahtarları)
python scanner.py
```

---

## 📡 API Ayarları

### Binance
```
1. binance.com → Profil → API Yönetimi
2. "API Oluştur" → İsim ver
3. ✅ Okuma  ✅ Spot ve Marjin İşlemi  ✅ Vadeli İşlemler
4. ❌ Para Çekme (GÜVENLİK İÇİN AÇMAYIN)
5. IP Kısıtlaması ekle (opsiyonel ama önerilen)
```

### Bitget / Bybit / OKX
```
Benzer adımlar — sadece "Trade" ve "Read" izinleri yeterli
Withdrawal izni ASLA vermeyin
```

---

## 🤖 Telegram Bot Kurulumu

```
1. Telegram → @BotFather → /start → /newbot
2. Bot ismi: AtikAnaliz
3. Kullanıcı adı: atikanaliz_bot (benzersiz olmalı)
4. Token'ı kopyala → Ayarlar'a yapıştır

5. Chat ID için:
   → @userinfobot'a yaz → ID'ni gönderir
   → Grup için: grubu oluştur → botu ekle → @userinfobot'u ekle

6. Test: Ayarlar → Telegram → "Test Et" butonuna bas
```

---

## 📁 Proje Yapısı

```
atik-analiz/
├── 📱 mobile/              React Native (Android + iOS)
│   ├── src/
│   │   ├── App.jsx         Ana uygulama
│   │   ├── components/     Bileşenler
│   │   └── services/       API servisleri
│   ├── android/            Android native
│   ├── ios/                iOS native
│   └── package.json
│
├── 🖥️ desktop/             Electron (Windows)
│   ├── src/                React kaynak
│   ├── electron/           Electron main process
│   └── package.json
│
├── 🔔 backend/             Python Tarama Motoru
│   ├── scanner.py          Ana tarama döngüsü
│   ├── indicators.py       RSI, MACD, KDJ hesaplama
│   ├── notifier.py         Telegram + Push bildirim
│   ├── exchanges.py        Binance/Bitget/Bybit/OKX
│   ├── requirements.txt    Python paketleri
│   └── .env.example        Örnek ayar dosyası
│
├── 📦 releases/            Derlenmiş dosyalar
│   ├── AtikAnaliz.apk
│   ├── AtikAnaliz-Setup.exe
│   └── AtikAnaliz.ipa
│
├── 🛠️ scripts/             Kurulum ve başlatma scriptleri
│   ├── install-android.sh
│   ├── install-windows.bat
│   ├── windows-autostart.bat
│   └── deploy-railway.sh
│
└── README.md
```

---

## ⚠️ Risk Uyarısı

> Kripto para ticareti yüksek risk içerir. Bu uygulama yatırım tavsiyesi vermez.
> Tüm işlemler kullanıcının sorumluluğundadır. Kaybetmeyi göze alamayacağınız
> miktarlarla işlem yapmayın.

---

<div align="center">

**🦅 AtikAnaliz — Hızla Analiz Et, Akılla Kazan**

Made with ❤️ | MIT License

</div>
