import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export default function ScannerSection() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async () => {
      if (!file) return;
      setLoading(true);
      setResult(null);
      setError("");
      
      const formData = new FormData();
      formData.append("file", file);
      
      try {
          // Send to backend
          const res = await axios.post(`${API_URL}/scan-image`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          
          if (res.data.status === "error") {
              throw new Error(res.data.message);
          }
          
          setResult(res.data);
      } catch (err) {
          console.error("Scan failed:", err);
          setError("Scan Failed: " + (err.response?.data?.message || err.message));
      } finally {
          setLoading(false);
      }
  };

  // --- STYLES (Matched to EmbedSection) ---
  const cardStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    marginBottom: "30px"
  };

  const headerStyle = {
    fontSize: "16px",
    fontWeight: "700",
    color: "#4b5563",
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: "20px"
  };

  const uploadBoxStyle = {
    border: "2px dashed #e5e7eb",
    borderRadius: "8px",
    padding: "30px 20px",
    textAlign: "center",
    background: "linear-gradient(to bottom, #f9fafb, #fff)",
    cursor: "pointer",
    transition: "all 0.2s",
    marginBottom: "20px"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#1f2937", // Matching Dark Grey
    color: "#fff",
    fontWeight: "600",
    cursor: file ? "pointer" : "not-allowed",
    opacity: file ? 1 : 0.7,
    fontSize: "14px"
  };

  const resultCardStyle = {
      marginTop: "20px",
      padding: "15px",
      borderRadius: "8px",
      border: result?.is_suspicious ? "1px solid #fca5a5" : "1px solid #86efac", 
      background: result?.is_suspicious ? "#fef2f2" : "#ecfdf5",
      textAlign: "center"
  };

  return (
    <section style={cardStyle}>
        <h2 style={headerStyle}>AI Steganalysis Scanner</h2>
        
        {/* Upload Box (Matches EmbedSection) */}
        <div style={uploadBoxStyle} onClick={() => document.getElementById('scanner-input').click()}>
            <input 
                id="scanner-input"
                type="file" 
                onChange={(e) => setFile(e.target.files[0])} 
                style={{ display: "none" }}
            />
            {file ? (
                <div>
                    <div style={{ fontSize: "28px", marginBottom: "10px" }}>📄</div>
                    <div style={{ fontWeight: "600", color: "#374151" }}>{file.name}</div>
                    <div style={{ fontSize: "12px", color: "#10b981", marginTop: "5px" }}>Ready to scan</div>
                </div>
            ) : (
                <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>
                        Drag & Drop Stego Image Here
                    </div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>or click to browse</div>
                </div>
            )}
        </div>

        {error && <div style={{ color: "#dc2626", fontSize: "13px", marginBottom: "15px", textAlign: "center" }}>⚠️ {error}</div>}

        <button 
            onClick={handleScan} 
            style={buttonStyle} 
            disabled={loading || !file}
        >
            {loading ? "Analyzing Entropy..." : "Scan Image"}
        </button>

        {/* Result Area */}
        {result && (
            <div style={resultCardStyle}>
                <h3 style={{ margin: "0 0 5px 0", fontSize: "15px", color: result.is_suspicious ? "#dc2626" : "#059669", fontWeight: "800", textTransform: "uppercase" }}>
                    {result.analysis}
                </h3>
                <div style={{ fontSize: "13px", color: "#374151" }}>
                    Entropy Score: <strong>{result.entropy_score}</strong>
                </div>
                <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "5px" }}>
                    (Safe &lt; 7.5 | Suspicious &gt; 7.7)
                </div>
            </div>
        )}
    </section>
  );
}