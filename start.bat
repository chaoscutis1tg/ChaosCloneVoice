@echo off
echo Starting DubAI Viet Frontend...
start cmd /k "cd frontend && npm run dev"

echo Starting DubAI Viet Backend (viXTTS) on Port 8000...
start cmd /k "cd backend && call venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000"

echo Starting DubAI Viet Backend (OmniVoice) on Port 8001...
start cmd /k "cd backend-omni && call venv\Scripts\activate.bat && uvicorn main_omni:app --reload --port 8001"

echo All services started! Close these windows to stop.
pause
