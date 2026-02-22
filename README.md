# StegoSafe: Blockchain-Integrated Steganography with ML-Based Integrity Checking

Welcome to StegoSafe! This project combines advanced steganography, machine learning (CNNs), and blockchain technology to securely hide and verify data. 

This guide will walk you through setting up both the FastAPI Backend and the React Frontend on your local machine.

## 🚀 Prerequisites
Make sure you have the following installed on your computer:
* [Python 3.11](https://www.python.org/downloads/release/python-3110/) (Strictly required for compatibility)
* [Node.js & npm](https://nodejs.org/en/download/)
* [Git](https://git-scm.com/downloads)

---

## ⚙️ 1. Backend Setup (FastAPI & Python)

Open a terminal and follow these steps to start the Python server:

**1. Navigate to the backend folder:**
```bash
cd "Backend(Final_Year_project/backend"
```

**2. Create and activate a Python 3.11 Virtual Environment:**
*For Windows:*
```powershell
py -3.11 -m venv venv
.\venv\Scripts\activate
```
*For Mac/Linux:*
```bash
python3.11 -m venv venv
source venv/bin/activate
```

**3. Set up the requirements file:**
Create a file named `requirements.txt` in your `backend` folder and paste the following code exactly as is:

```text
# ==========================================
# Web Framework & Server
# ==========================================
fastapi==0.110.0
uvicorn==0.29.0
python-multipart==0.0.9
pydantic==2.6.4

# ==========================================
# Machine Learning & NLP
# ==========================================
tensorflow==2.20.0
keras==3.13.0
scikit-learn==1.4.1.post1
h5py==3.15.1
spacy==3.8.11
[https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl](https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl)

# ==========================================
# Blockchain & Cryptography
# ==========================================
web3==6.15.0
pycryptodome==3.23.0
py-ecc==8.0.0

# ==========================================
# Image & Video Processing (Steganography)
# ==========================================
opencv-python==4.9.0.80
pillow==10.2.0
matplotlib==3.10.8
numpy==1.26.4
bitarray==3.8.0

# ==========================================
# Database
# ==========================================
SQLAlchemy==2.0.45
```

**4. Install the required libraries:**
Run this command to download and install all the dependencies from the file you just created:
```bash
pip install -r requirements.txt
```

**5. Start the backend server:**
```bash
uvicorn main:app --reload
```
> ✅ The backend will now be running at: `http://127.0.0.1:8000`

---

## 🎨 2. Frontend Setup (React)

Open a **new, second terminal window** (leave the backend running in the first one) and follow these steps:

**1. Navigate to the frontend folder:**
```bash
cd "Frontend(Final_Project)/myreactapp"
```

**2. Install the required Node modules:**
```bash
npm install
```

**3. Start the React development server:**
```bash
npm start
```
> ✅ The frontend will automatically open in your browser at: `http://localhost:3000`

---

## 🛠️ Tech Stack
* **Frontend:** React.js
* **Backend:** Python 3.11, FastAPI
* **Machine Learning:** TensorFlow, Keras, OpenCV
* **Blockchain:** Ethereum, Web3.py, Hardhat
