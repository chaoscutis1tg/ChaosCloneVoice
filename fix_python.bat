@echo off
echo ===================================================
echo     Fix Python Version cho OmniVoice
echo ===================================================
echo.
echo 1. Dang xoa moi truong ao (venv) cu...
cd backend-omni
rmdir /s /q venv

echo.
echo 2. Dang tao lai venv voi Python 3.11...
py -3.11 -m venv venv
if %errorlevel% neq 0 (
    echo [LOI] Khong tim thay Python 3.11 thong qua lenh 'py -3.11'. 
    echo Ban hay chac chan minh da cai dat Python 3.11.
    pause
    exit /b
)

echo.
echo 3. Dang cai dat cac thu vien co ban...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

echo.
echo 4. Dang cai dat PyTorch ho tro GPU (CUDA)...
pip uninstall -y torch torchaudio
pip install torch==2.5.1 torchaudio==2.5.1 --index-url https://download.pytorch.org/whl/cu124

call deactivate
cd ..

echo.
echo ===================================================
echo Xong! Ban hay chay lai start.bat nhe.
echo ===================================================
pause
