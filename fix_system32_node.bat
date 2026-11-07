@echo off
chcp 65001 >nul
title Fix Node.js System32 Conflict

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Dang yeu cau quyen Administrator de xoa file trung lap trong System32...
    powershell -NoProfile -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

echo ===================================================
echo     DANG FIX LOI NODE.JS TRONG SYSTEM32
echo ===================================================
echo.

if exist "C:\Windows\System32\Node.js" (
    del /f /q "C:\Windows\System32\Node.js"
    echo [+] Da xoa file C:\Windows\System32\Node.js thanh cong!
) else (
    echo [-] Khong tim thay C:\Windows\System32\Node.js (Da duoc xoa truoc do).
)

if exist "C:\Windows\System32\Su" del /f /q "C:\Windows\System32\Su"
if exist "C:\Windows\System32\Tim" del /f /q "C:\Windows\System32\Tim"

echo.
echo ===================================================
echo  Kiem tra Node.js hien tai:
where node
node -v
echo ===================================================
echo  HOAN TAT! Ban co the chay "npm run dev" hoac "start.bat" binh thuong.
echo ===================================================
pause
