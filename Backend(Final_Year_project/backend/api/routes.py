import os
import shutil
import uuid
import sys
import base64
import numpy as np
import io
from PIL import Image
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse

# --- ML IMPORTS ---
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

# --- CONFIG SETUP ---
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from core import config
except ImportError:
    import config

# --- SERVICE IMPORTS ---
from services.file_service import hide_large_file, smart_restore
from services.monitor import log_security_event, get_system_stats
from services.crypto import encrypt_data_with_quantum, decrypt_data_with_quantum
from services.stego import embed_data
from services.video_service import embed_video_data, extract_video_data
from services.ai_analyzer import analyzer  # Ensure you have the ai_analyzer.py we created

router = APIRouter()

# ==========================================
# 🧠 LOAD YOUR TRAINED MODEL
# ==========================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "core", "cnn_integrity_model.h5")

print(f"⏳ Loading AI Model from: {MODEL_PATH}")
try:
    stego_model = load_model(MODEL_PATH)
    print("✅ CNN Integrity Model Loaded Successfully!")
except Exception as e:
    print(f"⚠️ Error loading model: {e}")
    print(f"👉 Checked path: {MODEL_PATH}")
    stego_model = None


# ==========================================
# 📊 DASHBOARD & MONITORING
# ==========================================
@router.get("/dashboard-stats")
async def get_dashboard_stats_endpoint():
    return get_system_stats()


# ==========================================
# 🧠 AI CONTENT ANALYSIS
# ==========================================
@router.post("/analyze-text")
async def analyze_text_endpoint(text: str = Form(...)):
    """
    Scans text for sensitive data and suggests security settings.
    """
    try:
        analysis = analyzer.analyze(text)
        if analysis["threat_score"] > 0:
            print(f"⚠️ AI Alert: Detected {analysis['risk_level']} content.")
        return {"status": "success", "analysis": analysis}
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


# ==========================================
# 🕵️‍♀️ AI STEGANALYSIS SCANNER
# ==========================================
@router.post("/scan-image")
async def scan_image_endpoint(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        
        target_size = (128, 128) 
        
        # Center Crop
        width, height = img.size
        if width < target_size[0] or height < target_size[1]:
            img_processed = img.resize(target_size)
        else:
            left = (width - target_size[0])/2
            top = (height - target_size[1])/2
            right = (width + target_size[0])/2
            bottom = (height + target_size[1])/2
            img_processed = img.crop((left, top, right, bottom))
        
        img_array = img_to_array(img_processed)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0 
        
        score = 0
        analysis_msg = "UNKNOWN"
        is_suspicious = False
        
        if stego_model:
            prediction = stego_model.predict(img_array)
            confidence = float(prediction[0][0])
            
            print(f"🔍 AI RAW OUTPUT: {confidence:.4f}")

            # INVERTED LOGIC (1.0 = Clean, 0.0 = Stego)
            is_suspicious = confidence < 0.5 
            
            if is_suspicious:
                score = round((1 - confidence) * 10, 4)
                analysis_msg = f"SUSPICIOUS (Integrity Drop: {round((1-confidence)*100, 1)}%)"
            else:
                score = round((1 - confidence) * 10, 4)
                analysis_msg = f"CLEAN (Integrity: {round(confidence*100, 1)}%)"
        else:
            # Fallback
            flat = np.array(img).flatten()
            histogram, _ = np.histogram(flat, bins=256, range=(0, 256))
            prob = histogram / flat.size
            prob = prob[prob > 0]
            entropy = -np.sum(prob * np.log2(prob))
            score = round(entropy, 4)
            is_suspicious = score > 7.7
            analysis_msg = "SUSPICIOUS (Entropy Check)" if is_suspicious else "CLEAN (Entropy Check)"

        return {
            "status": "success",
            "entropy_score": score,
            "analysis": analysis_msg,
            "is_suspicious": is_suspicious
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ==========================================
# 📂 HIDE FILE (Image Stego)
# ==========================================
@router.post("/hide-file")
async def hide_file_endpoint(
    cover_image: UploadFile = File(...), 
    secret_file: UploadFile = File(...),
    burn_mode: str = Form("false"),
    ipfs_mode: str = Form("false"),
    decoy_mode: str = Form("false")
):
    ext = os.path.splitext(cover_image.filename)[1]
    temp_cover = os.path.join(config.UPLOAD_DIR, f"temp_{uuid.uuid4()}{ext}")
    
    try:
        with open(temp_cover, "wb") as f:
            shutil.copyfileobj(cover_image.file, f)
            
        secret_bytes = await secret_file.read()
        is_burn = (burn_mode == "true")
        is_ipfs = (ipfs_mode == "true")
        is_decoy = (decoy_mode == "true") 
        plane = 1 if is_decoy else 0
        
        result = hide_large_file(
            temp_cover, 
            secret_bytes, 
            secret_file.filename, 
            burn=is_burn, 
            use_ipfs=is_ipfs, 
            bit_plane=plane
        )
        
        log_security_event(
            "EMBED", 
            f"Hidden: {secret_file.filename} (Burn:{is_burn}, IPFS:{is_ipfs})", 
            "SUCCESS",
            key=result['key'],
            url=result['url']
        )
        
        return {
            "status": "success",
            "quantum_key": result['key'],
            "download_url": result['url'],
            "ipfs_hash": result['ipfs_cid']
        }
    except Exception as e:
        print(f"❌ Hide File Error: {e}")
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)
    finally:
        if os.path.exists(temp_cover): os.remove(temp_cover)


# ==========================================
# 💬 HIDE TEXT (Image Stego)
# ==========================================
@router.post("/embed-text")
async def embed_text_endpoint(
    file: UploadFile = File(...), 
    secret: str = Form(...)
):
    # Determine extension
    ext = os.path.splitext(file.filename)[1]
    if not ext: ext = ".png"
    temp_cover = os.path.join(config.UPLOAD_DIR, f"temp_text_{uuid.uuid4()}{ext}")
    
    try:
        with open(temp_cover, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Encrypt
        encrypted_bytes, quantum_key = encrypt_data_with_quantum(secret)
        encrypted_msg = encrypted_bytes.decode('latin-1')
        
        output_filename = f"stego_{uuid.uuid4()}.png"
        output_path = os.path.join(config.OUTPUT_DIR, output_filename)
        download_url = f"/outputs/{output_filename}"
        
        # Embed using robust stego.py logic
        embed_data(temp_cover, output_path, encrypted_msg, quantum_key)
        
        log_security_event(
            "EMBED", 
            "Hidden Text Message", 
            "SUCCESS",
            key=quantum_key,
            url=download_url
        )

        return {
            "status": "success",
            "message": "Text hidden successfully!",
            "quantum_key": quantum_key,
            "download_url": download_url
        }
    except Exception as e:
        print(f"❌ Text Embed Error: {e}")
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)
    finally:
        if os.path.exists(temp_cover): os.remove(temp_cover)


# ==========================================
# 🎥 VIDEO STEGANOGRAPHY (Fast EOF + Encryption)
# ==========================================
@router.post("/embed-video")
async def embed_video_endpoint(
    video: UploadFile = File(...), 
    secret: str = Form(...)
):
    print(f"🔍 DEBUG: Received Video Request: {video.filename}")

    temp_video = os.path.join(config.UPLOAD_DIR, f"input_{uuid.uuid4()}.mp4")
    
    try:
        # 1. Save video
        with open(temp_video, "wb") as f:
            shutil.copyfileobj(video.file, f)

        # 2. ENCRYPT THE SECRET (Quantum Layer)
        encrypted_bytes, quantum_key = encrypt_data_with_quantum(secret)
        print(f"   - Data Encrypted. Key: {quantum_key[:10]}...")

        # 3. Output Path
        output_filename = f"stego_video_{uuid.uuid4()}.avi"
        output_path = os.path.join(config.OUTPUT_DIR, output_filename)
        download_url = f"/outputs/{output_filename}"
        
        # 4. Hide the ENCRYPTED bytes (EOF Mode - FAST)
        stats = embed_video_data(temp_video, output_path, encrypted_bytes)
        
        log_security_event(
            "VIDEO-EMBED", 
            f"Hidden in Video (EOF Mode)", 
            "SUCCESS",
            key=quantum_key,
            url=download_url
        )
        
        return {
            "status": "success", 
            "message": "Video processed successfully!",
            "quantum_key": quantum_key,
            "download_url": download_url,
            "stats": stats
        }
        
    except Exception as e:
        print(f"❌ SERVER ERROR: {str(e)}")
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)
    finally:
        if os.path.exists(temp_video):
            try: os.remove(temp_video)
            except: pass

@router.post("/extract-video")
async def extract_video_endpoint(
    video: UploadFile = File(...),
    key: str = Form(...) 
):
    temp_video = os.path.join(config.UPLOAD_DIR, f"extract_{uuid.uuid4()}.avi")
    try:
        with open(temp_video, "wb") as f:
            shutil.copyfileobj(video.file, f)
            
        # 1. Extract raw encrypted bytes
        extracted_data = extract_video_data(temp_video)
        
        if not extracted_data:
             return JSONResponse(content={"status": "error", "message": "No hidden data found."}, status_code=400)

        # 2. Decrypt using the key
        decrypted_text = decrypt_data_with_quantum(extracted_data, key)
        
        if not decrypted_text:
            return JSONResponse(content={"status": "error", "message": "Invalid Key or Corrupted Data"}, status_code=400)

        return {
            "status": "success",
            "secret_data": decrypted_text
        }
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)
    finally:
        if os.path.exists(temp_video): os.remove(temp_video)


