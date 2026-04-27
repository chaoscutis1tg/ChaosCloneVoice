from huggingface_hub import snapshot_download
import os

model_dir = os.path.join(os.path.dirname(__file__), "models", "viXTTS")
os.makedirs(model_dir, exist_ok=True)

print("Downloading viXTTS model (~1.8GB)... Please wait.")

# Download the model from Hugging Face
snapshot_download(
    repo_id="thinhlpg/viXTTS",
    local_dir=model_dir,
    allow_patterns=["*.pth", "*.json", "*.txt"], # We only need model weights and config
    local_dir_use_symlinks=False
)

print(f"Model successfully saved to {model_dir}")
