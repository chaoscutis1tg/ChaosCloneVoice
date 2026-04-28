@echo off
echo ===================================================
echo     Cài đặt PyTorch CUDA
echo ===================================================
echo.

echo 1. Dang cai dat cho nhanh OmniVoice (backend-omni)...
cd backend-omni
call venv\Scripts\activate.bat
echo Dang go bo ban PyTorch CPU cu...
pip uninstall -y torch torchaudio
echo Dang tai va cai dat ban PyTorch ho tro GPU (CUDA)...
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu124
call deactivate
cd ..

echo.
echo 2. Dang cai dat cho nhanh viXTTS (backend)...
cd backend
call venv\Scripts\activate.bat
echo Dang go bo ban PyTorch CPU cu...
pip uninstall -y torch torchaudio
echo Dang tai va cai dat ban PyTorch ho tro GPU (CUDA)...
pip install torch==2.5.1 torchaudio==2.5.1 --extra-index-url https://download.pytorch.org/whl/cu124
call deactivate
cd ..


echo.
echo ===================================================
echo Hoan tat! Bay gio ban co the chay lai start.bat
echo ===================================================
pause
