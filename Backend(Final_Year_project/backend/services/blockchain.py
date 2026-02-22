import hashlib
import json
import time

# --- 1. THE BLOCK CLASS (New Engine) ---
class Block:
    def __init__(self, index, timestamp, data, previous_hash):
        self.index = index
        self.timestamp = timestamp
        self.data = data  # This will store your {image_hash, fragment, unlock_time}
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        # We assume 'data' is a dictionary, so we stringify it uniquely
        block_string = json.dumps(self.data, sort_keys=True) + str(self.index) + str(self.timestamp) + self.previous_hash
        return hashlib.sha256(block_string.encode()).hexdigest()

# --- 2. THE BLOCKCHAIN MANAGER ---
class Blockchain:
    def __init__(self):
        self.chain = [self.create_genesis_block()]

    def create_genesis_block(self):
        return Block(0, time.time(), {"event": "GENESIS", "status": "INIT"}, "0")

    def get_latest_block(self):
        return self.chain[-1]

    def add_block(self, data_payload):
        prev_block = self.get_latest_block()
        new_block = Block(len(self.chain), time.time(), data_payload, prev_block.hash)
        self.chain.append(new_block)
        return new_block

    def get_chain_data(self):
        # Helper for the Dashboard to see readable data
        return [
            {
                "index": b.index,
                "timestamp": time.ctime(b.timestamp),
                "data": b.data,
                "hash": b.hash,
                "prev_hash": b.previous_hash
            }
            for b in self.chain
        ]

# Global Instance
secure_ledger = Blockchain()


# --- 3. WRAPPERS (Preserving Your Existing Functions) ---

def log_transaction(image_hash, encrypted_fragment, lock_time=0):
    """
    Logs the transaction to the Immutable Ledger.
    """
    # Create unique TX ID
    tx_id = hashlib.sha256(f"{image_hash}{time.time()}".encode()).hexdigest()
    
    # Calculate Unlock Time
    unlock_timestamp = time.time() + (lock_time * 60) if lock_time > 0 else 0

    # Payload
    block_data = {
        "event": "FILE_LOCK", # Tag for Dashboard
        "tx_id": "0x" + tx_id[:40],
        "image_hash": image_hash,
        "fragment": encrypted_fragment,
        "unlock_time": unlock_timestamp,
        "status": "Confirmed",
        "gas_used": 21000
    }
    
    # Add to Real Blockchain
    secure_ledger.add_block(block_data)
    
    return block_data["tx_id"]

def get_fragment_from_chain(image_hash):
    """
    Retrieves the fragment if the Time Lock has expired.
    Iterates backwards through the Blockchain.
    """
    # Look through the chain (skipping Genesis block 0)
    for block in reversed(secure_ledger.chain):
        payload = block.data
        
        # Check if this block has the data we want
        if payload.get("image_hash") == image_hash:
            
            # Check Time Lock
            unlock_time = payload.get("unlock_time", 0)
            if unlock_time > 0 and time.time() < unlock_time:
                return "LOCKED" 
            
            return payload.get("fragment")
            
    return None