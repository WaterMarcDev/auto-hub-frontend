import React, { useRef, useEffect, useState } from "react";
import { Button, Space, message } from "antd";
import { uploadAPI } from "../utils/api";

const SignatureCanvas = ({ value, onChange, disabled = false }) => {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [signaturePreview, setSignaturePreview] = useState(value || null);
  const [uploading, setUploading] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  // Update signature preview when value changes (edit mode)
  useEffect(() => {
    if (value && value !== signaturePreview) {
      setSignaturePreview(value);
    }
  }, [value, signaturePreview]);

  const initializeCanvas = () => {
    // Initialize canvas for high DPI screens
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width || canvas.clientWidth || 800;
    const cssHeight = rect.height || canvas.clientHeight || 160;
    canvas.width = Math.round(cssWidth * ratio);
    canvas.height = Math.round(cssHeight * ratio);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
  };

  useEffect(() => {
    initializeCanvas();
  }, [canvasKey]);

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const native = e.nativeEvent || e;
    const offsetX =
      (native && (native.offsetX ?? native.layerX ?? native.pageX)) ??
      undefined;
    const offsetY =
      (native && (native.offsetY ?? native.layerY ?? native.pageY)) ??
      undefined;
    if (typeof offsetX === "number" && typeof offsetY === "number") {
      return { x: offsetX, y: offsetY };
    }

    const clientX =
      e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX);
    const clientY =
      e.clientY ?? (e.touches && e.touches[0] && e.touches[0].clientY);
    const x = (clientX ?? 0) - rect.left;
    const y = (clientY ?? 0) - rect.top;
    return { x, y };
  };

  const handlePointerDown = (e) => {
    if (disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    if (canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    const pos = getCanvasPos(e);
    lastPos.current = pos;
  };

  const handlePointerMove = (e) => {
    if (!drawing.current || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getCanvasPos(e);
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const handlePointerUp = () => {
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas && canvas.releasePointerCapture) {
      try {
        canvas.releasePointerCapture();
      } catch {
        // ignore
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignaturePreview(null);
    if (onChange) onChange(null);
    // Force canvas re-initialization by changing key
    setCanvasKey((prev) => prev + 1);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to blob
    const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
    if (!blob) {
      message.error("Failed to read signature from canvas");
      return;
    }

    // Create a file to upload
    const file = new File([blob], `signature-${Date.now()}.png`, {
      type: "image/png",
    });

    setUploading(true);
    try {
      const resp = await uploadAPI.uploadImage(file);
      const result = resp.data || resp;

      const possible =
        result.url ||
        result.imageUrl ||
        result.path ||
        result.filename ||
        result.file ||
        result.originalName ||
        result.name;
      const uploadedUrl = uploadAPI.getImageUrl(possible);

      if (!uploadedUrl) {
        const dataUrl = canvas.toDataURL("image/png");
        setSignaturePreview(dataUrl);
        if (onChange) onChange(dataUrl);
        message.warning(
          "Uploaded signature but server did not return a file URL; using local data URL."
        );
      } else {
        setSignaturePreview(uploadedUrl);
        if (onChange) onChange(uploadedUrl);
        message.success("Signature uploaded successfully");
      }
    } catch (err) {
      console.error("Signature upload failed:", err);
      message.error(
        err.response?.data?.error || err.message || "Failed to upload signature"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Canvas for drawing */}
      {!signaturePreview && (
        <div style={{ marginBottom: 16 }}>
          <canvas
            key={canvasKey}
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              cursor: disabled ? "not-allowed" : "crosshair",
              touchAction: "none",
              width: "100%",
              height: "160px",
              backgroundColor: "#fff",
            }}
          />
          <Space style={{ marginTop: 8 }}>
            <Button
              size="small"
              onClick={saveSignature}
              type="primary"
              loading={uploading}
              disabled={disabled}
            >
              Save Signature
            </Button>
            <Button size="small" onClick={clearSignature} disabled={disabled}>
              Clear
            </Button>
          </Space>
        </div>
      )}

      {/* Preview of saved signature */}
      {signaturePreview && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              padding: "8px",
              backgroundColor: "#f5f5f5",
              textAlign: "center",
            }}
          >
            <img
              src={signaturePreview}
              alt="Signature"
              style={{
                maxWidth: "100%",
                maxHeight: "150px",
                objectFit: "contain",
              }}
            />
          </div>
          <Button
            size="small"
            onClick={clearSignature}
            style={{ marginTop: 8 }}
            disabled={disabled}
          >
            Clear & Redraw
          </Button>
        </div>
      )}
    </div>
  );
};

export default SignatureCanvas;
