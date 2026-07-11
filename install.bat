@echo off
chcp 65001 >nul
title Cai dat Chaos Studio (Voice Cloning)
echo ===================================================
echo     Chaos Studio - Trinh cai dat tu dong
echo ===================================================
echo.

REM ===================================================
REM  KIEM TRA VA CAI DAT PYTHON 3.10
REM ===================================================
echo [Kiem tra Python 3.10]...
set "PY310="

REM Thu tim Python 3.10 bang py launcher
py -3.10 --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PY310=py -3.10"
    echo => Tim thay Python 3.10 qua py launcher.
    goto :python_ok
)

REM Thu tim python3.10.exe truc tiep
where python3.10 >nul 2>&1
if %errorlevel% equ 0 (
    set "PY310=python3.10"
    echo => Tim thay python3.10 tren PATH.
    goto :python_ok
)

REM Thu tim trong cac duong dan thuong gap
for %%P in (
    "%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
    "%PROGRAMFILES%\Python310\python.exe"
    "%PROGRAMFILES(x86)%\Python310\python.exe"
    "C:\Python310\python.exe"
) do (
    if exist %%P (
        set "PY310=%%~P"
        echo => Tim thay Python 3.10 tai %%P
        goto :python_ok
    )
)

REM Khong tim thay -> Tu dong cai dat
echo.
echo => KHONG TIM THAY Python 3.10!
echo => Dang tu dong cai dat Python 3.10 qua winget...
echo    (Qua trinh nay co the mat vai phut)
echo.
winget install --id Python.Python.3.10 -e --source winget --accept-package-agreements --accept-source-agreements
if errorlevel 1 (
    echo.
    echo [LOI] Khong the tu dong cai dat Python 3.10.
    echo Vui long tai va cai dat thu cong tu: https://www.python.org/downloads/release/python-31011/
    echo QUAN TRONG: Nho tich vao o "Add Python to PATH" khi cai dat!
    pause
    exit /b
)

echo.
echo => Da cai dat Python 3.10 thanh cong!
echo => Dang lam moi PATH...

REM Lam moi PATH de nhan dien Python moi cai
set "PATH=%LOCALAPPDATA%\Programs\Python\Python310\;%LOCALAPPDATA%\Programs\Python\Python310\Scripts\;%PATH%"

REM Kiem tra lai sau khi cai
py -3.10 --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PY310=py -3.10"
    goto :python_ok
)

REM Thu duong dan mac dinh cua winget
if exist "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" (
    set "PY310=%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
    goto :python_ok
)

echo.
echo [LOI] Da cai dat nhung khong tim thay Python 3.10.
echo Vui long DONG CUA SO NAY va mo lai install.bat!
pause
exit /b

:python_ok
echo => Su dung: %PY310%
%PY310% --version
echo.

REM ===================================================
REM  KIEM TRA NODE.JS
REM ===================================================
echo [Kiem tra Node.js]...
node -v >nul 2>&1
if errorlevel 1 (
    echo => CANH BAO: Khong tim thay Node.js!
    echo => Dang thu tu dong cai dat Node.js qua winget...
    winget install --id OpenJS.NodeJS -e --source winget --accept-package-agreements --accept-source-agreements
    if errorlevel 1 (
        echo [LOI] Khong the tu dong cai dat Node.js. Vui long tai va cai dat thu cong tu https://nodejs.org
        pause
        exit /b
    )
    echo => Cai dat Node.js thanh cong!
    echo => Vui long DONG CUA SO NAY va mo lai install.bat de tiep tuc!
    pause
    exit /b
)
echo => Node.js da duoc cai dat.

REM ===================================================
REM  [1/3] CAI DAT FRONTEND
REM ===================================================
echo.
echo ===================================================
echo [1/2] Dang cai dat thu vien cho Frontend (Giao dien)...
echo ===================================================
cd frontend
call npm install
cd ..

REM ===================================================
REM  [2/2] CAI DAT BACKEND OmniVoice
REM ===================================================
echo.
echo ===================================================
echo [2/2] Dang cai dat Backend (OmniVoice)...
echo ===================================================
cd backend-omni

REM Kiem tra venv co ton tai va dung Python version khong
set "NEED_NEW_VENV=0"
if not exist "venv" (
    set "NEED_NEW_VENV=1"
) else (
    venv\Scripts\python.exe --version 2>nul | findstr /C:"3.10" >nul
    if errorlevel 1 (
        echo => Phat hien venv dang dung Python SAI version! Dang xoa va tao lai...
        rmdir /s /q venv
        set "NEED_NEW_VENV=1"
    )
)

if "%NEED_NEW_VENV%"=="1" (
    echo => Dang tao moi truong ao voi Python 3.10...
    %PY310% -m venv venv
    if errorlevel 1 (
        echo [LOI] Khong the tao moi truong ao. Kiem tra lai Python 3.10.
        pause
        exit /b
    )
)

echo => Dang cai dat cac thu vien Python cho OmniVoice...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo [CANH BAO] Co loi khi cai dat mot so thu vien.
    echo Thu cai dat lai cac thu vien chinh...
    pip install fastapi uvicorn python-multipart soundfile
    pip install torch torchaudio --extra-index-url https://download.pytorch.org/whl/cu130
    pip install omnivoice
)
call deactivate
cd ..

echo.
echo ===================================================
echo  HOAN TAT CAI DAT CHAOS STUDIO!
echo ===================================================
echo.
echo Ban co the chay file start.bat de khoi dong ung dung ngay bay gio.
echo.
pause
