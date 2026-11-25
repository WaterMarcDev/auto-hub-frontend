// "Adjust photo" step shown after a photo is picked or taken (Car Intake):
// crop it (drag the box or its corners), rotate it, and optionally Enhance
// it. "Save photo" hands back the final image as a JPEG File; "Use original"
// hands back the file unchanged.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Button, Space, Spin, Alert, Typography, Tag } from "antd";
import {
  RotateLeftOutlined,
  RotateRightOutlined,
  ThunderboltOutlined,
  UndoOutlined,
  ScissorOutlined,
} from "@ant-design/icons";
import {
  loadImage,
  rotateToCanvas,
  cropCanvas,
  enhanceCanvas,
  canvasToFile,
} from "../../utils/imageEnhance";

const { Text } = Typography;

const FULL = { x: 0, y: 0, w: 1, h: 1 };
const MIN_SIZE = 0.05; // smallest crop box, as a fraction of the image
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// Crop box over the (rotated) image. `crop` is { x, y, w, h } in fractions.
const CropArea = ({ src, crop, onChange }) => {
  const boxRef = useRef(null);
  const drag = useRef(null);

  const onPointerDown = (mode) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = boxRef.current.getBoundingClientRect();
    drag.current = { mode, startX: e.clientX, startY: e.clientY, rect, start: crop };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = useCallback(
    (e) => {
      const d = drag.current;
      if (!d) return;
      const dx = (e.clientX - d.startX) / d.rect.width;
      const dy = (e.clientY - d.startY) / d.rect.height;
      const s = d.start;
      let { x, y, w, h } = s;
      if (d.mode === "move") {
        x = clamp(s.x + dx, 0, 1 - s.w);
        y = clamp(s.y + dy, 0, 1 - s.h);
      } else {
        const right = s.x + s.w;
        const bottom = s.y + s.h;
        if (d.mode.includes("w")) x = clamp(s.x + dx, 0, right - MIN_SIZE);
        if (d.mode.includes("n")) y = clamp(s.y + dy, 0, bottom - MIN_SIZE);
        const r = d.mode.includes("e") ? clamp(right + dx, x + MIN_SIZE, 1) : right;
        const b = d.mode.includes("s") ? clamp(bottom + dy, y + MIN_SIZE, 1) : bottom;
        w = r - x;
        h = b - y;
      }
      onChange({ x, y, w, h });
    },
    [onChange]
  );

  const onPointerUp = useCallback(() => {
    drag.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }, [onPointerMove]);

  useEffect(
    () => () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    },
    [onPointerMove, onPointerUp]
  );

  const handle = (mode, style) => (
    <div
      onPointerDown={onPointerDown(mode)}
      style={{
        position: "absolute",
        width: 18,
        height: 18,
        background: "#fff",
        border: "2px solid #1677ff",
        borderRadius: 3,
        touchAction: "none",
        ...style,
      }}
    />
  );

  return (
    <div style={{ textAlign: "center", background: "#111", borderRadius: 8, padding: 8 }}>
      <div
        ref={boxRef}
        style={{ position: "relative", display: "inline-block", overflow: "hidden", lineHeight: 0, userSelect: "none" }}
      >
        <img
          src={src}
          alt="To crop"
          draggable={false}
          style={{ maxWidth: "100%", maxHeight: "60vh", display: "block" }}
        />
        <div
          onPointerDown={onPointerDown("move")}
          style={{
            position: "absolute",
            left: `${crop.x * 100}%`,
            top: `${crop.y * 100}%`,
            width: `${crop.w * 100}%`,
            height: `${crop.h * 100}%`,
            border: "2px dashed #fff",
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
            cursor: "move",
            touchAction: "none",
          }}
        >
          {handle("nw", { left: -9, top: -9, cursor: "nwse-resize" })}
          {handle("ne", { right: -9, top: -9, cursor: "nesw-resize" })}
          {handle("sw", { left: -9, bottom: -9, cursor: "nesw-resize" })}
          {handle("se", { right: -9, bottom: -9, cursor: "nwse-resize" })}
        </div>
      </div>
    </div>
  );
};

