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
```

---

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
