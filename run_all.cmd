@echo off
echo =======================================================
echo  Starting ShopSmart Full-Stack Application
echo =======================================================
start "ShopSmart Backend (Flask :5000)" cmd /k "run_backend.cmd"
timeout /t 3 /nobreak >nul
start "ShopSmart Frontend (Vite React :5173)" cmd /k "run_frontend.cmd"
echo Applications launched! Access at http://localhost:5173
pause
