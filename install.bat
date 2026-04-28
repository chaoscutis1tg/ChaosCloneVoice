@echo off
chcp 65001 >nul
title Cài đặt Chaos Studio (Voice Cloning)
echo ===================================================
echo     Chaos Studio - Trình cài đặt tự động
echo ===================================================
echo.

echo [Kiểm tra Python]...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo =^> CẢNH BÁO: Không tìm thấy Python!
    echo =^> Đang thử tự động cài đặt Python qua winget...
    winget install --id Python.Python.3.10 -e --source winget
    if %errorlevel% neq 0 (
        echo [LỖI] Không thể tự động cài đặt Python. Vui lòng tải và cài đặt thủ công từ https://python.org ^(Nhớ tích vào ô "Add Python to PATH" lúc cài đặt^)
        pause
        exit /b
    )
    echo =^> Cài đặt Python thành công! Vui lòng ĐÓNG CỬA SỔ NÀY và mở lại file install.bat!
    pause
    exit /b
)
echo =^> Python đã được cài đặt.

echo.
echo [Kiểm tra Node.js]...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo =^> CẢNH BÁO: Không tìm thấy Node.js!
    echo =^> Đang thử tự động cài đặt Node.js qua winget...
    winget install --id OpenJS.NodeJS -e --source winget
    if %errorlevel% neq 0 (
        echo [LỖI] Không thể tự động cài đặt Node.js. Vui lòng tải và cài đặt thủ công từ https://nodejs.org
        pause
        exit /b
    )
    echo =^> Cài đặt Node.js thành công! Vui lòng ĐÓNG CỬA SỔ NÀY và mở lại file install.bat!
    pause
    exit /b
)
echo =^> Node.js đã được cài đặt.

echo.
echo ===================================================
echo [1/3] Đang cài đặt thư viện cho Frontend (Giao diện)...
echo ===================================================
cd frontend
if not exist "node_modules\" (
    echo =^> Đang tải và cài đặt thư viện Node.js...
    call npm install
) else (
    echo =^> Thư viện Frontend đã tồn tại. Đang kiểm tra bản cập nhật...
    call npm install
)
cd ..

echo.
echo ===================================================
echo [2/3] Đang cài đặt Backend (viXTTS)...
echo ===================================================
cd backend
if not exist "venv" (
    echo =^> Đang tạo môi trường ảo (venv) cho viXTTS...
    python -m venv venv
)
echo =^> Đang cài đặt các thư viện Python cho viXTTS (Có thể mất vài phút)...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
call deactivate
cd ..

echo.
echo ===================================================
echo [3/3] Đang cài đặt Backend (OmniVoice)...
echo ===================================================
cd backend-omni
if not exist "venv" (
    echo =^> Đang tạo môi trường ảo (venv) cho OmniVoice...
    python -m venv venv
)
echo =^> Đang cài đặt các thư viện Python cho OmniVoice (Có thể mất vài phút)...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
call deactivate
cd ..

echo.
echo ===================================================
echo Hoàn tất cài đặt Chaos Studio!
echo ===================================================
echo Bạn có thể chạy file start.bat để khởi động ứng dụng ngay bây giờ.
echo.
pause
