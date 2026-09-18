@echo off
title DASHBOARD MAPPE HOTEL
cd /d "%~dp0"

echo ========================================================
echo   Avvio Suite Mappe Hotel Analytics (Modalita' Locale)...
echo ========================================================
echo.

:: 1. Avvia e verifica il server locale su porta 8055
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch.ps1"

:: 2. Apertura del browser
echo Apertura Dashboard nel browser...
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" "http://127.0.0.1:8055"
) else if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://127.0.0.1:8055"
) else (
    start "" "http://127.0.0.1:8055"
)

echo Dashboard pronta su http://127.0.0.1:8055
ping 127.0.0.1 -n 2 >nul
exit
