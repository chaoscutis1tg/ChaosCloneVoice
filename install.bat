@echo off
title Cai dat Chaos Studio (Voice Cloning)
echo ===================================================
echo     Chaos Studio - Trinh cai dat tu dong
echo ===================================================
echo.

echo [Kiem tra Python]...
python --version >nul 2>&1
if errorlevel 1 (
    echo =^> CANH BAO: Khong tim thay Python!
    echo =^> Dang thu tu dong cai dat Python qua winget...
    winget install --id Python.Python.3.10 -e --source winget
    if errorlevel 1 (
        echo [LOI] Khong the tu dong cai dat Python. Vui long tai va cai dat thu cong tu https://python.org - Nho tich vao o "Add Python to PATH" luc cai dat
        pause
        exit /b
    )
    echo =^> Cai dat Python thanh cong! Vui long DONG CUA SO NAY va mo lai file install.bat!
    pause
    exit /b
)
echo =^> Python da duoc cai dat.

echo.
echo [Kiem tra Node.js]...
node -v >nul 2>&1
if errorlevel 1 (
    echo =^> CANH BAO: Khong tim thay Node.js!
    echo =^> Dang thu tu dong cai dat Node.js qua winget...
    winget install --id OpenJS.NodeJS -e --source winget
    if errorlevel 1 (
        echo [LOI] Khong the tu dong cai dat Node.js. Vui long tai va cai dat thu cong tu https://nodejs.org
        pause
        exit /b
    )
    echo =^> Cai dat Node.js thanh cong! Vui long DONG CUA SO NAY va mo lai file install.bat!
    pause
    exit /b
)
echo =^> Node.js da duoc cai dat.

echo.
echo ===================================================
echo [1/3] Dang cai dat thu vien cho Frontend (Giao dien)...
echo ===================================================
cd frontend
if not exist "node_modules\" (
    echo =^> Dang tai va cai dat thu vien Node.js...
    call npm install
) else (
    echo =^> Thu vien Frontend da ton tai. Dang kiem tra ban cap nhat...
    call npm install
)
cd ..

echo.
echo ===================================================
echo [2/3] Dang cai dat Backend (viXTTS)...
echo ===================================================
cd backend
if not exist "venv" (
    echo =^> Dang tao moi truong ao cho viXTTS...
    python -m venv venv
)
echo =^> Dang cai dat cac thu vien Python cho viXTTS...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
call deactivate
cd ..

echo.
echo ===================================================
echo [3/3] Dang cai dat Backend (OmniVoice)...
echo ===================================================
cd backend-omni
if not exist "venv" (
    echo =^> Dang tao moi truong ao cho OmniVoice...
    python -m venv venv
)
echo =^> Dang cai dat cac thu vien Python cho OmniVoice...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
call deactivate
cd ..

echo.
echo ===================================================
echo Hoan tat cai dat Chaos Studio!
echo ===================================================
echo Ban co the chay file start.bat de khoi dong ung dung ngay bay gio.
echo.
pause
