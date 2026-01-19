import React, { useState, useRef, useCallback } from "react";
import { Modal, Button, Spin, message } from "antd";
import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import html2pdf from "html2pdf.js";

/**
 * GuidePDFPreview Component
 *
 * A reusable component that provides PDF preview and download functionality
 * for user guide pages. It captures the guide content and converts it to PDF.
 *
 * Usage:
 * 1. Wrap your guide content in a div with a ref
 * 2. Pass the ref to this component
 * 3. The component provides buttons to preview and download PDF
 */

const GuidePDFPreview = ({
  contentRef,
  title = "User Guide",
  buttonText = "Download PDF",
  buttonStyle = {},
  showPreviewButton = true,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const iframeRef = useRef(null);

  // Generate proper filename - "Autohub Admin Guide" format
  const getFormattedFilename = () => {
    // Convert title to proper format: "Autohub Admin Guide"
    let cleanTitle = title.replace(/User Guide/gi, "Guide").trim();
    if (!cleanTitle.toLowerCase().includes("autohub")) {
      cleanTitle = `Autohub ${cleanTitle}`;
    }
    return cleanTitle;
  };

  // Generate PDF from content
  const generatePDF = useCallback(async () => {
    if (!contentRef?.current) {
      message.error("Guide content not found");
      return null;
    }

    setLoading(true);

    try {
      // Clone the content to avoid modifying the original
      const clonedContent = contentRef.current.cloneNode(true);

      // Remove elements that should not appear in PDF
      const elementsToRemove = clonedContent.querySelectorAll(
        ".pdf-hide, .ant-btn, .breadcrumb, .page-title-box, button"
      );
      elementsToRemove.forEach((el) => el.remove());

      // Create a wrapper for proper PDF styling with READABLE colors
      const wrapper = document.createElement("div");
      wrapper.style.cssText = `
        padding: 40px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: white;
        color: #000000;
        max-width: 800px;
        margin: 0 auto;
      `;

      const formattedTitle = getFormattedFilename();

      // Add title header to PDF
      const header = document.createElement("div");
      header.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #1890ff;">
          <h1 style="color: #1890ff; margin: 0; font-size: 28px;">${formattedTitle}</h1>
          <p style="color: #333333; margin-top: 10px; font-size: 14px;">AutoHub Dashboard</p>
        </div>
      `;
      wrapper.appendChild(header);

      // Add comprehensive styles to make all text dark and readable
      const styles = document.createElement("style");
      styles.textContent = `
        * {
          box-sizing: border-box;
          color: #000000 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        h1, h2 { 
          color: #1890ff !important; 
          margin-top: 24px;
          margin-bottom: 12px;
          font-weight: 700;
        }
        
        h3, h4, h5, h6 { 
          color: #333333 !important; 
          margin-top: 20px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        p, span, div, li, td, th {
          color: #000000 !important;
          line-height: 1.6;
          font-size: 14px;
        }
        
        ul, ol { 
          padding-left: 24px; 
          margin-bottom: 16px;
        }
        
        li { 
          margin-bottom: 8px; 
          line-height: 1.6; 
          color: #000000 !important;
        }
        
        strong, b {
          color: #000000 !important;
          font-weight: 700;
        }
        
        .ant-card { 
          border: 1px solid #d9d9d9 !important; 
          padding: 16px; 
          margin-bottom: 16px; 
          border-radius: 8px;
          background: #ffffff !important;
        }
        
        .ant-card-body {
          background: #ffffff !important;
        }
        
        .ant-alert { 
          padding: 12px; 
          border-radius: 6px; 
          margin: 12px 0;
          background: #f5f5f5 !important;
          border: 1px solid #d9d9d9 !important;
        }
        
        .ant-alert-message,
        .ant-alert-description {
          color: #000000 !important;
        }
        
        .ant-tag { 
          display: inline-block; 
          padding: 2px 8px; 
          border-radius: 4px; 
          margin-right: 4px;
          background: #e6f7ff !important;
          border: 1px solid #91d5ff !important;
          color: #0050b3 !important;
          font-weight: 600;
        }
        
        .ant-typography {
          color: #000000 !important;
        }
        
        .step-card {
          background: #f9f9f9 !important;
          border: 1px solid #d9d9d9 !important;
          border-left: 4px solid #1890ff !important;
        }
        
        /* Override any dark theme colors */
        [class*="ant-"] {
          color: #000000 !important;
        }
        
        /* Make sure all text is selectable */
        * {
          user-select: text !important;
          -webkit-user-select: text !important;
        }
      `;
      wrapper.appendChild(styles);

      const processedContent =
        clonedContent.querySelector(".guide-card") || clonedContent;
      wrapper.appendChild(processedContent);

      // PDF options for professional output with selectable text
      const opt = {
        margin: [15, 15, 15, 15],
        filename: `${formattedTitle.replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      // Generate PDF blob
      const blob = await html2pdf().set(opt).from(wrapper).outputPdf("blob");
      const url = URL.createObjectURL(blob);

      setPdfBlob(blob);
      setPdfUrl(url);
      setLoading(false);

      return { blob, url, filename: opt.filename };
    } catch (error) {
      console.error("PDF generation error:", error);
      message.error("Failed to generate PDF. Please try again.");
      setLoading(false);
      return null;
    }
  }, [contentRef, title]);

  // Open preview modal
  const handlePreview = async () => {
    setPreviewVisible(true);
    if (!pdfUrl) {
      await generatePDF();
    }
  };

  // Download PDF directly
  const handleDownload = async () => {
    setLoading(true);
    let blob = pdfBlob;
    let filename = `${getFormattedFilename().replace(/\s+/g, "_")}.pdf`;

    if (!blob) {
      const result = await generatePDF();
      if (result) {
        blob = result.blob;
        filename = result.filename;
      }
    }

    if (blob) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success("PDF downloaded successfully!");
    }

    setLoading(false);
  };

  // Close modal and cleanup
  const handleClose = () => {
    setPreviewVisible(false);
  };

  // Download from preview modal
  const handleDownloadFromPreview = () => {
    if (pdfBlob) {
      const filename = `${getFormattedFilename().replace(/\s+/g, "_")}.pdf`;
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success("PDF downloaded successfully!");
    }
  };

  const formattedTitle = getFormattedFilename();

  return (
    <>
      {/* Preview and Download Buttons */}
      <div
        className="pdf-hide"
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          ...buttonStyle,
        }}
      >
        {showPreviewButton && (
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={handlePreview}
            loading={loading}
            size="middle"
          >
            Preview PDF
          </Button>
        )}
        <Button
          type="default"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          loading={loading}
          size="middle"
        >
          {buttonText}
        </Button>
      </div>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title={`${formattedTitle} - PDF Preview`}
        onCancel={handleClose}
        width={900}
        centered
        footer={[
          <Button key="close" onClick={handleClose}>
            Close
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadFromPreview}
            disabled={!pdfUrl}
          >
            Download PDF
          </Button>,
        ]}
        bodyStyle={{
          height: "70vh",
          padding: 0,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Spin size="large" tip="Generating PDF preview..." />
          </div>
        ) : pdfUrl ? (
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            title="PDF Preview"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              color: "#999",
            }}
          >
            Click &quot;Preview PDF&quot; to generate preview
          </div>
        )}
      </Modal>
    </>
  );
};

export default GuidePDFPreview;
