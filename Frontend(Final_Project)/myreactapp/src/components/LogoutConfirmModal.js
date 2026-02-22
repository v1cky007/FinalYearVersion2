import React, { useState } from "react";

export default function LogoutConfirmModal({ currentUser, allowedUsers, onClose, onConfirmSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    if (!currentUser) {
      setError("No user found.");
      return;
    }
    setError("");
    setLoading(true);

    setTimeout(() => {
      const expected = allowedUsers[currentUser];
      if (expected && password === expected) {
        onConfirmSuccess();
      } else {
        setError("Password incorrect. Logout failed.");
      }
      setLoading(false);
    }, 700);
  };

  return (
    <div className="modal-overlay">
      <div className="modal login-modal" style={{ width: 420 }}>
        <h2>Confirm Log Out</h2>
        <p className="subtext">To log out, re-enter your password for {currentUser}</p>

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password to confirm logout"
        />
        {error && <div className="error">{error}</div>}

        <div className="modal-buttons" style={{ marginTop: 16 }}>
          <button onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading}>
            {loading ? "Checking..." : "Confirm Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}