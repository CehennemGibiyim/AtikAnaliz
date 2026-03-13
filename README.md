# 🦅 AtikAnaliz - Kripto Sinyal ve Analiz Uygulaması

![AtikAnaliz Logo](https://via.placeholder.com/800x200/1a1a2e/16213e?text=AtikAnaliz+v2.0+-+Kripto+Analiz+Platformu)

**Gelişmiş kripto para sinyal ve analiz platformu** - Web, Mobil, Desktop destekli

[![GitHub stars](https://img.shields.io/github/stars/CehennemGibiyim/AtikAnaliz?style=social)](https://github.com/CehennemGibiyim/AtikAnaliz)
[![GitHub forks](https://img.shields.io/github/forks/CehennemGibiyim/AtikAnaliz?style=social)](https://github.com/CehennemGibiyim/AtikAnaliz)
[![GitHub issues](https://img.shields.io/github/issues/CehennemGibiyim/AtikAnaliz)](https://github.com/CehennemGibiyim/AtikAnaliz/issues)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌐 **Canlı Demo**
🔗 **[https://cehennemgibiyim.github.io/AtikAnaliz](https://cehennemgibiyim.github.io/AtikAnaliz)**

---

## 📋 **İçerik Tablosu**
- [🎯 Hakkında](#-hakkında)
- [✨ Özellikler](#-özellikler)
- [🚀 Kurulum](#-kurulum)
- [💻 Kullanım](#-kullanım)
- [📱 Platform Desteği](#-platform-desteği)
- [🔧 Ayarlar](#-ayarlar)
- [📊 Ekran Görüntüleri](#-ekran-görüntüleri)
- [🤝 Katkı](#-katkı)
- [📄 Lisans](#-lisans)

---

## 🎯 **Hakkında**

AtikAnaliz, kripto para traders'ları için tasarlanmış kapsamlı bir analiz ve sinyal platformudur. **Gerçek zamanlı veriler**, **gelişmiş teknik analiz**, **AI destekli sinyaller** ve **risk yönetimi** özelliklerini bir arada sunar.

### 🎯 **Kimler İçin?**
- ![Beginner](https://img.shields.io/badge/Seviye-Yeni Başlayan-28a745) Kripto para yatırımcıları
- ![Advanced](https://img.shields.io/badge/Seviye-İleri Düzey-007bff) Teknik analistler
- ![Pro](https://img.shields.io/badge/Seviye-Profesyonel-6f42c1) Day traders

---

## ✨ **Özellikler**

### 📊 **Teknik Analiz Araçları**
![Technical Analysis](https://img.shields.io/badge/Araçlar-Teknik%20Analiz-orange)
- 📈 **Gelişmiş Grafikler** - TradingView benzeri arayüz
- 🎯 **Ichimoku Cloud** - Tenkan, Kijun, Senkou span'ları
- 🌊 **Elliott Waves** - Otomatik dalga tespiti
- 📐 **Fibonacci Retracement** - Destek/direnç seviyeleri
- 📊 **Volume Profile** - POC ve Value Area analizi
- 🏗️ **Market Structure** - HH/HL/LH/LL tespiti

### 🤖 **AI ve ML Özellikleri**
![AI/ML](https://img.shields.io/badge/Teknoloji-AI%2FML-purple)
- 🧠 **Signal Performance Tracker** - Sinyal başarısı takibi
- ⚡ **Adaptive Signal Strength** - Dinamik sinyal gücü
- 🔮 **Neural Pattern Recognition** - Yapay sinir ağı
- 🎯 **ML Signal Optimizer** - Makine öğrenmesi optimizasyonu

### 💰 **Trading Entegrasyonu**
![Trading](https://img.shields.io/badge/Entegrasyon-Trading-green)
- 🔗 **Binance API** - Gerçek zamanlı veri
- 🔐 **Secure Authentication** - API key yönetimi
- 📈 **Market/Limit Emirler** - Otomatik trading
- 🛡️ **TP/SL Otomasyonu** - Risk kontrolü
- ⚠️ **Risk Management** - Akıllı risk skorlama

### 📱 **Mobil Deneyim**
![Mobile](https://img.shields.io/badge/Platform-Mobil-blue)
- 🎨 **3 Tema** - Dark/Light/Ocean
- 📏 **Font Boyutu Ayarı** - Kişiselleştirme
- 👆 **Dokunmatik Jestler** - Swipe, tap, pinch
- 📱 **Responsive Arayüz** - Tüm cihazlarda mükemmel
- 📳 **Haptic Feedback** - Dokunsal geri bildirim

### 🔔 **Bildirim Sistemi**
![Notifications](https://img.shields.io/badge/Sistem-Bildirimler-red)
- 🌐 **Web Push Bildirimleri** - Anlık uyarılar
- 📧 **Email Bildirimleri** - Detaylı raporlar
- 📋 **Bildirim Geçmişi** - Tüm uyarılar kaydedilir
- ⚙️ **Özelleştirilebilir** - Kişisel tercihler

---

## 🚀 **Kurulum**

### 🔧 **Gereksinimler**
![Requirements](https://img.shields.io/badge/Node.js-18+-green)
![Requirements](https://img.shields.io/badge/npm-8+-blue)
![Requirements](https://img.shields.io/badge/Git-latest-orange)

### 📦 **Hızlı Kurulum (5 dakika)**

```bash
# 1️⃣ Repoyu klonla
git clone https://github.com/CehennemGibiyim/AtikAnaliz.git
cd AtikAnaliz

# 2️⃣ Bağımlılıkları yükle
npm install

# 3️⃣ Uygulamayı başlat
npm start
```

🎉 **Uygulamanız hazır!** → http://localhost:3000

### 🌐 **Alternatif Kurulum Seçenekleri**

#### **Web Tarayıcı (En Hızlı)**
```bash
npm start
# Tarayıcıda otomatik açılır: http://localhost:3000
```

#### **Windows Masaüstü Uygulaması**
```bash
# Geliştirme modu
npm run electron:dev

# Production build
npm run electron:build
# EXE dosyası: dist-electron/AtikAnaliz Setup 2.0.0.exe
```

#### **Android Mobil Uygulaması**
```bash
# Android projesi oluştur (ilk kez)
npm run android:init

# Build ve senkronizasyon
npm run android:sync

# APK derle
npm run android:build
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

#### **iOS Mobil Uygulaması (Mac gerekli)**
```bash
# iOS projesi oluştur (ilk kez)
npm run ios:init

# Build ve senkronizasyon
npm run ios:sync

# Xcode'da aç
npm run ios:open
=======
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
>>>>>>> 2ab529e5fd00fa7ca3a2f04486a4e4156a01d7c7
```

---

<<<<<<< HEAD
## 💻 **Kullanım**

### 🎯 **Hızlı Başlangıç**

1. **📊 Ana Panel**
   - Sol menüden coin seçin
   - Grafik üzerinde analiz yapın
   - Sinyalleri takip edin

2. **⚙️ Ayarlar**
   - API keys'i girin (Binance)
   - Bildirim tercihlerini ayarlayın
   - Tema ve görünümü kişiselleştirin

3. **📱 Mobil Kullanım**
   - Telefonunuzdan aynı adrese gidin
   - Ana ekrana ekleyerek uygulama gibi kullanın

### 🔑 **API Ayarları**

```javascript
// Binance API Keys (Binance hesabınızdan alın)
const API_CONFIG = {
  apiKey: "YOUR_BINANCE_API_KEY",
  secretKey: "YOUR_BINANCE_SECRET_KEY",
  testnet: true  // Test modu için true
};
```

### 📊 **Grafik Özellikleri**

| Özellik | Açıklama | Kullanım |
|---------|----------|----------|
| 📈 | Real-time grafik | Otomatik güncellenir |
| 🎯 | Sinyal noktaları | Al/sat tavsiyeleri |
| 📐 | Çizim araçları | Destek/direnç çizimi |
| 🔍 | Zoom & Pan | Detaylı analiz |

---

## 📱 **Platform Desteği**

### 🌐 **Web Platformları**
| Platform | URL | Durum |
|----------|-----|-------|
| 🏠 **Localhost** | http://localhost:3000 | ✅ Aktif |
| 🌍 **GitHub Pages** | https://cehennemgibiyim.github.io/AtikAnaliz | ✅ Aktif |
| ☁️ **Custom Domain** | Sizin domaininiz | ⚙️ Ayarlanabilir |

### 📱 **Mobil Platformlar**
| Platform | Dosya | Durum |
|----------|-------|-------|
| 🤖 **Android APK** | `android/app/build/outputs/apk/` | ✅ Derlenebilir |
| 🍎 **iOS IPA** | Xcode ile build | ✅ Derlenebilir |
| 📱 **PWA** | Web'den ana ekrana ekle | ✅ Destekli |

### 💻 **Desktop Platformlar**
| Platform | Dosya | Durum |
|----------|-------|-------|
| 🪟 **Windows EXE** | `dist-electron/` | ✅ Derlenebilir |
| 🍎 **macOS DMG** | Electron build | ⚙️ Ayarlanabilir |
| 🐧 **Linux DEB** | Electron build | ⚙️ Ayarlanabilir |

---

## 🔧 **Ayarlar ve Yapılandırma**

### ⚙️ **Environment Variables**

```bash
# .env dosyası oluşturun
REACT_APP_BINANCE_API_KEY=your_api_key
REACT_APP_BINANCE_SECRET_KEY=your_secret_key
REACT_APP_ENVIRONMENT=development
```

### 🎨 **Tema Ayarları**

```javascript
// Tema seçenekleri
const THEMES = {
  dark: "Karanlık Tema",
  light: "Açık Tema", 
  ocean: "Okyanus Tema"
};
```

### 📧 **Bildirim Ayarları**

```javascript
// Bildirim tipleri
const NOTIFICATION_TYPES = {
  price_alert: "Fiyat Uyarıları",
  signal_alert: "Sinyal Bildirimleri",
  risk_alert: "Risk Uyarıları",
  position_alert: "Pozisyon Bildirimleri"
};
```

---

## 📊 **Ekran Görüntüleri**

### 🖥️ **Ana Arayüz**
![Ana Arayüz](https://via.placeholder.com/800x600/1a1a2e/ffffff?text=AtikAnaliz+Ana+Panel)
*Kripto para analizi ve sinyal takibi*

### 📱 **Mobil Görünüm**
![Mobil Arayüz](https://via.placeholder.com/375x667/1a1a2e/ffffff?text=AtikAnaliz+Mobil)
*Responsive mobil tasarım*

### ⚙️ **Ayarlar Paneli**
![Ayarlar](https://via.placeholder.com/800x600/1a1a2e/ffffff?text=Ayarlar+ve+Yapılandırma)
*API ve bildirim ayarları*

---

## 🤝 **Katkı**

Katkıda bulunmak isterseniz:

### 📝 **Geliştirme Süreci**

1. **Fork** yapın
2. **Feature branch** oluşturun: `git checkout -b feature/yeni-ozellik`
3. **Değişiklikleri commit** edin: `git commit -m 'Yeni özellik eklendi'`
4. **Push** yapın: `git push origin feature/yeni-ozellik`
5. **Pull Request** oluşturun

### 🐛 **Bug Report**

```bash
# Issue açarken şablon kullanın
- Başlık: [BUG] Hatanın kısa açıklaması
- Adımlar: Hatanın tekrarlanma adımları
- Beklenen: Beklenen davranış
- Gerçekleşen: Gerçekleşen davranış
```

### 💡 **Feature Request**

```bash
# Yeni özellik önerisi
- Başlık: [FEATURE] Özellik adı
- Açıklama: Özelliğin ne yapacağı
- Kullanım senaryosu: Nasıl kullanılacak
```

---

## 📄 **Lisans**

Bu proje **MIT License** altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyin.

---

## 🙏 **Teşekkürler**

- 📊 **TradingView** - Grafik kütüphanesi ilhamı
- 🌐 **Binance** - API desteği için
- 🎨 **React** - Framework desteği
- 📱 **Capacitor** - Cross-platform mobil desteği

---

## 📞 **İletişim**

- 👤 **Geliştirici**: Mustafa UYGUR (CehennemGibiyim)
- 📧 **Email**: cehennemgibiyim@gmail.com
- 🐙 **GitHub**: [@CehennemGibiyim](https://github.com/CehennemGibiyim)
- 🌐 **Proje**: [AtikAnaliz](https://github.com/CehennemGibiyim/AtikAnaliz)

---

## 🚀 **Gelecek Planları**

### 📋 **Roadmap v2.1**
- [ ] 📈 Daha fazla borsa entegrasyonu
- [ ] 🤖 Gelişmiş AI sinyalleri
- [ ] 📊 Portföy yönetimi
- [ ] 🌍 Çoklu dil desteği

### 📋 **Roadmap v3.0**
- [ ] 🏦 Banka entegrasyonu
- [ ] 📰 Haber akışı
- [ ] 👥 Sosyal trading
- [ ] 📈 Backtesting platformu

---

<div align="center">

## 🦅 **AtikAnaliz - Hızla Analiz Et, Akılla Kazan!**

![Star](https://img.shields.io/github/stars/CehennemGibiyim/AtikAnaliz?style=social) 
![Fork](https://img.shields.io/github/forks/CehennemGibiyim/AtikAnaliz?style=social)
![Watch](https://img.shields.io/github/watchers/CehennemGibiyim/AtikAnaliz?style=social)

**⭐ Bu projeyi beğendiyseniz yıldızlamayı unutmayın!**

</div>
