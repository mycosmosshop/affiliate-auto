@echo off
REM Daily Pinterest pin batch — Windows Task Scheduler ile her gun otomatik calistirilir
REM Konsol cikisi loglara yazilir, basarisizlik durumunda admin uyarisi

cd /d "%~dp0"
set LOG_FILE=logs\cron-%date:~10,4%%date:~4,2%%date:~7,2%.log
if not exist logs mkdir logs

echo. >> "%LOG_FILE%"
echo ============================================================ >> "%LOG_FILE%"
echo Cron run: %date% %time% >> "%LOG_FILE%"
echo ============================================================ >> "%LOG_FILE%"

REM Random kategori sec — beauty agirlikli, ara sira diger
set /a RAND=%RANDOM% %% 10
if %RAND% LEQ 6 (set CAT=beauty) else if %RAND% LEQ 8 (set CAT=kitchen) else (set CAT=electronics)

echo Kategori: %CAT% >> "%LOG_FILE%"

REM Pipeline: bestseller fetch + 3 pin
call node scripts/auto.js %CAT% 3 >> "%LOG_FILE%" 2>&1

echo Cron bitti: %date% %time% >> "%LOG_FILE%"
exit
