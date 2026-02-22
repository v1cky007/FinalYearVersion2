import json
import os
import sys
import random
from datetime import datetime
from services.blockchain import secure_ledger 

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from core import config
except ImportError:
    import config

STATS_FILE = os.path.join(config.BASE_DIR, "stats.json")
START_TIME = datetime.now()

default_state = {
    "stats": {"files_secured": 0, "attacks_blocked": 0, "active_keys": 0},
    "activity_log": []
}

def load_system_state():
    if os.path.exists(STATS_FILE):
        try:
            with open(STATS_FILE, "r") as f: return json.load(f)
        except: return default_state
    return default_state

def save_system_state():
    try:
        with open(STATS_FILE, "w") as f: json.dump(system_state, f, indent=4)
    except: pass

system_state = load_system_state()

# --- UPDATED FUNCTION SIGNATURE ---
def log_security_event(event_type, message, status, key=None, url=None):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Update Stats
    if event_type == "EMBED" and status == "SUCCESS":
        system_state["stats"]["files_secured"] += 1
        system_state["stats"]["active_keys"] += 1
    elif status == "BLOCKED" or status == "BURNED":
        system_state["stats"]["attacks_blocked"] += 1

    # Update Log (NOW INCLUDES KEY & URL)
    log_entry = {
        "time": timestamp, 
        "type": event_type, 
        "message": message, 
        "status": status,
        "key": key, # New field
        "url": url  # New field
    }
    system_state["activity_log"].insert(0, log_entry)
    system_state["activity_log"] = system_state["activity_log"][:50]
    
    # Update Blockchain
    if status in ["SUCCESS", "BLOCKED", "BURNED"]:
        secure_ledger.add_block({
            "event": event_type,
            "status": status,
            "details": message,
            "timestamp": timestamp
        })

    save_system_state()

def get_system_stats():
    return {
        "stats": system_state["stats"],
        "activity_log": system_state["activity_log"],
        "blockchain_log": secure_ledger.get_chain_data(), 
        "system_health": {
            "threat_level": "LOW",
            "uptime": str(datetime.now() - START_TIME).split('.')[0],
            "quantum_entropy": 99.9,
            "disk_usage_mb": 150.2
        }
    }