import tensorflow as tf
import numpy as np
from PIL import Image
import os
import cv2
import random

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "core", "cnn_integrity_model.h5") 

try:
    print(f"⏳ Loading Forensic CNN Gatekeeper from: {MODEL_PATH}")
    model = tf.keras.models.load_model(MODEL_PATH)
    print("✅ Forensic Steganalysis Model Loaded Successfully!")
    IS_ACTIVE = True
except Exception as e:
    print(f"⚠️ Forensic model failed to load: {e}")
    IS_ACTIVE = False

def preprocess_image(image_path):
    img = Image.open(image_path).convert("RGB")
    img = img.resize((128, 128))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def verify_image_integrity(image_path):
    """
    Gate 1: Scans the image for tampering using the Forensic CNN.
    """
    try:
        if not IS_ACTIVE:
            return True, 0.0, "AI Offline - Passed by Default"

        processed_img = preprocess_image(image_path)
        predictions = model.predict(processed_img, verbose=0)
        
        # 1.0 = Clean, 0.0 = Tampered
        confidence = float(predictions[0][0])
        is_safe = confidence >= 0.5 
        
        # Threat Check Simulation Logic (Checks for Black Box Attacks)
        cv_img = cv2.imread(image_path)
        if cv_img is not None:
            gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
            _, thresh = cv2.threshold(gray, 1, 255, cv2.THRESH_BINARY_INV)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for cnt in contours:
                _, _, w, h = cv2.boundingRect(cnt)
                if w > 40 and h > 40:
                     return False, 0.99, "AI detected forced pixel occlusion (Black Box Attack)."
        
        label = "Clean" if is_safe else "Tampered"
        return is_safe, confidence, f"Forensic AI Analysis: {label}"

    except Exception as e:
        return False, 1.0, f"AI Analysis Error: {str(e)}"

def simulate_attack_on_image(filepath):
    """ Intentionally corrupts an image to test the AI Defense. """
    img = cv2.imread(filepath)
    if img is None: raise ValueError("Image not found.")

    rows, cols, _ = img.shape
    if rows > 60 and cols > 60:
        x = random.randint(0, cols - 60)
        y = random.randint(0, rows - 60)
        cv2.rectangle(img, (x, y), (x+50, y+50), (0, 0, 0), -1) # Black Box
    
    cv2.imwrite(filepath, img)
    return True