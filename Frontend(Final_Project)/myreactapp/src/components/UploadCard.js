import React, { useCallback, useRef, useState } from "react";

export default function UploadCard({ onFile, file }) {
  const [isHover, setIsHover] = useState(false);
  const inputRef = useRef(null);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsHover(false);
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f && onFile) onFile(f);
    },
    [onFile]
  );

  const onDragOver = (e) => {
    e.preventDefault();
    setIsHover(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setIsHover(false);
  };

  const onPick = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f && onFile) onFile(f);
  };

  return (
    <div>
      <div
        className={`dropzone ${isHover ? "dropzone-hover" : ""}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current && inputRef.current.click()}
      >
        <div className="dz-content">
          <div className="dz-title">Drag & Drop image here</div>
          <div className="dz-sub">or click to choose a file</div>
          {file && <div className="dz-file">Selected: {file.name}</div>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        style={{ display: "none" }}
      />
    </div>
  );
}