import os
import tempfile
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from model import VoiceCloner

app = FastAPI(title="DubAI Viet Backend")

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize TTS Model globally so it stays in memory
cloner = VoiceCloner()

from typing import Optional
import shutil

SAMPLES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "samples"))
if not os.path.exists(SAMPLES_DIR):
    os.makedirs(SAMPLES_DIR)

@app.get("/api/samples")
async def list_samples():
    files = [f.replace(".wav", "") for f in os.listdir(SAMPLES_DIR) if f.endswith(".wav")]
    return {"samples": files}

@app.post("/api/samples")
async def save_sample(name: str = Form(...), file: UploadFile = File(...)):
    safe_name = name.replace(" ", "_")
    out_path = os.path.join(SAMPLES_DIR, f"{safe_name}.wav")
    with open(out_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"success": True, "name": safe_name}

@app.post("/api/clone")
async def clone_voice(
    text: str = Form(...), 
    file: Optional[UploadFile] = File(None),
    sample_name: Optional[str] = Form(None)
):
    tmp_in_path = None
    
    if sample_name:
        tmp_in_path = os.path.join(SAMPLES_DIR, f"{sample_name}.wav")
        if not os.path.exists(tmp_in_path):
            return {"error": "Sample not found"}
    elif file:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_in:
            content = await file.read()
            tmp_in.write(content)
            tmp_in_path = tmp_in.name
    else:
        return {"error": "Either file or sample_name must be provided"}
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_out:
        tmp_out_path = tmp_out.name
    
    try:
        cloner.clone(text=text, speaker_wav=tmp_in_path, output_path=tmp_out_path)
        
        return FileResponse(
            tmp_out_path, 
            media_type="audio/wav", 
            filename="dubbed_voice.wav", 
            background=None
        )
    finally:
        pass # To properly handle cleanup, we could use BackgroundTasks, but for simplicity we keep it this way.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
