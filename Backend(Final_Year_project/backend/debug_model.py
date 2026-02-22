import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model

# Adjust this if your model is in a different folder
# We assume it is in backend/core/ based on previous chats
MODEL_PATH = os.path.join("core", "cnn_integrity_model.h5")

def check_model():
    print(f"🔍 Looking for model at: {os.path.abspath(MODEL_PATH)}")
    
    if not os.path.exists(MODEL_PATH):
        print("❌ ERROR: Model file not found! Please check the path.")
        return

    try:
        # Load Model
        model = load_model(MODEL_PATH)
        print("\n✅ Model Loaded Successfully!")

        # 1. CHECK INPUT SHAPE
        # This tells us exactly what size the image MUST be
        input_shape = model.input_shape
        print(f"\n📏 Model Expects Input Shape: {input_shape}")
        print("   (Height, Width, Channels)")

        # 2. CHECK OUTPUT SHAPE
        # This tells us if it returns 1 number (Sigmoid) or 2 (Softmax)
        output_shape = model.output_shape
        print(f"🎯 Model Output Shape: {output_shape}")

        if output_shape[1] == 1:
            print("   Type: Binary Classification (Sigmoid)")
            print("   👉 Code should use: prediction[0][0]")
        else:
            print(f"   Type: Multi-Class ({output_shape[1]} classes)")
            print("   👉 Code should use: np.argmax(prediction)")

    except Exception as e:
        print(f"\n❌ Error Loading Model: {e}")

if __name__ == "__main__":
    check_model()