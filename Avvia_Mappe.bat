@echo off
title DASHBOARD MAPPE HOTEL
cd /d "c:\Users\Edoardo\.gemini\antigravity\scratch\DASHBOARD_MAPPE"

echo ========================================================
echo   Avvio Suite Mappe Hotel Analytics (Modalita' Locale)...
echo ========================================================
echo.

:: 1. Verifica se il server locale e' attivo sulla porta 8080
powershell -NoProfile -Command "try { $c = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 8080); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Avvio del server Python locale...
    start "" "C:\Python314\pythonw.exe" "c:\Users\Edoardo\.gemini\antigravity\scratch\DASHBOARD_MAPPE\server.py"
    ping 127.0.0.1 -n 3 >nul
) else (
    echo Server locale gia' in esecuzione sulla porta 8080.
)

:: 2. Apertura immediata nel browser
echo Apertura Dashboard nel browser...
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" "http://127.0.0.1:8080"
) else if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://127.0.0.1:8080"
) else (
    start "" "http://127.0.0.1:8080"
)

echo.
echo Dashboard avviata con successo!
ping 127.0.0.1 -n 2 >nul
exit
