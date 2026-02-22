import React, { useState } from "react";
import axios from "axios";
import UploadCard from "./UploadCard";

const API_URL = "http://127.0.0.1:8000";

export default function ExtractSection({ setError, setLoading }) {
  // Modes: "image", "video"
  const [extractMode, setExtractMode] = useState("image");
  
  const [stegoFile, setStegoFile] = useState(null);
  const [key, setKey] = useState("");
  const [result, setResult] = useState(null);
  const [copyState, setCopyState] = useState("Copy");

  const handleExtract = async () => {
    if (!stegoFile) return setError("Please upload the file to extract from.");
    if (!key) return setError("Please enter the Quantum Session Key.");

    setError("");
    setLoading(true);
    setResult(null);
    setCopyState("Copy");

    const formData = new FormData();
    
    try {
      let endpoint = "";
      
      // 1. SELECT ENDPOINT BASED ON MODE
      if (extractMode === "image") {
          formData.append("stego_image", stegoFile);
          formData.append("key", key);
          endpoint = "/retrieve-file";
      } else {
          formData.append("video", stegoFile);
          formData.append("key", key);
          endpoint = "/extract-video";
      }

      const response = await axios.post(`${API_URL}${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 0 // Infinite timeout for large videos
      });

      if (response.data.status === "success") {
          setResult(response.data);
      } else {
          throw new Error(response.data.message || "Extraction Failed");
      }

    } catch (err) {
      console.error(err);
      let msg = err.message;
      if (err.response && err.response.data && err.response.data.message) {
          msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRecovered = () => {
      if (!result?.file_data) return;
      const link = document.createElement("a");
      link.href = `data:application/octet-stream;base64,${result.file_data}`;
      link.download = result.filename || "recovered_secret";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleCopyText = () => {
      if (result?.content || result?.secret_data) {
          navigator.clipboard.writeText(result.content || result.secret_data);
          setCopyState("Copied!");
          setTimeout(() => setCopyState("Copy"), 2000);
      }
  };

  // --- STYLES ---
  const cardStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    height: "fit-content"
  };

  const inputStyle = {
      width: "100%",
      padding: "12px",
      background: "#f9fafb",
      border: "1px solid #ddd",
      borderRadius: "6px",
      boxSizing: "border-box", 
      fontSize: "14px",
      color: "#333",
      outline: "none",
      marginTop: "10px",
      fontFamily: "monospace" 
  };

  const buttonStyle = {
      marginTop: "15px",
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "none",
      background: "#1f2937",
      color: "#fff",
      fontWeight: "600",
      cursor: "pointer",
      fontSize: "14px",
      transition: "background 0.2s"
  };

  // Tabs UI (Matches EmbedSection)
  const tabContainerStyle = { display: "flex", justifyContent: "center", marginBottom: "20px" };
  const tabWrapperStyle = { display: "inline-flex", gap: "8px", background: "#e5e7eb", padding: "4px", borderRadius: "8px" };
  const getTabStyle = (isActive) => ({
      padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600", letterSpacing: "0.5px", transition: "all 0.2s ease",
      color: isActive ? "#ffffff" : "#4b5563", background: isActive ? "#1f2937" : "transparent", boxShadow: isActive ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none", outline: "none"
  });

  // Clean Video Upload (No Icons)
  const videoUploadStyle = {
      border: "2px dashed #d1d5db",
      borderRadius: "8px",
      padding: "30px 20px",
      textAlign: "center",
      background: "#f9fafb", 
      cursor: "pointer",
      marginBottom: "15px",
      transition: "border 0.2s, background 0.2s",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "120px"
  };

  const resultBoxStyle = {
      marginTop: "25px",
      background: "#f9fafb", 
      padding: "20px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb", 
      textAlign: "left",
      boxSizing: "border-box",
      width: "100%"
  };

  const labelStyle = {
      fontSize: "11px",
      fontWeight: "700",
      color: "#6b7280",
      textTransform: "uppercase",
      marginBottom: "6px",
      display: "block",
      letterSpacing: "0.5px"
  };

  const contentBoxStyle = {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "6px",
      padding: "10px",
      fontSize: "13px",
      color: "#374151",
      maxHeight: "150px",
      overflowY: "auto",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      marginBottom: "10px"
  };

  return (
    <section style={cardStyle}>
      <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", textAlign: "center", marginBottom: "20px" }}>Decrypt & Extract</h2>

      {/* MODE TABS */}
      <div style={tabContainerStyle}>
          <div style={tabWrapperStyle}>
              <button onClick={() => setExtractMode("image")} style={getTabStyle(extractMode === "image")}>From Image</button>
              <button onClick={() => setExtractMode("video")} style={getTabStyle(extractMode === "video")}>From Video</button>
          </div>
      </div>

      {/* UPLOAD AREA */}
      {extractMode === "video" ? (
          <div 
            style={videoUploadStyle} 
            onClick={() => document.getElementById('ext-video-input').click()}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.background = "#f3f4f6"; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.background = "#f9fafb"; }}
          >
              <input 
                  id="ext-video-input" 
                  type="file" 
                  accept="video/*"  
                  onChange={(e) => setStegoFile(e.target.files[0])} 
                  style={{ display: "none" }} 
              />
              {stegoFile ? (
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>{stegoFile.name}</div>
                    <div style={{ fontSize: "12px", color: "#10b981" }}>Video Selected</div>
                  </div>
              ) : (
                  <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Select Encrypted Video</div>
                      <div style={{ fontSize: "12px", color: "#9ca3af" }}>Supports .mp4, .avi</div>
                  </div>
              )}
          </div>
      ) : (
          <UploadCard 
              onFile={setStegoFile} 
              file={stegoFile} 
              label="Upload Encrypted Image/Audio" 
              accept="image/*,audio/*"
          />
      )}

      {/* KEY INPUT */}
      <div style={{ marginTop: "15px" }}>
        <label style={labelStyle}>QUANTUM SESSION KEY</label>
        <input 
            type="text" 
            placeholder="Paste your key here..." 
            value={key}
            onChange={(e) => setKey(e.target.value)}
            style={inputStyle}
        />
      </div>

      <button onClick={handleExtract} style={buttonStyle}>
          {extractMode === "video" ? "Decrypt Video Data" : "Unlock & Extract"}
      </button>

      {/* RESULTS - MINIMALIST STYLE (No Icons) */}
      {result && (
        <div style={resultBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ margin: 0, color: "#059669", fontSize: "14px", textTransform: "uppercase" }}>Decryption Successful</h3>
            </div>
            
            {result.type === "text" || result.secret_data ? (
                // TEXT RESULT
                <div>
                    <label style={labelStyle}>Recovered Message</label>
                    <div style={contentBoxStyle}>
                        {result.content || result.secret_data}
                    </div>
                    <button 
                        onClick={handleCopyText}
                        style={{ background: "#374151", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}
                    >
                        {copyState}
                    </button>
                </div>
            ) : (
                // FILE RESULT (Clean, No Icon)
                <div>
                    <label style={labelStyle}>Recovered File</label>
                    <div style={{ background: "#fff", border: "1px solid #e5e7eb", padding: "12px", borderRadius: "6px", marginBottom: "15px" }}>
                        <span style={{ fontSize: "14px", color: "#374151", fontWeight: "600" }}>{result.filename}</span>
                    </div>
                    <button 
                        onClick={handleDownloadRecovered}
                        style={{ background: "#1f2937", color: "white", border: "none", padding: "10px", width: "100%", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
                    >
                        Download File
                    </button>
                </div>
            )}
        </div>
      )}
    </section>
  );
}