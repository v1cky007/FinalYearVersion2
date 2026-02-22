import React, { useState } from "react";

export default function LogoutDrawer({ onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`logout-drawer ${open ? "open" : ""}`}
      onClick={() => setOpen((s) => !s)}
      role="button"
      aria-label="Toggle logout drawer"
    >
      {open && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLogout();
          }}
          className="drawer-logout-btn"
          title="Log out"
        >
          Log Out
        </button>
      )}
    </div>
  );
}