@echo off
chcp 65001 >nul
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║   🦅  ATİKANALİZ  KURULUM ASISTANI  v2.0   ║
echo  ╚══════════════════════════════════════════════╝
echo.

REM Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo  ❌ Node.js bulunamadı!
    echo  → https://nodejs.org adresinden LTS sürümünü indir ve kur
    echo  → Kurulum sonrası bu dosyayı tekrar çalıştır
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODEVER=%%i
echo  ✅ Node.js bulundu: %NODEVER%
echo.

:MENU
echo  Ne yapmak istersiniz?
echo.
echo  [1] 🌐 Web'de çalıştır (localhost:3000)
echo  [2] 🖥️  Windows EXE oluştur
echo  [3] 📱 Android APK için hazırla
echo  [4] ⚡ Hızlı başlat (geliştirici modu)
echo  [5] 📦 Bağımlılıkları yükle (npm install)
echo  [Q] Çıkış
echo.
set /p choice="  Seçiminiz: "

if /i "%choice%"=="1" goto WEB
if /i "%choice%"=="2" goto EXE
if /i "%choice%"=="3" goto ANDROID
if /i "%choice%"=="4" goto DEV
if /i "%choice%"=="5" goto INSTALL
if /i "%choice%"=="Q" exit /b 0
goto MENU

:INSTALL
echo.
echo  📦 Bağımlılıklar yükleniyor...
npm install
echo.
echo  ✅ Tamamlandı!
echo.
goto MENU

:WEB
echo.
echo  🌐 Web uygulaması başlatılıyor...
echo  → Tarayıcıda http://localhost:3000 açılacak
echo  → Durdurmak için CTRL+C
echo.
npm start
goto END

:DEV
echo.
echo  ⚡ Geliştirici modu başlatılıyor (Electron + React)...
npm run electron:dev
goto END

:EXE
echo.
echo  🖥️  Windows EXE oluşturuluyor...
echo  → Bu işlem 5-8 dakika sürebilir
echo.
npm run build
if %errorlevel% neq 0 (echo ❌ Build hatası! & pause & goto MENU)
npm run electron:build
if %errorlevel% neq 0 (echo ❌ Electron build hatası! & pause & goto MENU)
echo.
echo  ✅ EXE oluşturuldu!
echo  → Konum: dist-electron\AtikAnaliz Setup 2.0.0.exe
echo.
start explorer dist-electron
goto MENU

:ANDROID
echo.
echo  📱 Android hazırlığı...
echo.
echo  Gereksinimler:
echo  - Java JDK 17: https://adoptium.net
echo  - Android Studio: https://developer.android.com/studio
echo.
set /p andok="Bunlar kuruldu mu? (E/H): "
if /i "%andok%"=="H" (
    echo.
    echo  Önce KURULUM.md dosyasını okuyun!
    goto MENU
)
npm run build
npm run android:sync
echo.
echo  ✅ Android projesi hazır!
echo  Şimdi Android Studio'yu açıyor...
npm run android:open
goto MENU

:END
echo.
pause
