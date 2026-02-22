import os
import sys
import uuid
import requests
from services.stego import embed_data, extract_data, embed_audio, extract_audio
from services.crypto import encrypt_file_with_quantum, decrypt_file_with_quantum, decrypt_data_with_quantum

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from core import config
except ImportError:
    import config

# --- REAL IPFS CONFIGURATION ---
IPFS_API_URL = "http://127.0.0.1:5001/api/v0/add"
IPFS_CAT_URL = "http://127.0.0.1:5001/api/v0/cat"

def upload_to_local_ipfs(file_bytes):
    try:
        files = {'file': file_bytes}
        response = requests.post(IPFS_API_URL, files=files)
        response.raise_for_status()
        data = response.json()
        return data['Hash']
    except Exception as e:
        print(f"❌ IPFS Upload Failed: {e}")
        return None

def fetch_from_local_ipfs(cid):
    try:
        params = {'arg': cid}
        response = requests.post(IPFS_CAT_URL, params=params, stream=True)
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"❌ IPFS Fetch Failed: {e}")
        return None

def hide_large_file(cover_path, secret_bytes, filename, burn=False, use_ipfs=False, is_decoy=False, bit_plane=0):
    
    encrypted_bytes, quantum_key = encrypt_file_with_quantum(secret_bytes)
    
    pointer_msg = ""
    ipfs_cid = None

    if use_ipfs:
        ipfs_cid = upload_to_local_ipfs(encrypted_bytes)
        if ipfs_cid:
            pointer_msg = f"IPFS:{ipfs_cid}:{filename}"
        else:
            raise Exception("Failed to connect to IPFS Desktop.")
            
    else:
        ext = os.path.splitext(filename)[1]
        file_id = str(uuid.uuid4())
        stored_filename = f"{file_id}{ext}.enc"
        save_path = os.path.join(config.HIDDEN_STORE_DIR, stored_filename)
        
        with open(save_path, "wb") as f:
            f.write(encrypted_bytes)
            
        pointer_msg = f"LINK:{stored_filename}"

    if burn:
        pointer_msg += ":BURN"

    if cover_path.endswith('.wav'):
        output_name = f"stego_{uuid.uuid4()}.wav"
        output_path = os.path.join(config.OUTPUT_DIR, output_name)
        embed_audio(cover_path, output_path, pointer_msg, quantum_key)
    else:
        output_name = f"stego_{uuid.uuid4()}.png"
        output_path = os.path.join(config.OUTPUT_DIR, output_name)
        embed_data(cover_path, output_path, pointer_msg, quantum_key, bit_plane=bit_plane)

    return {
        "stego_path": output_path,
        "key": quantum_key,
        "url": f"/outputs/{output_name}",
        "ipfs_cid": ipfs_cid
    }

def smart_restore(stego_path, key, is_audio=False):
    hidden_msg = None
    
    # 1. EXTRACT DATA (Fixed Logic)
    try:
        if is_audio:
            hidden_msg = extract_audio(stego_path, key)
        else:
            # Check Plane 0 (Standard/Text)
            val_0 = extract_data(stego_path, key, bit_plane=0)
            # Check Plane 1 (Decoy)
            val_1 = extract_data(stego_path, key, bit_plane=1)
            
            # DECISION MATRIX
            # Prioritize "LINK" or "IPFS" messages (File pointers)
            if val_0 and ("LINK:" in val_0 or "IPFS:" in val_0):
                hidden_msg = val_0
            elif val_1 and ("LINK:" in val_1 or "IPFS:" in val_1):
                hidden_msg = val_1
            # Fallback to plain text if found
            elif val_0:
                hidden_msg = val_0
            elif val_1:
                hidden_msg = val_1
                
    except:
        return {"type": "error", "message": "Extraction Failed"}

    if not hidden_msg: 
        return {"type": "error", "message": "No data found. (Check your Key)"}

    # 2. CHECK FOR FILE POINTERS
    parts = hidden_msg.split(":")
    is_burn = "BURN" in parts
    encrypted_bytes = None
    original_filename = "secret_file"

    if hidden_msg.startswith("IPFS:"):
        cid = parts[1]
        original_filename = parts[2]
        encrypted_bytes = fetch_from_local_ipfs(cid)
        if not encrypted_bytes:
            return {"type": "error", "message": "IPFS File Not Found."}

    elif hidden_msg.startswith("LINK:"):
        stored_filename = parts[1]
        original_filename = stored_filename.replace(".enc", "")
        file_path = os.path.join(config.HIDDEN_STORE_DIR, stored_filename)
        
        if not os.path.exists(file_path):
             return {"type": "error", "message": "File destroyed (Burn Mode)."}
        
        with open(file_path, "rb") as f:
            encrypted_bytes = f.read()

        if is_burn:
            try: os.remove(file_path)
            except: pass

    # 3. IF FILE -> DECRYPT
    if encrypted_bytes:
        dec_bytes = decrypt_file_with_quantum(encrypted_bytes, key)
        if not dec_bytes: return {"type": "error", "message": "Invalid Key."}
        
        return {
            "type": "file", 
            "filename": original_filename, 
            "data": dec_bytes, 
            "burned": is_burn
        }

    # 4. IF TEXT -> DECRYPT
    try:
        decrypted_text = decrypt_data_with_quantum(hidden_msg.encode('latin-1'), key)
        if decrypted_text: return {"type": "text", "content": decrypted_text}
    except: pass

    # 5. IF NOT ENCRYPTED TEXT (Decoy)
    return {"type": "text", "content": hidden_msg}