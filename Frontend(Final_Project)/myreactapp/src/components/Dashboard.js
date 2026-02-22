import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Dashboard() {
  const [data, setData] = useState({
    stats: { files_secured: 0, attacks_blocked: 0, active_keys: 0 },
    activity_log: [],
    blockchain_log: [],
    system_health: {
        disk_usage_mb: 0,
        cpu_load: 0,
        ram_usage: 0,
        threat_level: "LOW", // Kept in state but hidden from UI
        uptime: "0:00:00",
        quantum_entropy: 99.9
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/dashboard-stats/");
        if (res.data) setData(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- STYLES ---
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "20px"
  };

  const cardStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
  };

  const titleStyle = {
    fontSize: "12px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: "10px",
    letterSpacing: "0.5px"
  };

  const bigNumberStyle = {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: "5px"
  };

  const ProgressBar = ({ label, value, color }) => (
      <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px", color: "#4b5563" }}>
              <span>{label}</span>
              <span>{value}%</span>
          </div>
          <div style={{ width: "100%", height: "6px", background: "#f3f4f6", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${value}%`, height: "100%", background: color, transition: "width 0.5s ease" }}></div>
          </div>
      </div>
  );

  return (
    <div style={{ width: "100%", textAlign: "left" }}>
      
      {/* 1. KEY METRICS ROW (Removed Threat Level) */}
      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={titleStyle}>Files Secured</div>
          <div style={bigNumberStyle}>{data.stats.files_secured}</div>
          <div style={{ fontSize: "12px", color: "#10b981" }}>+24% from last week</div>
        </div>
        <div style={cardStyle}>
          <div style={titleStyle}>Attacks Blocked</div>
          <div style={{ ...bigNumberStyle, color: "#ef4444" }}>{data.stats.attacks_blocked}</div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>AI Defense Active</div>
        </div>
        <div style={cardStyle}>
          <div style={titleStyle}>System Uptime</div>
          <div style={{ ...bigNumberStyle, fontSize: "28px" }}>{data.system_health?.uptime || "0:00:00"}</div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>Since last reboot</div>
        </div>
      </div>

      {/* 2. SYSTEM HEALTH & LOGS ROW */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        
        {/* SERVER HEALTH */}
        <div style={{ ...cardStyle, flex: "1", minWidth: "300px" }}>
            <h3 style={{ ...titleStyle, fontSize: "14px", borderBottom: "1px solid #f3f4f6", paddingBottom: "10px" }}>System Health</h3>
            
            <div style={{ marginTop: "20px" }}>
                <ProgressBar label="CPU Load" value={data.system_health?.cpu_load || 0} color="#6366f1" />
                <ProgressBar label="Memory Usage" value={data.system_health?.ram_usage || 0} color="#8b5cf6" />
                <ProgressBar label="Disk Usage (MB)" value={(data.system_health?.disk_usage_mb % 100) || 0} color="#f59e0b" />
                
                <div style={{ marginTop: "25px", paddingTop: "15px", borderTop: "1px dashed #e5e7eb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>Quantum Entropy</span>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: "#10b981" }}>{data.system_health?.quantum_entropy}%</span>
                    </div>
                    <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>Encryption Randomness Quality</div>
                </div>
            </div>
        </div>

        {/* SECURITY LOG */}
        <div style={{ ...cardStyle, flex: "2", minWidth: "500px", maxHeight: "400px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <h3 style={{ ...titleStyle, fontSize: "14px", borderBottom: "1px solid #f3f4f6", paddingBottom: "10px" }}>Live Security Feed</h3>
            
            <div style={{ overflowY: "auto", flex: 1, paddingRight: "5px" }}>
                <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse", tableLayout: "fixed" }}>
                    <thead style={{ position: "sticky", top: 0, background: "white", zIndex: 10 }}>
                        <tr style={{ textAlign: "left", color: "#9ca3af", fontSize: "11px", borderBottom: "1px solid #f3f4f6" }}>
                            <th style={{ padding: "8px 10px 8px 0", width: "90px" }}>DATE</th>
                            <th style={{ padding: "8px 10px 8px 0", width: "80px" }}>TIME</th>
                            <th style={{ padding: "8px 10px 8px 0", width: "100px" }}>EVENT</th>
                            <th style={{ padding: "8px 10px 8px 0" }}>DETAILS</th>
                            <th style={{ padding: "8px 0", width: "90px", textAlign: "right" }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.activity_log.map((log, i) => {
                            // Safe parsing of time string
                            const timeStr = log.time || "2024-01-01 00:00:00";
                            const [datePart, timePart] = timeStr.split(' ');
                            return (
                                <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                                    <td style={{ padding: "10px 10px 10px 0", color: "#6b7280", fontWeight: "500" }}>{datePart}</td>
                                    <td style={{ padding: "10px 10px 10px 0", color: "#9ca3af", fontFamily: "monospace" }}>{timePart}</td>
                                    <td style={{ padding: "10px 10px 10px 0", fontWeight: "700", color: "#374151" }}>{log.type}</td>
                                    <td style={{ padding: "10px 10px 10px 0", color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={log.message}>
                                        {log.message}
                                    </td>
                                    <td style={{ padding: "10px 0", textAlign: "right" }}>
                                        <span style={{
                                            fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "4px",
                                            background: log.status === "SUCCESS" ? "#ecfdf5" : log.status === "BLOCKED" ? "#fef2f2" : "#f3f4f6",
                                            color: log.status === "SUCCESS" ? "#059669" : log.status === "BLOCKED" ? "#dc2626" : "#4b5563"
                                        }}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}