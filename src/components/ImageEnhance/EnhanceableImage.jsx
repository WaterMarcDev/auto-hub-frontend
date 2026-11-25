// antd <Image> with an "Enhance" button in its preview toolbar. Enhance
// improves the picture itself (cleans up, sharpens and enlarges it, see
// utils/imageEnhance.js) and shows the result right in the same preview;
// it does not open a separate zoom viewer. The stored image is not changed.
import React, { useState } from "react";
import { Image, Button, Space, Tooltip, message } from "antd";
import { ThunderboltOutlined, DownloadOutlined, SwapOutlined } from "@ant-design/icons";
import { enhanceImage } from "../../utils/imageEnhance";

const EnhanceableImage = ({ src, alt, preview, ...imageProps }) => {
  const [enhanced, setEnhanced] = useState(null); // { url, width, height }
  const [showEnhanced, setShowEnhanced] = useState(true);
  const [loading, setLoading] = useState(false);
  const previewConfig = preview === false ? false : typeof preview === "object" ? preview : {};

  const enhance = async () => {
    if (enhanced) {
      setShowEnhanced(true);
      return;
    }
    setLoading(true);
    try {
      setEnhanced(await enhanceImage(src));
      setShowEnhanced(true);
    } catch (err) {
      message.error(err.message || "Could not enhance this image");
    } finally {
      setLoading(false);
    }
  };

  const viewingEnhanced = Boolean(enhanced && showEnhanced);
  const fileName = `${String(alt || "image").replace(/[^\w-]+/g, "_")}-enhanced.jpg`;

  return (
    <Image
      src={src}
      alt={alt}
      {...imageProps}
      preview={
        previewConfig && {
          ...previewConfig,
          src: viewingEnhanced ? enhanced.url : previewConfig.src || src,
          onVisibleChange: (visible, prevVisible) => {
            if (!visible) setShowEnhanced(true);
            previewConfig.onVisibleChange?.(visible, prevVisible);
          },
          // Built-in zoom / rotate buttons stay; Enhance is added next to them.
          toolbarRender: (originalNode) => (
            <Space size={12} align="center" wrap>
              {originalNode}
              {!viewingEnhanced ? (
                <Button
                  type="primary"
                  size="small"
                  icon={<ThunderboltOutlined />}
                  loading={loading}
                  onClick={enhance}
                >
                  {loading ? "Enhancing…" : "Enhance"}
                </Button>
              ) : (
                <>
                  <Tooltip title={`${enhanced.width} × ${enhanced.height}px`}>
                    <span style={{ color: "#52c41a", fontWeight: 600 }}>Enhanced</span>
                  </Tooltip>
                  <Button size="small" icon={<SwapOutlined />} onClick={() => setShowEnhanced(false)}>
                    Show original
                  </Button>
                  <Button size="small" icon={<DownloadOutlined />} href={enhanced.url} download={fileName}>
                    Download
                  </Button>
                </>
              )}
            </Space>
          ),
        }
      }
    />
  );
};

export default EnhanceableImage;
