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

@app.post("/api/clone")
async def clone_voice(
    text: str = Form(...),
    file: Optional[UploadFile] = File(None),
    sample_name: Optional[str] = Form(None)
):
    global model
    if model is None:
        return {"error": "OmniVoice model is not loaded"}

    tmp_in_path = None
    is_temp_input = False

    if sample_name:
        tmp_in_path = os.path.join(SAMPLES_DIR, f"{sample_name}.wav")
        if not os.path.exists(tmp_in_path):
            return {"error": "Sample not found"}
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
