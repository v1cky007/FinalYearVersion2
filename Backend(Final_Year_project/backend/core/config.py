import os

# core/config.py -> UP -> backend/ -> UP -> ProjectRoot
# We want BASE_DIR to point to 'backend/' folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
HIDDEN_STORE_DIR = os.path.join(BASE_DIR, "hidden_store")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(HIDDEN_STORE_DIR, exist_ok=True)

BASE_URL = "http://127.0.0.1:8000"