import os
import hashlib
import random
import wave
from PIL import Image

# ⚠️ CRITICAL FIX: This disables the limit (178MP) so you can process your 180MP+ images
Image.MAX_IMAGE_PIXELS = None 

# --- IMAGE STEGANOGRAPHY (With Bit-Planes) ---
def embed_data(image_path: str, output_path: str, secret_data: str, key: str, bit_plane=0) -> str:
    """
    bit_plane=0 -> Real Data (LSB)
    bit_plane=1 -> Decoy Data (2nd Bit)
    """
    img = Image.open(image_path).convert("RGB")
    pixels = img.load()
    width, height = img.size
    
    # Prepare Data
    full_secret = secret_data + "#####"
    binary_secret = ''.join(format(ord(char), '08b') for char in full_secret)
    data_len = len(binary_secret)
    
    # Shuffle Coordinates
    all_coords = [(x, y) for y in range(height) for x in range(width)]
    random.seed(key) 
    random.shuffle(all_coords)

    if data_len > len(all_coords) * 3:
        raise ValueError(f"Data too big for Bit-Plane {bit_plane}")

    data_index = 0
    mask = ~(1 << bit_plane) # Clears the specific bit

    for (x, y) in all_coords:
        if data_index >= data_len: break
        r, g, b = pixels[x, y]

        # Embed in Red
        if data_index < data_len:
            bit = int(binary_secret[data_index])
            r = (r & mask) | (bit << bit_plane)
            data_index += 1
        
        # Embed in Green
        if data_index < data_len:
            bit = int(binary_secret[data_index])
            g = (g & mask) | (bit << bit_plane)
            data_index += 1

        # Embed in Blue
        if data_index < data_len:
            bit = int(binary_secret[data_index])
            b = (b & mask) | (bit << bit_plane)
            data_index += 1

        pixels[x, y] = (r, g, b)

    img.save(output_path, "PNG")
    return output_path

def extract_data(image_path: str, key: str, bit_plane=0) -> str:
    img = Image.open(image_path).convert("RGB")
    pixels = img.load()
    width, height = img.size

    all_coords = [(x, y) for y in range(height) for x in range(width)]
    random.seed(key)
    random.shuffle(all_coords)

    binary_chunk = ""
    decoded_data = ""
    delimiter = "#####"

    for (x, y) in all_coords:
        r, g, b = pixels[x, y]

        # Extract specific bit using bitwise shift
        binary_chunk += str((r >> bit_plane) & 1)
        binary_chunk += str((g >> bit_plane) & 1)
        binary_chunk += str((b >> bit_plane) & 1)

        while len(binary_chunk) >= 8:
            byte = binary_chunk[:8]
            binary_chunk = binary_chunk[8:]
            try:
                char = chr(int(byte, 2))
                decoded_data += char
                if decoded_data.endswith(delimiter):
                    return decoded_data[:-len(delimiter)]
            except:
                pass
    return ""

# --- AUDIO STEGANOGRAPHY (.WAV) ---
def embed_audio(audio_path, output_path, secret_data, key):
    song = wave.open(audio_path, mode='RB')
    frame_bytes = bytearray(list(song.readframes(song.getnframes())))
    
    full_secret = secret_data + "#####"
    binary_secret = ''.join(format(ord(char), '08b') for char in full_secret)
    
    # Shuffle Indices (Quantum Security)
    indices = list(range(len(frame_bytes)))
    random.seed(key)
    random.shuffle(indices)
    
    for i, bit in enumerate(binary_secret):
        if i >= len(frame_bytes): break
        idx = indices[i]
        # Modify LSB
        frame_bytes[idx] = (frame_bytes[idx] & 254) | int(bit)
        
    with wave.open(output_path, 'WB') as fd:
        fd.setparams(song.getparams())
        fd.writeframes(frame_bytes)
    
    song.close()
    return output_path

def extract_audio(audio_path, key):
    song = wave.open(audio_path, mode='RB')
    frame_bytes = bytearray(list(song.readframes(song.getnframes())))
    
    indices = list(range(len(frame_bytes)))
    random.seed(key)
    random.shuffle(indices)
    
    extracted_bin = ""
    decoded_data = ""
    delimiter = "#####"
    
    # We scan first 100000 bytes or until delimiter
    for i in range(len(frame_bytes)):
        idx = indices[i]
        extracted_bin += str(frame_bytes[idx] & 1)
        
        if len(extracted_bin) >= 8:
            byte = extracted_bin[:8]
            extracted_bin = extracted_bin[8:]
            try:
                char = chr(int(byte, 2))
                decoded_data += char
                if decoded_data.endswith(delimiter):
                    song.close()
                    return decoded_data[:-len(delimiter)]
            except:
                pass
                
    song.close()
    return ""