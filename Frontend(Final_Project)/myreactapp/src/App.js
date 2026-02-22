import React, { useEffect, useState } from "react";
import ProgressSpinner from "./components/ProgressSpinner";
import NDA from "./components/NDA";
import Login from "./components/Login";

// Components
import HistorySidebar from "./components/HistorySidebar";
import EmbedSection from "./components/EmbedSection";
import ExtractSection from "./components/ExtractSection";
import LogoutDrawer from "./components/LogoutDrawer";
import LogoutConfirmModal from "./components/LogoutConfirmModal";
import Dashboard from "./components/Dashboard";

import "./styles.css";

const HISTORY_KEY = "stego_history_v1";
const MAX_HISTORY = 10;

const allowedUsers = {
  "admin@gov.in": "secure123",
  "officer@gov.in": "govAccess456",
  "director@gov.in": "topsecret789",
  "auditor@gov.in": "audit2025!",
  "itdept@gov.in": "sysLock#99",
};

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  
  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // TABS: 'home' or 'dashboard'
  const [activeTab, setActiveTab] = useState("home"); 

  // Shared state for pre-filling inputs
  const [sharedKey, setSharedKey] = useState("");
  const [sharedImage, setSharedImage] = useState("");

  // Auth / NDA
  const [showNDA, setShowNDA] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ndaAgreed, setNdaAgreed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch (e) {
      console.warn("Could not load history", e);
    }

    const nda = localStorage.getItem("ndaAgreed") === "true";
    const login = localStorage.getItem("isLoggedIn") === "true";
    const user = localStorage.getItem("currentUser") || null;
    if (nda) setNdaAgreed(true);
    if (login) setIsLoggedIn(true);
    if (user) setCurrentUser(user);
  }, []);

  const pushHistory = (item) => {
    const entry = {
        id: Date.now().toString(),
        time: new Date().toISOString(),
        ...item
    };
    
    setHistory((prevHistory) => {
        const next = [entry, ...prevHistory].slice(0, MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
    });
  };

  const checkAuth = () => {
    if (!ndaAgreed) {
      setShowNDA(true);
      return false;
    }
    if (!isLoggedIn) {
      setShowLogin(true);
      return false;
    }
    return true;
  };

  const handleUseHistoryKey = (entry) => {
    setSharedKey(entry.key);
    setSharedImage(entry.stego_url);
    setSidebarOpen(false); 
    setActiveTab("home");
  };

  const handleLoginSuccess = (email) => {
    setIsLoggedIn(true);
    setCurrentUser(email);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", email);
    setShowLogin(false);
    setShowNDA(false);
  };

  const handleLogoutSuccess = () => {
    setIsLoggedIn(false);
    setNdaAgreed(false);
    setCurrentUser(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("ndaAgreed");
    localStorage.removeItem("currentUser");
    setShowLogoutConfirm(false);
    setShowLogin(true);
  };

  // Helper to close sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // --- TAB STYLES ---
  const tabContainerStyle = {
      display: "flex",
      justifyContent: "center",
      marginBottom: "25px",
      marginTop: "10px",
      position: "relative",
      zIndex: 100 
  };

  const tabWrapperStyle = {
      display: "inline-flex",
      gap: "12px",
      background: "#e5e7eb", // Added background container for tabs
      padding: "5px",
      borderRadius: "8px"
  };

  const getTabStyle = (isActive) => ({
      padding: "10px 24px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      letterSpacing: "0.5px",
      transition: "all 0.2s ease",
      color: isActive ? "#ffffff" : "#4b5563", 
      background: isActive ? "#1f2937" : "transparent", 
      boxShadow: isActive ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none",
      transform: isActive ? "translateY(-1px)" : "none",
      outline: "none",
      position: "relative",
      zIndex: 101
  });

  return (
    <div className="app-container">
      {/* GLOBAL STYLE OVERRIDES */}
      <style>{`
        .app-container {
            min-height: 100vh;
            height: auto !important;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
        }
        .container {
            min-height: 85vh;
            height: auto !important; 
            display: flex;
            flex-direction: column;
            margin-bottom: 50px;
            padding-bottom: 50px;
        }
        .main-content {
            flex: 1;
            height: auto !important;
            display: flex;
            flex-direction: column;
        }
        /* Grid Layout for Home Tab */
        .tools-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            width: 100%;
        }
        .left-column {
            display: flex;
            flex-direction: column;
            gap: 30px;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <LogoutDrawer onLogout={() => setShowLogoutConfirm(true)} />

      {/* Sidebar Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {sidebarOpen ? "X" : "Open History"}
      </button>

      {/* History Sidebar */}
      <HistorySidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        history={history} 
        onUseKey={handleUseHistoryKey} 
      />

      <div className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
        <div className="container">
          
          {/* NAVIGATION BUTTONS */}
          <div style={tabContainerStyle}>
              <div style={tabWrapperStyle}>
                  <button 
                    type="button"
                    onClick={() => setActiveTab("home")}
                    style={getTabStyle(activeTab === "home")}
                  >
                    Home
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveTab("dashboard")}
                    style={getTabStyle(activeTab === "dashboard")}
                  >
                    Command Center
                  </button>
              </div>
          </div>

          {error && <div className="error">{error}</div>}
          {loading && (
            <div className="loading">
              <ProgressSpinner />
            </div>
          )}

          {/* === CONTENT SWITCHER === */}
          
          {/* 1. DASHBOARD TAB */}
          {activeTab === "dashboard" && (
             <div style={{ marginTop: "20px", width: "100%", flex: 1 }}>
                <Dashboard />
             </div>
          )}

          {/* 2. HOME TAB (Embed & Extract Only) */}
          {activeTab === "home" && (
             <div className="tools-grid">
               <div className="left-column">
                 <EmbedSection 
                   setError={setError}
                   setLoading={setLoading}
                   isLoggedIn={isLoggedIn}
                   ndaAgreed={ndaAgreed}
                   onAuthTrigger={checkAuth}
                   onHistoryUpdate={pushHistory}
                   prefillKey={sharedKey}
                   prefillImage={sharedImage}
                 />
               </div>

               {/* Right Column: Extract/Retrieve */}
               <div>
                 <ExtractSection 
                   setError={setError}
                   setLoading={setLoading}
                 />
               </div>
             </div>
          )}

          <div style={{ marginTop: 40, color: "#9ca3af", fontSize: 11, textAlign: "center", paddingBottom: "20px" }}>
            Tip: generate a key, copy it, and store it safely. History is stored locally.
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showNDA && (
        <NDA 
          onAgree={() => {
            setNdaAgreed(true);
            localStorage.setItem("ndaAgreed", "true");
            setShowNDA(false);
            if (!isLoggedIn) setShowLogin(true);
          }} 
          onCancel={() => setShowNDA(false)} 
        />
      )}

      {showLogin && (
        <Login
          allowedUsers={allowedUsers}
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setShowLogin(false)}
        />
      )}

      {showLogoutConfirm && (
        <LogoutConfirmModal 
          currentUser={currentUser}
          allowedUsers={allowedUsers}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirmSuccess={handleLogoutSuccess}
        />
      )}
    </div>
  );
}

export default App;