import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export default function HistorySidebar({ isOpen, toggleSidebar }) {
  const [history, setHistory] = useState([]);
  const [copyFeedbackAt, setCopyFeedbackAt] = useState(null);
  const [downloadingAt, setDownloadingAt] = useState(null);
  // State for hover effect on close button
  const [isHoveringClose, setIsHoveringClose] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/dashboard-stats`);
        if (res.data && res.data.activity_log) {
          setHistory(res.data.activity_log);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };

    if (isOpen) {
        fetchHistory();
        const interval = setInterval(fetchHistory, 2000);
        return () => clearInterval(interval);
    }
  }, [isOpen]);

  // --- ACTIONS ---
  const handleCopy = (key, index) => {
      navigator.clipboard.writeText(key);
      setCopyFeedbackAt(index);
      setTimeout(() => setCopyFeedbackAt(null), 2000); 
  };

  const handleForceDownload = async (url, index) => {
      try {
          setDownloadingAt(index);
          const response = await axios.get(url, { responseType: 'blob' });
          const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = blobUrl;
          const filename = url.split('/').pop() || "downloaded_file";
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
      } catch (err) {
          console.error("Download failed:", err);
          alert("Could not download file. It might have been deleted.");
      } finally {
          setDownloadingAt(null);
      }
  };

  const handleClose = (e) => {
      e.stopPropagation(); // Prevents click issues
      if (toggleSidebar) {
          toggleSidebar();
      }
  };

  // --- STYLES ---
  const containerStyle = {
    position: "fixed",
    top: 0,
    right: isOpen ? 0 : "-360px", 
    width: "360px",
    height: "100%",
    background: "#fff",
    boxShadow: isOpen ? "-5px 0 25px rgba(0,0,0,0.15)" : "none",
    zIndex: 9999, // Max Z-Index to ensure it's on top
    transition: "right 0.3s ease-in-out", 
    padding: "25px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column"
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #eee"
  };

  const closeBtnStyle = {
    background: isHoveringClose ? "#f3f4f6" : "transparent",
    border: "none",
    fontSize: "28px", // Larger size
    fontWeight: "300",
    lineHeight: "1",
    cursor: "pointer",
    color: isHoveringClose ? "#111" : "#9ca3af",
    padding: "5px 12px", // Bigger hit area
    borderRadius: "8px",
    transition: "all 0.2s ease",
    outline: "none"
  };

  const getItemStyle = (item) => ({
    marginBottom: "20px",
    borderBottom: "1px solid #f3f4f6",
    paddingBottom: "20px",
    background: item.key ? "#f9fafb" : "transparent",
    padding: item.key ? "15px" : "0 0 20px 0",
    borderRadius: "12px"
  });

  const actionBtnStyle = {
      padding: "8px 14px",
      fontSize: "12px",
      fontWeight: "600",
      borderRadius: "6px",
      cursor: "pointer",
      border: "none",
      display: "inline-block",
      marginTop: "10px",
      marginRight: "10px",
      transition: "background 0.2s"
  };

  const copyBtnStyle = { ...actionBtnStyle, background: "#e5e7eb", color: "#374151", border: "1px solid #d1d5db" };
  const downloadBtnStyle = { ...actionBtnStyle, background: "#1f2937", color: "white" };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0, color: "#1f2937", fontSize: "18px", fontWeight: "700" }}>Recent History</h3>
        
        {/* FIXED CLOSE BUTTON */}
        <button 
            onClick={handleClose}
            onMouseEnter={() => setIsHoveringClose(true)}
            onMouseLeave={() => setIsHoveringClose(false)}
            style={closeBtnStyle}
            title="Close Sidebar"
        >
            ×
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {history.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
                <p style={{ margin: "10px 0", fontSize: "14px" }}>No history yet.</p>
                <span style={{ fontSize: "12px" }}>Files you embed will appear here.</span>
            </div>
        ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {history.map((item, index) => (
                <li key={index} style={getItemStyle(item)}>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>{item.time}</span>
                    <span style={{
                        fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "12px",
                        background: item.status === "SUCCESS" ? "#ecfdf5" : "#fef2f2",
                        color: item.status === "SUCCESS" ? "#059669" : "#dc2626",
                        letterSpacing: "0.5px"
                    }}>
                        {item.status}
                    </span>
                </div>

                <div style={{ fontWeight: "700", color: "#374151", fontSize: "14px", marginBottom: "4px" }}>{item.type}</div>
                <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.4", wordBreak: "break-word" }}>{item.message}</div>

                {item.key && item.url && (
                    <div style={{ marginTop: "15px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", marginBottom: "6px", letterSpacing: "0.5px" }}>QUANTUM SESSION KEY:</div>
                        
                        <code style={{ display:"block", fontSize: "11px", background: "#fff", padding: "10px", border: "1px solid #e5e7eb", borderRadius: "6px", wordBreak: "break-all", color: "#4b5563", fontFamily: "monospace", maxHeight: "80px", overflowY: "auto" }}>
                            {item.key}
                        </code>
                        
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            <button onClick={() => handleCopy(item.key, index)} style={copyBtnStyle}>
                                {copyFeedbackAt === index ? "Copied!" : "Copy Key"}
                            </button>
                            
                            <button 
                                onClick={() => handleForceDownload(`${API_URL}${item.url}`, index)} 
                                style={downloadBtnStyle}
                                disabled={downloadingAt === index}
                            >
                                {downloadingAt === index ? "Downloading..." : "Download"}
                            </button>
                        </div>
                    </div>
                )}
                </li>
            ))}
            </ul>
        )}
      </div>
    </div>
  );
}