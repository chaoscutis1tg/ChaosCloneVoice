from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import tempfile
import os
import torch
import soundfile as sf
import warnings

# Suppress PyTorch warnings
warnings.filterwarnings("ignore")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OmniVoice lazily or on startup
model = None

@app.on_event("startup")
def startup_event():
    global model
    try:
        from omnivoice import OmniVoice
        print("Initializing OmniVoice Model... This will download the model on first run.")
        device = "cuda:0" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if torch.cuda.is_available() else torch.float32
        model = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map=device, dtype=dtype)
        print("OmniVoice loaded successfully!")
    except Exception as e:
        print(f"Failed to load OmniVoice: {e}")

from typing import Optional

SAMPLES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "samples"))
if not os.path.exists(SAMPLES_DIR):
    os.makedirs(SAMPLES_DIR)

import json
import shutil

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
    global model
    if model is None:
        return {"error": "OmniVoice model is not loaded"}

    # Handle device switching
    if render_device == "auto":
        target_device = "cuda:0" if torch.cuda.is_available() else "cpu"
    elif render_device == "cpu":
        target_device = "cpu"
    elif render_device == "gpu":
        target_device = "cuda:0"
    else:
        target_device = "cuda:0" if torch.cuda.is_available() else "cpu"

    current_device = getattr(model, 'current_device', None)
    if current_device is None:
        # Initial guess based on what was used in startup
        current_device = "cuda:0" if torch.cuda.is_available() else "cpu"

    if current_device != target_device:
        try:
            print(f"Moving OmniVoice model to {target_device}...")
            model.to(target_device)
            model.current_device = target_device
        except Exception as e:
            print(f"Warning: Could not move OmniVoice to {target_device}: {e}")
            from fastapi import HTTPException
            if render_device == "gpu":
                raise HTTPException(status_code=400, detail=f"Không thể chuyển sang GPU (CUDA): {e}. Vui lòng chạy file install_gpu.bat để cập nhật PyTorch.")
    is_temp_input = False

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
            is_temp_input = True
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

        print(f"OmniVoice Generating... Text: {text}")
        audio = model.generate(
            text=text,
            ref_audio=tmp_in_path
        )
        
        # Save output using soundfile
        import soundfile as sf
        if isinstance(audio, tuple):
            audio_data, sr = audio # If it returns tuple
            audio_tensor = torch.as_tensor(audio_data).cpu()
            if len(audio_tensor.shape) == 2 and audio_tensor.shape[0] == 1:
                audio_tensor = audio_tensor.squeeze(0)
            sf.write(tmp_out_path, audio_tensor.numpy(), sr)
        else:
            # Assuming it returns a 1D tensor and default 24000 sr
            audio_tensor = torch.as_tensor(audio).cpu()
            if len(audio_tensor.shape) == 2 and audio_tensor.shape[0] == 1:
                audio_tensor = audio_tensor.squeeze(0)
            sf.write(tmp_out_path, audio_tensor.numpy(), 24000)

        # Remove the input temp file safely
        if is_temp_input:
            os.remove(tmp_in_path)

        # Return the generated file
        return FileResponse(tmp_out_path, media_type="audio/wav")
        
    except Exception as e:
        print("OmniVoice Generation Error:", e)
        if is_temp_input and os.path.exists(tmp_in_path):
             os.remove(tmp_in_path)
        raise e
