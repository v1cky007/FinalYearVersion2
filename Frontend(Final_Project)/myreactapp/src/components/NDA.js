import React, { useState, useRef } from "react";
// UPDATED IMPORT PATH:
import "./excess.css";

function NDA({ onAgree, onCancel }) {
  const [checked, setChecked] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const scrollBoxRef = useRef(null);

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = scrollBoxRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setScrolledToEnd(true);
    }
  };

  const handleAgree = () => {
    if (!checked || !scrolledToEnd) {
      alert("Please read the entire NDA and agree before continuing.");
      return;
    }
    onAgree();
  };

  const handleDownload = () => {
    const ndaText = `
NON-DISCLOSURE AGREEMENT (NDA)
-----------------------------------

This Non-Disclosure Agreement ("Agreement") outlines the confidentiality terms between the authorized user (“Collaborator”) and this platform (“System”).

By proceeding, you acknowledge that all proprietary algorithms, encryption models, datasets, UI/UX assets, and backend frameworks are classified. Unauthorized disclosure, duplication, or analysis is strictly prohibited.

All transmitted and stored data within this environment are monitored and secured using blockchain-based traceability. Every interaction is logged and verified for compliance integrity.

Collaborators are required to:
1. Refrain from reverse engineering or replicating platform mechanisms.
2. Protect intellectual property in all project phases.
3. Report any breach or irregular access immediately.

Breach of this Agreement results in immediate access revocation, data nullification, and possible legal proceedings under applicable digital protection acts.

By agreeing, you affirm that you understand the sensitive nature of the materials shared and accept full legal responsibility for upholding confidentiality.
    `;
    const blob = new Blob([ndaText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "NDA_Agreement.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="nda-overlay">
      <div className="nda-card">
        <h1 className="nda-title">Non-Disclosure Agreement (NDA)</h1>
        <p className="nda-subtext">Confidential Collaboration Protocol</p>

        <div className="nda-scrollbox" ref={scrollBoxRef} onScroll={handleScroll}>
          <p>
            This Non-Disclosure Agreement ("Agreement") outlines the confidentiality terms between
            the authorized user (“Collaborator”) and this platform (“System”).
          </p>
          <p>
            By proceeding, you acknowledge that all proprietary algorithms, encryption models,
            datasets, UI/UX assets, and backend frameworks are classified. Unauthorized disclosure,
            duplication, or analysis is strictly prohibited.
          </p>
          <p>
            All transmitted and stored data within this environment are monitored and secured using
            blockchain-based traceability. Every interaction is logged and verified for compliance
            integrity.
          </p>
          <p>
            Collaborators are required to:
            <ul>
              <li>Refrain from reverse engineering or replicating platform mechanisms.</li>
              <li>Protect intellectual property in all project phases.</li>
              <li>Report any breach or irregular access immediately.</li>
            </ul>
          </p>
          <p>
            Breach of this Agreement results in immediate access revocation, data nullification, and
            possible legal proceedings under applicable digital protection acts.
          </p>
          <p>
            By agreeing, you affirm that you understand the sensitive nature of the materials shared
            and accept full legal responsibility for upholding confidentiality.
          </p>
          <p>
            Access is provided only upon successful validation of your digital identity and
            compliance acknowledgment. All user activity is cryptographically logged.
          </p>
        </div>

        {!scrolledToEnd && (
          <p className="nda-scroll-hint">
            ⚠️ Scroll to the end of the agreement to enable the checkbox and agree button.
          </p>
        )}

        <div className="nda-checkbox">
          <input
            type="checkbox"
            disabled={!scrolledToEnd}
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>I have read and agree to all terms in this NDA</span>
        </div>

        <div className="nda-buttons">
          <button className="download-btn" onClick={handleDownload}>
            Download Copy
          </button>
          <button
            className="agree-btn"
            disabled={!checked || !scrolledToEnd}
            onClick={handleAgree}
          >
            I Agree
          </button>
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>

        <p className="nda-hint">
          By continuing, you authorize monitored access within a secure digital framework.
        </p>
      </div>
    </div>
  );
}

export default NDA;