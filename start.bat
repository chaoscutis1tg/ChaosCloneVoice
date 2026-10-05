@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Chaos Studio - Voice Cloning

REM Uu tien duong dan Node.js chuan de tranh xung dot file System32
if exist "C:\Program Files\nodejs" set "PATH=C:\Program Files\nodejs;%PATH%"

REM Canh bao neu co file Node.js rac trong System32
if exist "C:\Windows\System32\Node.js" (
    echo [CANH BAO] Phat hien file C:\Windows\System32\Node.js dang chan lenh node!
    echo Ban co the chay file fix_system32_node.bat voi quyen Admin de xoa no.
    echo.
)

REM Kiem tra xem da cai dat chua, neu chua thi goi install
set "NEED_INSTALL=0"
if not exist "frontend\node_modules\" set "NEED_INSTALL=1"
if not exist "backend-omni\venv\" set "NEED_INSTALL=1"

REM Kiem tra Python version trong venv (phai la 3.10)
if exist "backend-omni\venv\Scripts\python.exe" (
    backend-omni\venv\Scripts\python.exe --version 2>nul | findstr /C:"3.10" >nul
    if errorlevel 1 (
        echo [!] Phat hien Backend dang dung Python sai version. Can cai dat lai...
        set "NEED_INSTALL=1"
    )
)

if "%NEED_INSTALL%"=="1" (
    echo ===================================================
    echo  Phat hien chua cai dat hoac cai dat chua dung.
    echo  Dang tien hanh cai dat tu dong...
    echo ===================================================
    echo.
    call install.bat
)

REM Kiem tra lai lan cuoi truoc khi start
if not exist "backend-omni\venv\Scripts\uvicorn.exe" (
    echo [LOI] Khong tim thay uvicorn trong backend-omni\venv.
    echo Vui long chay lai install.bat truoc!
    pause
    exit /b
)

echo.
echo ===================================================
echo  Dang khoi dong Chaos Studio...
echo ===================================================
echo.

echo [1/2] Starting Frontend...
start cmd /k "cd /d "%~dp0frontend" && set "PATH=C:\Program Files\nodejs;%PATH%" && npm run dev"

echo [2/2] Starting Backend OmniVoice (Port 8000)...
start cmd /k "cd /d "%~dp0backend-omni" && call venv\Scripts\activate.bat && uvicorn main_omni:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo ===================================================
echo  Tat ca dich vu da duoc khoi dong!
echo  - Frontend:        http://localhost:5173
echo  - Backend Omni:    http://localhost:8000
echo ===================================================
echo  Tat cac cua so den (CMD) de dung ung dung.
echo ===================================================
pause
