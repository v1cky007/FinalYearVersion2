import React, { useState, useEffect } from "react";
// UPDATED IMPORT PATH:
import "./excess.css"; 

function Login({ allowedUsers, onLoginSuccess, onCancel }) {
  const [email, setEmail] = useState(localStorage.getItem("lastGovEmail") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [accessLogs, setAccessLogs] = useState([]);

  useEffect(() => {
    const savedLogs = localStorage.getItem("accessLogs");
    if (savedLogs) {
      try {
        const decoded = atob(savedLogs);
        setAccessLogs(JSON.parse(decoded));
      } catch {
        setAccessLogs([]);
      }
    }
  }, []);

  const saveLogs = (logs) => {
    localStorage.setItem("accessLogs", btoa(JSON.stringify(logs)));
  };

  useEffect(() => {
    if (lockoutTime <= 0) return;
    const timer = setInterval(() => {
      setLockoutTime((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const time = new Date().toLocaleString();
    return `${platform} | ${userAgent.split(")")[0]}) | ${time}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (lockoutTime > 0) {
      setError(`Too many failed attempts. Try again in ${lockoutTime}s.`);
      return;
    }

    if (!email || !password) {
      setError("Enter email and password.");
      return;
    }

    if (!email.endsWith("@gov.in")) {
      setError("Email must end with @gov.in");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const expectedPassword = allowedUsers[email];
      const success = expectedPassword && expectedPassword === password;
      const timestamp = new Date().toLocaleString();

      const logEntry = {
        email,
        timestamp,
        device: getDeviceInfo(),
        status: success ? "ACCESS GRANTED" : "ACCESS DENIED",
      };

      const updatedLogs = [...accessLogs, logEntry].slice(-10);
      setAccessLogs(updatedLogs);
      saveLogs(updatedLogs);

      if (success) {
        localStorage.setItem("lastGovEmail", email);
        setAttempts(0);
        onLoginSuccess(email);
      } else {
        setAttempts((prev) => prev + 1);
        if (attempts + 1 >= 3) {
          setLockoutTime(60);
          setError("Too many failed attempts. Locked for 60 seconds.");
        } else {
          setError("Invalid credentials or unauthorized access.");
        }
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal login-modal neon-border">
        <h2>Secure Access</h2>
        <p className="subtext">Authorized Personnel Only</p>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <label>Email</label>
          <input
            type="email"
            autoFocus
            placeholder="Enter your @gov.in email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || lockoutTime > 0}
          />

          <label style={{ marginTop: 12 }}>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || lockoutTime > 0}
          />

          {error && <div className="error">{error}</div>}

          <div className="modal-buttons">
            <button type="button" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading || lockoutTime > 0}>
              {loading ? "Verifying..." : "Login"}
            </button>
          </div>
        </form>

        {accessLogs.length > 0 && (
          <div className="access-log">
            <h4>Recent Access Logs</h4>
            <ul>
              {accessLogs.slice(-3).reverse().map((log, idx) => (
                <li key={idx}>
                  <strong>{log.email}</strong> - {log.status}
                  <br />
                  <small>{log.device}</small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;