@echo off
echo ===================================================
echo     DubAI Viet Voice Cloning - Version 1.0
echo                 Installation Script
echo ===================================================
echo.

echo Checking Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Please install Node.js (https://nodejs.org) and try again.
    pause
    exit /b
)
echo Node.js is installed.

echo Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed! Please install Python 3.10+ (https://python.org) and make sure to add it to PATH.
    pause
    exit /b
)
echo Python is installed.

echo.
echo ===================================================
echo [1/3] Installing Frontend Dependencies...
echo ===================================================
cd frontend
call npm install
cd ..

echo.
echo ===================================================
echo [2/3] Setting up Backend (viXTTS)...
echo ===================================================
cd backend
if not exist "venv" (
    echo Creating virtual environment for viXTTS...
    python -m venv venv
)
echo Installing python packages for viXTTS...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
call deactivate
cd ..

echo.
echo ===================================================
echo [3/3] Setting up Backend-Omni (OmniVoice)...
echo ===================================================
cd backend-omni
if not exist "venv" (
    echo Creating virtual environment for OmniVoice...
    python -m venv venv
)
echo Installing python packages for OmniVoice...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
call deactivate
cd ..

echo.
echo ===================================================
echo Installation Complete!
echo ===================================================
echo You can now start the application by running start.bat
echo.
pause
