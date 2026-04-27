# CloneVoiceAI - Personal Project by Chaos (Version 1.0)

CloneVoiceAI là một dự án cá nhân được phát triển bởi **Chaos**. Đây là một ứng dụng Web (Local Web App) hỗ trợ sao chép giọng nói (Voice Cloning) Tiếng Việt chạy hoàn toàn offline trên máy cá nhân. Ứng dụng tích hợp các mô hình AI tiên tiến nhất hiện nay như **viXTTS** và **OmniVoice** để tạo ra giọng nói tự nhiên, truyền cảm.

## 🌟 Tính năng nổi bật
- **Chạy hoàn toàn Offline (Local)**: Không cần gửi dữ liệu lên server, đảm bảo tính bảo mật và riêng tư 100%.
- **Hỗ trợ đa mô hình (Multi-Model)**:
  - `viXTTS`: Tối ưu hóa cho ngữ điệu Tiếng Việt tự nhiên.
  - `OmniVoice`: Tốc độ sinh giọng nói cực nhanh, độ trễ thấp.
- **Quản lý Hồ sơ Giọng nói (Voice Profiles)**: Lưu và tái sử dụng các mẫu giọng nói (samples) dễ dàng mà không cần phải tải lên lại.
- **Kiến trúc Microservices**: Frontend (React) và 2 Backend API (FastAPI) hoạt động độc lập, dễ dàng mở rộng.

## 💻 Yêu cầu hệ thống (Prerequisites)
Để chạy được ứng dụng này, máy tính của bạn cần được cài đặt sẵn:
1. **Node.js**: Phiên bản 18.x trở lên ([Tải tại đây](https://nodejs.org))
2. **Python**: Phiên bản 3.10 hoặc 3.11 ([Tải tại đây](https://www.python.org/downloads/)) - *Lưu ý: Khi cài đặt nhớ tích chọn "Add Python to PATH"*

## 🚀 Hướng dẫn Cài đặt & Sử dụng

### 1. Cài đặt (Chỉ cần làm 1 lần duy nhất)
Giải nén thư mục dự án, sau đó **click đúp chuột vào file `install.bat`**. 
Script sẽ tự động:
- Kiểm tra Node.js và Python.
- Tải và cài đặt các thư viện cho Frontend.
- Tạo môi trường ảo (Virtual Environment) và cài đặt thư viện cho cả 2 Backend (viXTTS và OmniVoice).

*(Quá trình cài đặt có thể mất 5-10 phút tùy thuộc vào tốc độ mạng)*

### 2. Khởi chạy Ứng dụng
Sau khi cài đặt thành công, **click đúp chuột vào file `start.bat`**. 
Script sẽ tự động khởi động 3 cửa sổ Terminal tương ứng với:
- Frontend (Giao diện người dùng)
- Backend viXTTS (Port 8000)
- Backend OmniVoice (Port 8001)

Sau đó, mở trình duyệt web và truy cập vào địa chỉ: **http://localhost:5173** để bắt đầu sử dụng!

## 📁 Cấu trúc Thư mục (Directory Structure)
```text
VoiceCloning/
├── frontend/        # Mã nguồn giao diện Web (React/Vite)
├── backend/         # Mã nguồn API cho mô hình viXTTS (FastAPI)
├── backend-omni/    # Mã nguồn API cho mô hình OmniVoice (FastAPI)
├── samples/         # Nơi lưu trữ các file âm thanh mẫu (.wav)
├── install.bat      # Script tự động cài đặt tất cả thư viện
├── start.bat        # Script tự động khởi chạy toàn bộ hệ thống
└── README.md        # File hướng dẫn này
```
