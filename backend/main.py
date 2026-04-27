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

import json

PROFILES_FILE = os.path.join(SAMPLES_DIR, "profiles.json")

def load_profiles():
    if os.path.exists(PROFILES_FILE):
        with open(PROFILES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_profiles(profiles):
    with open(PROFILES_FILE, "w", encoding="utf-8") as f:
        json.dump(profiles, f, ensure_ascii=False, indent=2)

@app.get("/api/profiles")
async def get_profiles():
    return {"profiles": load_profiles()}

@app.post("/api/profiles")
async def create_profile(
    name: str = Form(...),
    emotion: str = Form("normal"),
    file: UploadFile = File(...)
):
    profiles = load_profiles()
    if name not in profiles:
        profiles[name] = {"emotions": {}}
    
    safe_name = f"{name.replace(' ', '_')}_{emotion}.wav"
    out_path = os.path.join(SAMPLES_DIR, safe_name)
    with open(out_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    profiles[name]["emotions"][emotion] = safe_name
    save_profiles(profiles)
    return {"success": True, "profile": profiles[name]}

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
    sample_name: Optional[str] = Form(None),
    emotion: Optional[str] = Form("normal"),
    speed: Optional[float] = Form(1.0),
    temperature: Optional[float] = Form(0.75),
    render_device: Optional[str] = Form("auto")
):
    cloner.set_device(render_device)
    
    tmp_in_path = None
    
    if sample_name:
        profiles = load_profiles()
        if sample_name in profiles:
            emotions = profiles[sample_name].get("emotions", {})
            wav_name = emotions.get(emotion)
            if not wav_name:
                wav_name = emotions.get("normal", list(emotions.values())[0] if emotions else None)
            
            if wav_name:
                tmp_in_path = os.path.join(SAMPLES_DIR, wav_name)
        else:
            if not sample_name.endswith(".wav"):
                sample_name += ".wav"
            tmp_in_path = os.path.join(SAMPLES_DIR, sample_name)
            
        if tmp_in_path is None or not os.path.exists(tmp_in_path):
            return {"error": "Sample or profile not found"}
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
        emotion_prompts = {
            "angry": "[Tức giận] ",
            "happy": "[Vui vẻ] ",
            "sad": "[Buồn bã] ",
            "surprised": "[Ngạc nhiên] "
        }
        if emotion in emotion_prompts and text and not text.startswith("["):
            text = emotion_prompts[emotion] + text
            
        cloner.clone(text=text, speaker_wav=tmp_in_path, output_path=tmp_out_path, speed=speed, temperature=temperature)
        
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
