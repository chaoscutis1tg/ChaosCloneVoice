# Chaos Studio - Lồng Tiếng AI (Version 2.0)

Chaos Studio (trước đây là CloneVoiceAI) là một ứng dụng Web (Local Web App) hỗ trợ sao chép giọng nói (Voice Cloning) Tiếng Việt chạy hoàn toàn offline trên máy cá nhân. Ứng dụng sử dụng mô hình **OmniVoice** để tạo ra giọng nói tự nhiên, truyền cảm.

## 🌟 Tính năng nổi bật
- **Chạy hoàn toàn Offline (Local)**: Không cần gửi dữ liệu lên server, đảm bảo tính bảo mật và riêng tư 100%.
- **OmniVoice AI**: Tốc độ sinh giọng nói cực nhanh, độ trễ thấp, chất lượng cao.
- **Tuỳ chọn Render CPU/GPU**: Cho phép chọn thiết bị render trên giao diện. Hỗ trợ tận dụng tối đa sức mạnh của Card đồ hoạ NVIDIA (CUDA).
- **Hồ sơ & Cảm xúc (Voice Profiles)**: Quản lý nhân vật với các biểu cảm (Vui, Buồn, Giận...).
- **Xử lý hàng loạt (Batch Processing)**: Render hàng loạt kịch bản và tải về dưới dạng file ZIP.
- **Tự động cài đặt**: Script tự động phát hiện và cài Python 3.10, Node.js nếu chưa có.

## 💻 Yêu cầu hệ thống (Prerequisites)
Để chạy được ứng dụng này, máy tính của bạn cần:
1. **Windows 10/11**
2. **Kết nối Internet** (cho lần cài đặt đầu tiên)

Script `install.bat` sẽ tự động cài đặt Python 3.10 và Node.js nếu chưa có.

## 🚀 Hướng dẫn Cài đặt & Sử dụng

### 1. Cài đặt (Chỉ cần làm 1 lần duy nhất)
Giải nén thư mục dự án, sau đó **click đúp chuột vào file `install.bat`**. 
Script sẽ tự động:
- Kiểm tra và cài đặt Python 3.10 (nếu chưa có).
- Kiểm tra và cài đặt Node.js (nếu chưa có).
- Tải và cài đặt các thư viện cho Frontend.
- Tạo môi trường ảo (Virtual Environment) và cài đặt thư viện cho Backend OmniVoice.

*(Quá trình cài đặt có thể mất 5-15 phút tùy thuộc vào tốc độ mạng)*

### 2. Khởi chạy Ứng dụng
Sau khi cài đặt thành công, **click đúp chuột vào file `start.bat`**. 
Script sẽ tự động khởi động 2 cửa sổ Terminal:
- Frontend (Giao diện người dùng)
- Backend OmniVoice (Port 8000)

Sau đó, mở trình duyệt web và truy cập vào địa chỉ: **http://localhost:5173** để bắt đầu sử dụng!

## 📁 Cấu trúc Thư mục (Directory Structure)
```text
ChaosStudio/
├── frontend/        # Mã nguồn giao diện Web (React/Vite)
├── backend-omni/    # Mã nguồn API cho mô hình OmniVoice (FastAPI)
├── samples/         # Nơi lưu trữ các file âm thanh mẫu (.wav)
├── install.bat      # Script tự động cài đặt tất cả thư viện
├── start.bat        # Script tự động khởi chạy toàn bộ hệ thống
└── README.md        # File hướng dẫn này
```
