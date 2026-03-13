# 🦅 ATİKANALİZ — KURULUM REHBERİ
## Windows EXE + Android APK + iOS + Web (Tarayıcı) + GitHub Pages

---

## 📋 ÖNCE BUNLARI HAZIRLA (Tek seferlik)

### 1️⃣ Node.js Kur (ZORUNLU — tüm platformlar için)
→ https://nodejs.org → "LTS" sürümünü indir ve kur
→ Kurulum sonrası kontrol: `node -v` ve `npm -v` yaz, versiyon görünmeli

### 2️⃣ Proje klasörünü oluştur
```
C:\AtikAnaliz\   ← bu klasörü oluştur
```
Bu repo içindeki TÜM dosyaları bu klasöre koy.

---

## 🌐 A) WEB TARAYICI (En hızlı — 5 dakika)

Windows + Android + iOS'ta çalışır (aynı WiFi'deyseniz)

```cmd
cd C:\AtikAnaliz
npm install
npm start
```

→ Tarayıcı otomatik açılır: http://localhost:3000
→ Telefondan erişmek için: http://[BİLGİSAYARIN-IP]:3000
   (IP öğrenmek için: cmd → ipconfig → IPv4 adresi)

---

## 🌍 B) GITHUB PAGES DEPLOYMENT (Ücretsiz Hosting - 3 dakika)

Uygulamayı internete ücretsiz yayınla!

### Adım 1 — Build oluştur
```cmd
cd C:\AtikAnaliz
npm run build
```

### Adım 2 — GitHub Pages için homepage ekle
```cmd
# package.json dosyasına ekle:
"homepage": "https://cehennemgibiyim.github.io/AtikAnaliz"
```

### Adım 3 — Build'i GitHub'a yükle
```cmd
git add build/
git commit -m "Add build files"
git push origin main
```
### Adım 4 — GitHub Pages aktifleştir
1. GitHub reposunu aç: https://github.com/CehennemGibiyim/AtikAnaliz
2. Settings → Pages → Source: "Deploy from a branch"
3. Branch: "main" + "/ (root)" → Save
4. 2-3 dakika sonra site aktif: https://cehennemgibiyim.github.io/AtikAnaliz

---

## 🖥️ C) WINDOWS EXE KURULUMU

### Adım 1 — Bağımlılıkları yükle
```cmd
cd C:\AtikAnaliz
npm install
```

### Adım 2 — React uygulamasını derle
```cmd
npm run build
```
(2-3 dakika sürer, "build" klasörü oluşur)

### Adım 3 — EXE paketi oluştur
```cmd
npm run electron:build
```
(3-5 dakika sürer, Code signing hatası normaldir)

### Adım 4 — Kurulum dosyasını bul
```
C:\AtikAnaliz\dist-electron\AtikAnaliz Setup 2.0.0.exe
```
→ Bu dosyayı çalıştır → "AtikAnaliz Kurulum Sihirbazı" açılır
→ İleri → Klasör seç → Kur → Masa üstü kısayolu oluşturulur ✅

### Geliştirme modunda çalıştırma (hot-reload ile):
```cmd
npm run electron:dev
```

---

## 📱 D) ANDROID APK KURULUMU

### Ek Gereksinimler:
- Java JDK 17: https://adoptium.net → "Temurin 17" indir ve kur
- Android Studio: https://developer.android.com/studio → indir ve kur
  (Kurulum sırasında "Android SDK" seçili olsun)

### Adım 1 — Bağımlılıkları yükle
```cmd
cd C:\AtikAnaliz
npm install
```

### Adım 2 — React uygulamasını derle
```cmd
npm run build
```

### Adım 3 — Android projesini oluştur (İLK KEZ)
```cmd
npx @capacitor/cli add android
```

### Adım 4 — Android'e senkronize et
```cmd
npx @capacitor/cli sync android
```

### Adım 5 — APK derle
```cmd
cd android
./gradlew assembleDebug
```
(APK: `android\app\build\outputs\apk\debug\app-debug.apk`)

