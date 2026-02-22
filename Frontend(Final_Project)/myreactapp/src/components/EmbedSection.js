import React, { useState, useEffect } from "react";
import axios from "axios";
import UploadCard from "./UploadCard";
import ImageViewer from "./ImageViewer";

const API_URL = "http://127.0.0.1:8000";

export default function EmbedSection({ setError, setLoading }) {
  const [embedMode, setEmbedMode] = useState("file"); 
  const [coverImage, setCoverImage] = useState(null);
  const [coverVideo, setCoverVideo] = useState(null); 
  const [secretFile, setSecretFile] = useState(null);
  const [secretText, setSecretText] = useState("");
  
  const [burnMode, setBurnMode] = useState(false);
  const [ipfsMode, setIpfsMode] = useState(false);
  const [decoyMode, setDecoyMode] = useState(false);
  
  const [resultData, setResultData] = useState(null); 
  const [copyState, setCopyState] = useState("Copy Key");
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [activeTooltip, setActiveTooltip] = useState(null);

  // --- HELPER: GET DETAILED EXPLANATIONS ---
  const getIssueExplanation = (issueStr) => {
      if (issueStr.includes("SSN")) return "Pattern matches a Social Security Number. High risk of identity theft if exposed.";
      if (issueStr.includes("EMAIL")) return "Email address detected. Potential privacy risk for personal contact info.";
      if (issueStr.includes("PHONE")) return "Phone number detected. PII (Personal Identifiable Information) found.";
      if (issueStr.includes("IP_ADDRESS")) return "Network IP address detected. Could reveal server infrastructure.";
      if (issueStr.includes("CRYPTO")) return "Cryptocurrency wallet address detected. Financial security risk.";
      if (issueStr.includes("Keyword")) return "Contains high-risk terminology often associated with classified data.";
      return "Suspicious text pattern detected by security algorithms.";
  };

  // --- AUTOMATED AI SCANNER ---
  useEffect(() => {
      if (!secretText || secretText.length < 5 || embedMode === 'file') {
          setAiAnalysis(null);
          return;
      }
      setAnalyzing(true);
      const timer = setTimeout(async () => {
          try {
              const formData = new FormData();
              formData.append("text", secretText);
              const res = await axios.post(`${API_URL}/analyze-text`, formData);
              if (res.data.status === "success") {
                  const analysis = res.data.analysis;
                  setAiAnalysis(analysis);
                  if (analysis.auto_enable_burn && !burnMode) setBurnMode(true);
                  if (analysis.auto_enable_decoy && !decoyMode) setDecoyMode(true);
              }
          } catch (err) {
              console.error("AI Auto-Scan failed", err);
          } finally {
              setAnalyzing(false);
          }
      }, 1000); 
      return () => clearTimeout(timer);
  }, [secretText, embedMode]); 

  const handleEmbed = async () => {
    if (embedMode === "video" && !coverVideo) return setError("Please upload a Video file.");
    if (embedMode !== "video" && !coverImage) return setError("Please upload a Cover Image.");
    setError("");
    setLoading(true);
    setUploadProgress(0);
    setResultData(null);
    setCopyState("Copy Key");

    const formData = new FormData();
    try {
      let endpoint = "";
      if (embedMode === "file") {
          if (!secretFile) throw new Error("Please select a file to hide.");
          formData.append("cover_image", coverImage);
          formData.append("secret_file", secretFile);
          formData.append("burn_mode", burnMode);
          formData.append("ipfs_mode", ipfsMode);
          formData.append("decoy_mode", decoyMode);
          endpoint = "/hide-file";
      } else if (embedMode === "text") {
          if (!secretText) throw new Error("Please enter a text message.");
          formData.append("file", coverImage); 
          formData.append("secret", secretText);
          endpoint = "/embed-text";
      } else if (embedMode === "video") {
          if (!secretText) throw new Error("Please enter a text message to hide in the video.");
          formData.append("video", coverVideo); 
          formData.append("secret", secretText);
          endpoint = "/embed-video";
      }

      const response = await axios.post(`${API_URL}${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 0, 
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
        }
      });

      if (response.data.status === "success") {
          setResultData({
              key: response.data.quantum_key,
              url: `${API_URL}${response.data.download_url}`,
              ipfs: response.data.ipfs_hash,
              stats: response.data.stats, 
              isVideo: embedMode === "video"
          });
          setAiAnalysis(null); 
      } else {
          throw new Error(response.data.message || "Embedding Failed");
      }
    } catch (err) {
      let msg = err.message;
      if (err.response && err.response.data && err.response.data.message) {
          msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleCopyKey = () => {
      if (resultData?.key) {
          navigator.clipboard.writeText(resultData.key);
          setCopyState("Copied!");
          setTimeout(() => setCopyState("Copy Key"), 2000);
      }
  };

  // --- STYLES ---
  const cardStyle = { background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: "30px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" };
  const inputStyle = { width: "100%", padding: "12px", background: "#f9fafb", border: "1px solid #ddd", borderRadius: "6px", boxSizing: "border-box", fontSize: "14px", color: "#333", outline: "none" };
  const buttonStyle = { marginTop: "15px", width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "#1f2937", color: "#fff", fontWeight: "600", cursor: "pointer", fontSize: "14px", transition: "background 0.2s" };
  const videoUploadStyle = { border: "2px dashed #d1d5db", borderRadius: "8px", padding: "30px 20px", textAlign: "center", background: "#f9fafb", cursor: "pointer", marginBottom: "15px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "120px" };
  const tabContainerStyle = { display: "flex", justifyContent: "center", marginBottom: "20px" };
  const tabWrapperStyle = { display: "inline-flex", gap: "8px", background: "#e5e7eb", padding: "4px", borderRadius: "8px" };
  const getTabStyle = (isActive) => ({ padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600", letterSpacing: "0.5px", transition: "all 0.2s ease", color: isActive ? "#ffffff" : "#4b5563", background: isActive ? "#1f2937" : "transparent", boxShadow: isActive ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none", outline: "none" });

  const checkboxContainerStyle = { 
      display: "flex", alignItems: "center", gap: "8px", 
      fontSize: "12px", color: "#374151", cursor: "pointer", 
      padding: "8px", background: "#f9fafb", borderRadius: "6px", border: "1px solid #eee",
      position: "relative"
  };

  const tooltipStyle = {
      position: "absolute", bottom: "115%", left: "50%", transform: "translateX(-50%)",
      background: "#1f2937", color: "#fff", padding: "8px 12px", borderRadius: "6px",
      fontSize: "11px", lineHeight: "1.4", width: "200px", textAlign: "center",
      zIndex: 100, pointerEvents: "none", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
      fontWeight: "500"
  };

  const featureInfo = {
      burn: "SECURITY FEATURE: The file will automatically delete itself from the server immediately after it is retrieved once.",
      ipfs: "WEB3 STORAGE: Creates an immutable, censorship-resistant backup on the InterPlanetary File System.",
      decoy: "STEALTH MODE: Hides the data in the 2nd Bit-Plane instead of the 1st, fooling standard LSB scanners."
  };

  // --- UPGRADED AI ALERT CSS ---
  const alertCardStyle = {
      marginTop: "16px",
      background: "#fff1f2", 
      borderLeft: "4px solid #be123c", // The thick red line
      borderRadius: "4px",
      padding: "16px",
      animation: "slideUp 0.3s ease-out",
      textAlign: "left",
      boxShadow: "0 4px 6px -1px rgba(190, 18, 60, 0.1)"
  };

  const alertHeaderStyle = {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "15px",
      paddingBottom: "10px",
      borderBottom: "1px solid rgba(190, 18, 60, 0.1)"
  };

  const alertBadgeStyle = {
      background: "#be123c",
      color: "white",
      fontSize: "11px",
      fontWeight: "800",
      padding: "4px 12px",
      borderRadius: "20px",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
  };

  // The Vertical Line Item Style
  const alertItemStyle = {
      marginBottom: "12px",
      borderLeft: "3px solid #fda4af", // Light red vertical line
      paddingLeft: "10px",
      marginLeft: "2px"
  };

  const alertFooterStyle = {
      marginTop: "15px",
      background: "#fff",
      border: "1px solid #fecaca",
      borderRadius: "4px",
      padding: "8px 12px",
      fontSize: "12px",
      color: "#881337",
      fontWeight: "700",
      textAlign: "left"
  };

  return (
    <section style={cardStyle}>
      <style>{`
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", textAlign: "center", marginBottom: "20px" }}>Secure Embedding</h2>
      
      <div style={tabContainerStyle}>
          <div style={tabWrapperStyle}>
              <button type="button" onClick={() => setEmbedMode("file")} style={getTabStyle(embedMode === "file")}>File in Image</button>
              <button type="button" onClick={() => setEmbedMode("text")} style={getTabStyle(embedMode === "text")}>Text in Image</button>
              <button type="button" onClick={() => setEmbedMode("video")} style={getTabStyle(embedMode === "video")}>Video Mode</button>
          </div>
      </div>

      {embedMode === "video" ? (
          <div style={videoUploadStyle} onClick={() => document.getElementById('video-input').click()}>
              <input id="video-input" type="file" accept="video/*" onChange={(e) => setCoverVideo(e.target.files[0])} style={{ display: "none" }} />
              {coverVideo ? <div><div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>{coverVideo.name}</div><div style={{ fontSize: "12px", color: "#10b981" }}>Video Selected</div></div> : <div><div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Upload Cover Video</div><div style={{ fontSize: "12px", color: "#9ca3af" }}>Supports .mp4, .avi</div></div>}
          </div>
      ) : (
          <UploadCard onFile={setCoverImage} file={coverImage} label={embedMode === "file" ? "Upload Cover Image" : "Upload Cover Image"} accept="image/*" />
      )}

      <div className="controls" style={{ marginTop: "15px" }}>
          {embedMode === "file" && (
             <div style={{ width: "100%" }}>
                <label style={{display:"block", marginBottom:"8px", fontWeight:"600", color:"#555", fontSize:"13px"}}>Select Secret Document:</label>
                <input type="file" onChange={(e) => setSecretFile(e.target.files[0])} style={inputStyle} />
             </div>
          )}
          
          {(embedMode === "text" || embedMode === "video") && (
             <div style={{ width: "100%" }}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px"}}>
                    <label style={{fontWeight:"600", color:"#555", fontSize:"13px"}}>Enter Secret Message:</label>
                    {analyzing && <span style={{ fontSize: "10px", color: "#10b981", fontWeight: "700", textTransform:"uppercase", letterSpacing:"0.5px", animation: "pulse 1.5s infinite" }}>AI Scanning...</span>}
                </div>
                <textarea 
                    value={secretText}
                    onChange={(e) => setSecretText(e.target.value)}
                    placeholder={embedMode === "video" ? "Type message to hide in video..." : "Type your secret message here..."}
                    style={{ ...inputStyle, height: "100px", resize: "vertical", fontFamily: "inherit" }}
                />
             </div>
          )}

          {/* --- HIGH-END AI ALERT --- */}
          {aiAnalysis && aiAnalysis.threat_score > 0 && (
              <div style={alertCardStyle}>
                  <div style={alertHeaderStyle}>
                      <strong style={{ color: "#881337", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>
                          AI THREAT DETECTION
                      </strong>
                      <span style={alertBadgeStyle}>
                          {aiAnalysis.risk_level}
                      </span>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                      {aiAnalysis.detected_issues.map((issue, idx) => (
                          <div key={idx} style={alertItemStyle}>
                              <div style={{ fontSize: "13px", color: "#881337", fontWeight: "700", marginBottom: "3px" }}>
                                  {issue}
                              </div>
                              <div style={{ fontSize: "12px", color: "#9f1239", lineHeight: "1.4" }}>
                                  {getIssueExplanation(issue)}
                              </div>
                          </div>
                      ))}
                  </div>

                  <div style={alertFooterStyle}>
                      System Action: Enabled {aiAnalysis.recommendations.join(", ")}
                  </div>
              </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "15px" }}>
              <label style={checkboxContainerStyle} onMouseEnter={() => setActiveTooltip("burn")} onMouseLeave={() => setActiveTooltip(null)}>
                  <input type="checkbox" checked={burnMode} onChange={(e) => setBurnMode(e.target.checked)} /> Self-Destruct
                  {activeTooltip === "burn" && <div style={tooltipStyle}>{featureInfo.burn}</div>}
              </label>
              <label style={checkboxContainerStyle} onMouseEnter={() => setActiveTooltip("ipfs")} onMouseLeave={() => setActiveTooltip(null)}>
                  <input type="checkbox" checked={ipfsMode} onChange={(e) => setIpfsMode(e.target.checked)} /> IPFS Backup
                  {activeTooltip === "ipfs" && <div style={tooltipStyle}>{featureInfo.ipfs}</div>}
              </label>
              <label style={checkboxContainerStyle} onMouseEnter={() => setActiveTooltip("decoy")} onMouseLeave={() => setActiveTooltip(null)}>
                  <input type="checkbox" checked={decoyMode} onChange={(e) => setDecoyMode(e.target.checked)} /> Decoy Mode
                  {activeTooltip === "decoy" && <div style={tooltipStyle}>{featureInfo.decoy}</div>}
              </label>
          </div>
      </div>

      <button onClick={handleEmbed} style={buttonStyle} disabled={uploadProgress > 0 && uploadProgress < 100}>
        {uploadProgress > 0 && uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : embedMode === "file" ? "Encrypt & Hide File" : embedMode === "video" ? "Embed in Video" : "Encrypt & Hide Text"}
      </button>

      {resultData && (
        <div style={{ marginTop: "25px", background: "#f9fafb", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 style={{ margin: 0, color: "#059669", fontSize: "14px", textTransform: "uppercase" }}>Encryption Successful</h3>
            </div>
            <div style={{ marginBottom: "15px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: "6px", display: "block" }}>Quantum Session Key</label>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "10px", fontFamily: "monospace", color: "#374151", wordBreak: "break-all", fontSize: "13px", marginBottom: "10px" }}>{resultData.key}</div>
                <button onClick={handleCopyKey} style={{ background: "#374151", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}>{copyState}</button>
            </div>
            {resultData.stats && <div style={{ marginBottom: "15px", fontSize: "12px", color: "#6b7280", background: "#fff", border: "1px solid #e5e7eb", padding: "10px", borderRadius: "6px" }}><strong style={{ color: "#374151" }}>Stats:</strong> {resultData.stats.frames_used}</div>}
            {resultData.ipfs && <div style={{ marginBottom: "15px" }}><label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: "6px", display: "block" }}>IPFS CID</label><div style={{ fontSize: "12px", color: "#059669", background: "#ecfdf5", padding: "8px", borderRadius: "4px" }}>{resultData.ipfs}</div></div>}
            <div style={{ marginTop: "20px", borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", marginBottom: "6px", display: "block" }}>{resultData.isVideo ? "Stego-Video Output" : "Stego Asset Preview"}</label>
                {resultData.isVideo ? <a href={resultData.url} download style={{ display: "block", textAlign: "center", padding: "10px", background: "#1f2937", color: "white", textDecoration: "none", borderRadius: "6px", fontWeight: "600", fontSize: "13px" }}>Download Encrypted Video</a> : <ImageViewer src={resultData.url} />}
            </div>
        </div>
      )}
    </section>
  );
}