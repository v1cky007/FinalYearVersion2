import base64
import hashlib
from cryptography.fernet import Fernet
from services.quantum import generate_quantum_key

def derive_fernet_key(quantum_bit_string: str) -> bytes:
    """Converts the raw Quantum bit string into a 32-byte format safe for Fernet."""
    return base64.urlsafe_b64encode(hashlib.sha256(quantum_bit_string.encode()).digest())

def encrypt_data_with_quantum(message: str):
    """(Text Mode) Generates a NEW Quantum Key and encrypts the message string."""
    raw_quantum_key = generate_quantum_key(length=1024)
    fernet_key = derive_fernet_key(raw_quantum_key)
    f = Fernet(fernet_key)
    encrypted_bytes = f.encrypt(message.encode())
    return encrypted_bytes, raw_quantum_key

def decrypt_data_with_quantum(token: bytes, raw_quantum_key: str) -> str:
    """(Text Mode) Decrypts string data."""
    try:
        fernet_key = derive_fernet_key(raw_quantum_key)
        f = Fernet(fernet_key)
        if isinstance(token, str):
            token = token.encode()
        return f.decrypt(token).decode()
    except Exception:
        return None

# --- NEW FILE HANDLING FUNCTIONS ---

def encrypt_file_with_quantum(file_bytes: bytes):
    """(File Mode) Encrypts raw binary data (PDF, PPT, etc.)."""
    raw_quantum_key = generate_quantum_key(length=1024)
    fernet_key = derive_fernet_key(raw_quantum_key)
    f = Fernet(fernet_key)
    # Encrypt raw bytes directly
    encrypted_data = f.encrypt(file_bytes)
    return encrypted_data, raw_quantum_key

def decrypt_file_with_quantum(encrypted_data: bytes, raw_quantum_key: str) -> bytes:
    """(File Mode) Decrypts binary data."""
    try:
        fernet_key = derive_fernet_key(raw_quantum_key)
        f = Fernet(fernet_key)
        return f.decrypt(encrypted_data)
    except Exception as e:
        print(f"Decryption failed: {e}")
        return None