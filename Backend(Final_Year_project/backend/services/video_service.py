import os
import shutil

# Unique marker to separate Video Data from Secret Data
DELIMITER = b"|||STEGO_SECURE_DATA|||"

def embed_video_data(video_path, output_path, secret_data):
    """
    ULTRA-FAST EOF INJECTION.
    """
    try:
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Input video not found: {video_path}")

        shutil.copyfile(video_path, output_path)
        
        # Ensure payload is bytes
        if isinstance(secret_data, str):
            secret_bytes = secret_data.encode('utf-8')
        else:
            secret_bytes = secret_data
            
        payload = DELIMITER + secret_bytes
        
        with open(output_path, "ab") as f:
            f.write(payload)
            
        return {"frames_used": "N/A (EOF Mode)", "total_frames": "N/A"}
        
    except Exception as e:
        print(f"❌ Video Embed Error: {e}")
        raise e

def extract_video_data(video_path):
    """
    Reads the file to find the hidden delimiter.
    ALWAYS returns bytes (never string) to prevent decryption errors.
    """
    try:
        if not os.path.exists(video_path):
            return b"" # Return empty bytes on error

        with open(video_path, "rb") as f:
            content = f.read()
            
            # Find the LAST occurrence of the delimiter 
            # (In case the video file itself naturally contains the delimiter bytes)
            if DELIMITER in content:
                # split returns a list, we take the last part
                parts = content.split(DELIMITER)
                secret_bytes = parts[-1]
                return secret_bytes
            else:
                return b"" # Return empty bytes if not found
                
    except Exception as e:
        print(f"❌ Video Extract Error: {e}")
        return b""