# ==========================================
# 🔓 RETRIEVE (Image/File Stego)
# ==========================================
@router.post("/retrieve-file") 
async def retrieve_endpoint(stego_image: UploadFile = File(...), key: str = Form(...)):
    ext = os.path.splitext(stego_image.filename)[1]
    temp_stego = os.path.join(config.UPLOAD_DIR, f"temp_{uuid.uuid4()}{ext}")
    try:
        with open(temp_stego, "wb") as f: shutil.copyfileobj(stego_image.file, f)
        is_audio = stego_image.filename.endswith(".wav")
        result = smart_restore(temp_stego, key, is_audio=is_audio)
        
        if result["type"] == "error":
            log_security_event("EXTRACT", result["message"], "BLOCKED")
            return JSONResponse(content={"status": "error", "message": result["message"]}, status_code=400)
        elif result["type"] == "file":
            status = "BURNED" if result.get("burned") else "SUCCESS"
            log_security_event("EXTRACT", f"Recovered: {result['filename']}", status)
            b64_data = base64.b64encode(result["data"]).decode('utf-8')
            return {"status": "success", "type": "file", "filename": result["filename"], "file_data": b64_data}
        elif result["type"] == "text":
            return {"status": "success", "type": "text", "content": result["content"]}
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)
    finally:
        if os.path.exists(temp_stego): os.remove(temp_stego)