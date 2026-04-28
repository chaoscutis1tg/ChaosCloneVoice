@echo off
chcp 65001 >nul
title Chaos Studio - Voice Cloning

if not exist "frontend\node_modules\" (
    echo =^> Phát hiện chưa cài đặt Frontend. Đang tiến hành cài đặt tự động...
    call install.bat
)
if not exist "backend\venv\" (
    echo =^> Phát hiện chưa cài đặt Backend viXTTS. Đang tiến hành cài đặt tự động...
    call install.bat
)
if not exist "backend-omni\venv\" (
    echo =^> Phát hiện chưa cài đặt Backend OmniVoice. Đang tiến hành cài đặt tự động...
    call install.bat
)

echo Starting Chaos Studio Frontend...
start cmd /k "cd frontend && npm run dev"

echo Starting Chaos Studio Backend (viXTTS) on Port 8000...
start cmd /k "cd backend && call venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Chaos Studio Backend (OmniVoice) on Port 8001...
start cmd /k "cd backend-omni && call venv\Scripts\activate.bat && uvicorn main_omni:app --host 0.0.0.0 --port 8001 --reload"

echo Tất cả dịch vụ đã được khởi động! Tắt các cửa sổ đen để dừng ứng dụng.
pause
