import React, { useState } from "react";

/**
 * Image preview with fixed size + download + copy link
 */
export default function ImageViewer({ src }) {
  const [copied, setCopied] = useState(false);

  const doDownload = () => {
    if (!src) return;
    
    // FIX: Switch from the preview URL (/outputs/) to the download URL (/download/)
    // This forces the backend to send the "Content-Disposition: attachment" header
    const downloadUrl = src.replace("/outputs/", "/download/");
    
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = downloadUrl.split("/").pop(); // Browser backup
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const doCopy = async () => {
    if (!src) return;
    try {
      await navigator.clipboard.writeText(src);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const IMAGE_SIZE = 200; 

  return (
    <div className="image-viewer" style={{ textAlign: "center", marginTop: 12 }}>
      <div
        style={{
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          margin: "0 auto",
          borderRadius: 12,
          overflow: "hidden",
          border: "2px solid #ff0033",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#111",
        }}
      >
        <img
          src={src}
          alt="stego-result"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover", 
          }}
        />
      </div>

      <div style={{ margin: 10, display: "flex", justifyContent: "center", gap: 10 }}>
        <button onClick={doDownload}>Download</button>
        <button onClick={doCopy}>{copied ? "Copied!" : "Copy Link"}</button>
      </div>
    </div>
  );
}