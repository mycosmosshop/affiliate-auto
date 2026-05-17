@echo off
title Pinterest Affiliate Pipeline
cd /d "%~dp0"

:menu
cls
echo.
echo ============================================================
echo   PINTEREST AFFILIATE PIPELINE
echo ============================================================
echo.
echo   1.  Otomatik pipeline (beauty, 3 pin)
echo   2.  Buyuk batch (beauty, 5 pin)
echo   3.  Farkli kategori sec
echo.
echo   4.  Sadece urunleri yenile (Amazon scrape)
echo   5.  Sadece pin yayinla (mevcut urunler)
echo.
echo   6.  13 stilin onizlemesi (PNG, Pinterest yok)
echo   7.  Performans analizi (en iyi stili bul)
echo.
echo   8.  Pinterest oturum yenile (login)
echo   9.  Klasoru ac (uretilen pinler)
echo   D.  Pin taslaklarini temizle (Pinterest)
echo   R.  Pinterest trend pin arastirmasi (rakip analizi)
echo   T.  Trend beauty urunleri yukle (manuel kuratorlu liste)
echo   A.  AI composite pin (gpt-image-1, 0.04 USD/pin)
echo   C.  AI Collection pin (PIN 1 - Top Beauty Picks Over 40)
echo   K.  TikTok cross-post (son Pinterest pin'i TikTok video)
echo.
echo   0.  Cikis
echo.
echo ============================================================
set /p choice="Seciminiz: "

if "%choice%"=="1" goto auto
if "%choice%"=="2" goto auto5
if "%choice%"=="3" goto custom
if "%choice%"=="4" goto fetch
if "%choice%"=="5" goto pinonly
if "%choice%"=="6" goto preview
if "%choice%"=="7" goto analyze
if "%choice%"=="8" goto login
if "%choice%"=="9" goto folder
if /i "%choice%"=="D" goto cleanup
if /i "%choice%"=="R" goto research
if /i "%choice%"=="T" goto trending
if /i "%choice%"=="A" goto aipin
if /i "%choice%"=="C" goto collection
if /i "%choice%"=="K" goto tiktok
if "%choice%"=="0" exit
goto menu

:auto
echo.
echo Otomatik pipeline calistiriliyor (beauty, 3 pin)...
echo.
call node scripts/auto.js beauty 3
pause
goto menu

:auto5
echo.
echo Buyuk batch calistiriliyor (beauty, 5 pin)...
echo.
call node scripts/auto.js beauty 5
pause
goto menu

:custom
echo.
echo Kategoriler: beauty electronics kitchen fitness toys books baby pet garden tools fashion
echo.
set /p cat="Kategori: "
set /p npins="Pin sayisi (default 3): "
if "%npins%"=="" set npins=3
echo.
call node scripts/auto.js %cat% %npins%
pause
goto menu

:fetch
echo.
set /p cat="Kategori (default beauty): "
if "%cat%"=="" set cat=beauty
echo.
call node scripts/fetch-bestsellers.js %cat%
pause
goto menu

:pinonly
echo.
set /p npins="Pin sayisi (default 3): "
if "%npins%"=="" set npins=3
set /p stil="Stil (bos = random): "
echo.
set MAX_PINS=%npins%
if not "%stil%"=="" set PIN_STYLE=%stil%
call node pinterest-auto.js
set MAX_PINS=
set PIN_STYLE=
pause
goto menu

:preview
echo.
set /p idx="Urun index (default 0): "
if "%idx%"=="" set idx=0
echo.
call node scripts/preview-styles.js %idx%
start "" "preview-styles"
pause
goto menu

:analyze
echo.
echo Pin performansi analiz ediliyor...
echo.
call node scripts/analyze-stats.js
pause
goto menu

:login
echo.
echo Pinterest oturum yenile - eski session siliniyor...
if exist pinterest-session.json del pinterest-session.json
echo.
set MAX_PINS=1
call node pinterest-auto.js
set MAX_PINS=
pause
goto menu

:folder
start "" "tmp-pin-images"
goto menu

:cleanup
echo.
echo Pinterest pin taslaklari siliniyor (browser acilacak)...
echo.
call node scripts/cleanup-drafts.js
pause
goto menu

:research
echo.
set /p kw="Arama keyword (default 'beauty bestseller 2026'): "
if "%kw%"=="" set kw=beauty bestseller 2026
echo.
call node scripts/research-pins.js %kw%
pause
goto menu

:trending
echo.
echo Curated trend beauty urunleri yukleniyor...
echo.
choice /c YN /m "Eski products.json silinip trend urunlerle degistirilsin mi"
if errorlevel 2 (
  call node scripts/load-trending-beauty.js --append
) else (
  call node scripts/load-trending-beauty.js
)
echo.
choice /c YN /m "Trend urunler icin Pinterest'e pin yayinlansin mi"
if errorlevel 2 goto menu
set /p npins="Kac pin (default 10)? "
if "%npins%"=="" set npins=10
set MAX_PINS=%npins%
call node pinterest-auto.js
set MAX_PINS=
pause
goto menu

:aipin
echo.
echo AI composite pin (gpt-image-1)
echo Maliyet: yaklasik 0.04 USD per pin. OPENAI_API_KEY .env.local'de olmali.
echo.
set /p npins="Kac pin (default 1)? "
if "%npins%"=="" set npins=1
set PIN_STYLE=ai-composite
set MAX_PINS=%npins%
call node pinterest-auto.js
set PIN_STYLE=
set MAX_PINS=
pause
goto menu

:collection
echo.
echo Mevcut Collection Pinleri:
echo   1. Top Amazon Beauty Picks Over 40 (Olay, CeraVe, GrandeLASH, L'Oreal, Gua Sha)
echo   2. Beauty Finds Selling Out FAST (Sol de Janeiro, TATCHA, Beekman, Medicube)
echo.
set /p pinno="Hangi PIN (1 veya 2, default 1): "
if "%pinno%"=="" set pinno=1
if "%pinno%"=="1" set ASIN=B07Z182JNK
if "%pinno%"=="2" set ASIN=B013XKHA4M
echo.
echo Mod sec:
echo   1. HTML flat-lay (hizli, ucretsiz)
echo   2. AI composite (gpt-image-1, sticker'li, 0.04 USD)
echo.
set /p mod="Seciminiz (1 veya 2, default 2): "
if "%mod%"=="" set mod=2
echo.
echo [Adim 1/3] Amazon urun fotograflari scrape ediliyor (gercek high-res IMG_ID)...
call node scripts/enrich-product-images.js
echo.
echo [Adim 2/3] products.json guncelleniyor...
call node scripts/load-trending-beauty.js
echo.
echo [Adim 3/3] Pin yayinlaniyor (PIN %pinno%, ASIN %ASIN%)...
if "%mod%"=="2" (
  set PIN_STYLE=ai-composite
) else (
  set PIN_STYLE=collection-flatlay
)
set MAX_PINS=1
set PIN_PRODUCT_ASIN=%ASIN%
call node pinterest-auto.js
set PIN_STYLE=
set MAX_PINS=
set PIN_PRODUCT_ASIN=
set ASIN=
pause
goto menu

:tiktok
echo.
echo TikTok cross-post: Son Pinterest pin'ini MP4 video'ya cevirip TikTok'a yukler.
echo Ilk seferinde tarayicida TikTok login bekler (90 sn).
echo.
choice /c YN /m "Devam"
if errorlevel 2 goto menu
echo.
call node scripts/tiktok-cross-post.js
pause
goto menu