### Adım 6 — Telefona yükle
Seçenek A — USB ile:
```
Telefonu USB ile bağla → Dosyayı sürükle/bırak → Telefondan aç
```
Seçenek B — Komut satırıyla (ADB):
```cmd
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 🍎 E) iOS KURULUMU (Mac gerekli)

### Gereksinimler:
- macOS (Mac bilgisayar)
- Xcode: App Store'dan indir

### Adım 1 — React uygulamasını derle
```cmd
cd C:\AtikAnaliz
npm run build
```

### Adım 2 — iOS projesini oluştur (İLK KEZ)
```cmd
npx @capacitor/cli add ios
```

### Adım 3 — iOS'e senkronize et
```cmd
npx @capacitor/cli sync ios
```

### Adım 4 — Xcode'da aç
```cmd
npx @capacitor/cli open ios
```

### Adım 5 — Build ve çalıştır
1. Xcode'de target: "App" seçin
2. Device: iPhone 15 Simulator
3. ▶️ Play tuşuna bas
4. Archive → Distribute App ile IPA oluştur

---

## 🔧 SORUN GİDERME

### "npm not found" hatası
→ Node.js kurulu değil: nodejs.org'dan kur

### "JAVA_HOME not set" hatası (Android için)
→ JDK 17'yi kur
→ Sistem değişkeni ekle:
  - Denetim Masası → Sistem → Gelişmiş Sistem Ayarları → Ortam Değişkenleri
  - Yeni: JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot

### "SDK location not found" hatası (Android için)
→ Android Studio kur
→ local.properties dosyasını düzenle:
  `android\local.properties` → `sdk.dir=C:\\Users\\[KULLANICI]\\AppData\\Local\\Android\\Sdk`

### Port 3000 meşgul hatası
```cmd
npx kill-port 3000
npm start
```

### Electron penceresi açılmıyor
```cmd
npm run build
npm run electron:build
```
→ dist-electron klasöründeki .exe'yi çalıştır

---

## 📁 DOSYA YAPISI

```
C:\AtikAnaliz\
├── src\
│   ├── AtikAnaliz.jsx          ← Ana uygulama (v2.0 - Gelişmiş)
│   ├── components\             ← Yeni component'ler
│   │   ├── AuthSettings.jsx    ← Trading authentication
│   │   ├── RealTradingPanel.jsx ← Gerçek trading
│   │   ├── RiskManager.jsx     ← Risk yönetimi
│   │   ├── NotificationSystem.jsx ← Bildirimler
│   │   ├── AdvancedChart.jsx   ← Gelişmiş grafikler
│   │   ├── MLSignalPanel.jsx   ← AI/ML sinyaller
│   │   └── MobileOptimization.jsx ← Mobil optimizasyon
│   ├── api\
│   │   ├── binance.js          ← Binance API
│   │   ├── trading.js          ← Trading API
│   │   └── cors-proxy.js       ← CORS çözüm
│   ├── indicators\
│   │   └── advanced.js         ← Gelişmiş indikatörler
│   └── ml\
│       └── signalOptimizer.js  ← ML motoru
├── public\
│   └── index.html              ← HTML şablonu
├── build\                      ← Web build dosyaları
├── ios\                        ← iOS proje dosyaları
├── android\                    ← Android proje dosyaları
├── package.json                ← Proje yapılandırması
├── capacitor.config.ts         ← Capacitor yapılandırması
└── KURULUM.md                  ← Bu dosya
```

---

## 📲 MOBİL WEB UYGULAMASI (APK olmadan)

Eğer APK derlemek istemiyorsan, web versiyonunu telefona ana ekrana ekleyebilirsin:

1. `npm start` ile uygulamayı çalıştır
2. Bilgisayarın IP adresini öğren (cmd → ipconfig)
3. Telefonda Chrome/Safari'de `http://192.168.x.x:3000` aç
4. Sağ üst → "Ana Ekrana Ekle" → Uygulama gibi görünür ✅

---

## 🆕 V2.0 YENİLİKLER (TAM ÖZELLİKLİ)

### 🎯 Trading Entegrasyonu
✅ Gerçek Binance API bağlantısı
✅ API key authentication sistemi
✅ Market/Limit emirler
✅ TP/SL otomasyonu
✅ Risk management ve skorlama

### 🔔 Alert Sistemi
✅ Web push bildirimleri
✅ Email bildirimleri (hazır)
✅ Bildirim geçmişi ve yönetimi

### 📊 Gelişmiş Teknik Analiz
✅ Ichimoku Cloud (Tenkan/Kijun/Senkou)
✅ Elliott Waves tespiti
✅ Fibonacci Retracement
✅ Volume Profile (POC/Value Area)
✅ Market Structure analizi

### 🤖 AI/ML Özellikleri
✅ Signal Performance Tracker
✅ Adaptive Signal Strength
✅ Neural Pattern Recognition
✅ ML Signal Optimizer
✅ Akıllı sinyal geliştirme

### 📱 Mobil Deneyim
✅ 3 tema (Dark/Light/Ocean)
✅ Font boyutu ayarı
✅ Dokunmatik jestler (swipe/tap/pinch)
✅ Responsive mobil arayüz
✅ Haptic feedback

### 🚀 Platform Desteği
✅ Web (localhost + GitHub Pages)
✅ Windows EXE
✅ Android APK
✅ iOS (Mac + Xcode)
✅ Cross-platform mobil

---

## 🌐 DEPLOYMENT SEÇENEKLERİ

### ✅ HAZIR OLANLAR:
- **Local Web**: `npm start` → http://localhost:3000
- **GitHub Pages**: https://cehennemgibiyim.github.io/AtikAnaliz
- **Web Build**: `build/` klasörü hazır
- **iOS Project**: Xcode'de hazır
- **Android Project**: Gradle ile hazır

### ⚡ HIZLI DEPLOYMENT:
```bash
# GitHub Pages (ücretsiz)
npm run build
git add build/
git commit -m "Deploy to GitHub Pages"
git push origin main

# Android APK (Java gerekli)
cd android && ./gradlew assembleDebug

# iOS IPA (Xcode gerekli)
npx @capacitor/cli open ios
```

---

*AtikAnaliz v2.0 — Hızla Analiz Et, Akılla Kazan 🦅*
