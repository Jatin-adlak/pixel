@echo off

echo ========================================
echo 🚀 STARTING PIXEL PROJECT
echo ========================================

:: 🔥 KILL OLD PORTS (IMPORTANT)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do taskkill /F /PID %%a >nul 2>&1

timeout /t 2 > nul

:: ========================================
:: 🚀 START FACE SERVICE
:: ========================================
echo 🚀 Starting Face Service...

start cmd /k "cd /d C:\pixal\face_service && uvicorn backend.main:app --reload --host 127.0.0.1 --port 5001"

timeout /t 4 > nul

:: ========================================
:: 🚀 START DJANGO
:: ========================================
echo 🚀 Starting Django Backend...

start cmd /k "cd /d C:\pixal\pixel_backend && python manage.py runserver"

timeout /t 3 > nul

:: ========================================
:: 🚀 START REACT
:: ========================================
echo 🚀 Starting React Frontend...

start cmd /k "cd /d C:\pixal\Pixel && npm run dev"

echo ========================================
echo ✅ ALL SERVICES STARTED
echo ========================================

pause