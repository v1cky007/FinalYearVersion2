from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import sys

# Import Config from Core
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from core import config 
from api.routes import router

app = FastAPI(title="Stego-Blockchain Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

# Mount Static (for images)
app.mount("/static", StaticFiles(directory=config.BASE_DIR), name="static")
app.mount("/outputs", StaticFiles(directory=config.OUTPUT_DIR), name="outputs")

# --- DOWNLOAD ROUTE ---
@app.get("/download/{filename}")
async def download_file(filename: str):
    # This looks in the 'outputs' folder
    file_path = os.path.join(config.OUTPUT_DIR, filename)
    
    if os.path.exists(file_path):
        return FileResponse(
            path=file_path, 
            filename=filename, 
            media_type='application/octet-stream' # Forces browser to download
        )
    
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/")
def health_check():
    return {"status": "System Operational"}