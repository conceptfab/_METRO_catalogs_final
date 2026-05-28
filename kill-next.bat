@echo off
echo Zatrzymywanie procesow Next.js...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\kill-next.ps1"
echo.
pause
