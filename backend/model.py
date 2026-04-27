import torch
import os
import sys

# PyTorch 2.6+ compatibility patch for older TTS libraries
_original_load = torch.load
def _patched_load(*args, **kwargs):
    kwargs["weights_only"] = False
    return _original_load(*args, **kwargs)
torch.load = _patched_load

# To avoid warnings and interactive prompts from TTS
os.environ["COQUI_TOS_AGREED"] = "1"

class VoiceCloner:
    def __init__(self):
        print("Initializing Voice Cloner Model... Please wait, this may take a while to download on first run.")
        try:
            from TTS.api import TTS
        except ImportError:
            print("Error: TTS library is not installed. Please install with `pip install TTS`")
            sys.exit(1)
            
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
        
        # Load the custom viXTTS fine-tuned model for Vietnamese
        model_dir = os.path.join(os.path.dirname(__file__), "models", "viXTTS")
        config_path = os.path.join(model_dir, "config.json")
        
        from TTS.tts.configs.xtts_config import XttsConfig
        from TTS.tts.models.xtts import Xtts
        
        print("Loading local viXTTS config...")
        config = XttsConfig()
        config.load_json(config_path)
        
        print("Initializing Xtts native model...")
        self.tts = Xtts.init_from_config(config)
        self.tts.load_checkpoint(config, checkpoint_dir=model_dir, eval=True)
        self.tts.to(self.device)
        print("viXTTS Native Model loaded successfully!")

    def clone(self, text: str, speaker_wav: str, output_path: str):
        print(f"Generating native viXTTS voice... Language: vi, Text: {text}")
        import torchaudio
        
        try:
            # Compute conditioning latents
            gpt_cond_latent, speaker_embedding = self.tts.get_conditioning_latents(audio_path=[speaker_wav])
            
            # Run Inference (Bypass language map by using 'en')
            out = self.tts.inference(
                text=text,
                language="en",
                gpt_cond_latent=gpt_cond_latent,
                speaker_embedding=speaker_embedding,
                temperature=0.75,
            )
            
            # Save audio
            audio_tensor = torch.tensor(out["wav"]).unsqueeze(0)
            torchaudio.save(output_path, audio_tensor, 24000)
            
        except Exception as e:
            print(f"Error during native generation: {e}")
            raise e
            
        print(f"Native Vietnamese Voice successfully cloned and saved to {output_path}")