const ImageAdjustModal = ({ file, onDone, onCancel }) => {
  const [image, setImage] = useState(null); // loaded original
  const [rotation, setRotation] = useState(0);
  const [rotatedUrl, setRotatedUrl] = useState(null);
  const [crop, setCrop] = useState(FULL);
  const [enhanced, setEnhanced] = useState(null); // { canvas, url }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const rotatedRef = useRef(null);

  // Load the picked file.
  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    let alive = true;
    loadImage(url)
      .then((img) => alive && setImage(img))
      .catch(() => alive && setError("Could not open this photo"));
    return () => {
      alive = false;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Rotated copy shown in the crop area.
  useEffect(() => {
    if (!image) return;
    const canvas = rotateToCanvas(image, rotation);
    rotatedRef.current = canvas;
    setRotatedUrl(canvas.toDataURL("image/jpeg", 0.9));
  }, [image, rotation]);

  const rotate = (deg) => {
    setRotation((r) => (r + deg + 360) % 360);
    setCrop(FULL);
    setEnhanced(null);
  };

  const croppedCanvas = () => cropCanvas(rotatedRef.current, crop);

  // Enhance runs on the cropped area; the result replaces the crop view.
  const runEnhance = () => {
    setBusy(true);
    setError(null);
    // Let the spinner paint before the (synchronous) pixel work.
    setTimeout(() => {
      try {
        const canvas = enhanceCanvas(croppedCanvas());
        setEnhanced({ canvas, url: canvas.toDataURL("image/jpeg", 0.9) });
      } catch (e) {
        setError(e.message || "Could not enhance this photo");
      } finally {
        setBusy(false);
      }
    }, 30);
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const unchanged = !enhanced && rotation === 0 && crop === FULL;
      const out = unchanged ? file : await canvasToFile(enhanced?.canvas || croppedCanvas(), file.name);
      onDone(out);
    } catch (e) {
      setError(e.message || "Could not save this photo");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={Boolean(file)}
      title={
        <Space>
          <ScissorOutlined /> Adjust photo
          {enhanced && <Tag color="green">Enhanced</Tag>}
        </Space>
      }
      width={900}
      zIndex={2100}
      maskClosable={false}
      onCancel={onCancel}
      destroyOnHidden
      footer={
        <Space wrap>
          <Button onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => onDone(file)} disabled={busy}>
            Use original
          </Button>
          <Button type="primary" onClick={save} loading={busy} disabled={!rotatedUrl}>
            Save photo
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {error && <Alert type="error" showIcon message={error} />}
        <Space wrap>
          <Button icon={<RotateLeftOutlined />} onClick={() => rotate(-90)} disabled={busy || !image}>
            Rotate left
          </Button>
          <Button icon={<RotateRightOutlined />} onClick={() => rotate(90)} disabled={busy || !image}>
            Rotate right
          </Button>
          {enhanced ? (
            <Button icon={<UndoOutlined />} onClick={() => setEnhanced(null)} disabled={busy}>
              Undo enhance (back to crop)
            </Button>
          ) : (
            <>
              <Button onClick={() => setCrop(FULL)} disabled={busy || crop === FULL}>
                Reset crop
              </Button>
              <Button
                type="primary"
                ghost
                icon={<ThunderboltOutlined />}
                onClick={runEnhance}
                loading={busy}
                disabled={!rotatedUrl}
              >
                Enhance
              </Button>
            </>
          )}
        </Space>
        <Spin spinning={busy || !rotatedUrl} tip={busy ? "Working…" : "Loading…"}>
          {enhanced ? (
            <div style={{ textAlign: "center", background: "#111", borderRadius: 8, padding: 8 }}>
              <img
                src={enhanced.url}
                alt="Enhanced"
                style={{ maxWidth: "100%", maxHeight: "60vh" }}
              />
            </div>
          ) : rotatedUrl ? (
            <CropArea src={rotatedUrl} crop={crop} onChange={setCrop} />
          ) : (
            <div style={{ height: 240 }} />
          )}
        </Spin>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {enhanced
            ? `Enhanced photo: ${enhanced.canvas.width} × ${enhanced.canvas.height}px (cleaned, sharpened and enlarged).`
            : "Drag the box to move it, or its corners to crop. Enhance cleans up, sharpens and enlarges the cropped photo."}
        </Text>
      </Space>
    </Modal>
  );
};

export default ImageAdjustModal;
