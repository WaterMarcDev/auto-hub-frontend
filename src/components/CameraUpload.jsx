import React, { useState, useRef, useEffect, useCallback } from "react";
import { uploadAPI } from "../utils/api";
import { Modal, Tabs, Button } from "antd";

const CameraUpload = ({
  onImageCapture,
  onImageUpload,
  multiple = false,
  className = "",
  disabled = false,
  showPreview = true,
  autoUpload = true, // New prop to control auto-upload
}) => {
  const [isCamera, setIsCamera] = useState(false);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [stream, setStream] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start camera
  const startCamera = async () => {
    setError("");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        },
      });

      setStream(mediaStream);
      setIsCamera(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  };

  // Stop camera (stable reference)
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCamera(false);
  }, [stream]);

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (blob) {
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });

          await handleImageFile(file);

          if (onImageCapture) {
            onImageCapture(file);
          }
        }
      },
      "image/jpeg",
      0.8
    );

    if (!multiple) {
      stopCamera();
    }
  };

  // Handle individual image file
  const handleImageFile = async (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select only image files");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setError("");

    if (autoUpload) {
      setUploading(true);
      try {
        const response = await uploadAPI.uploadImage(file);
        const result = response.data;

        if (onImageUpload) {
          onImageUpload(result);
        }

        setUploadSuccess(result.originalName);
        setUploading(false);

        setTimeout(() => setUploadSuccess(null), 3000);
        return;
      } catch (err) {
        console.error("Auto-upload error:", err);
        setError(
          err.response?.data?.error || err.message || "Failed to upload image"
        );
        setUploading(false);
      }
    }

    const previewUrl = URL.createObjectURL(file);

    const imageData = {
      file,
      previewUrl,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
    };

    if (multiple) {
      setImages((prev) => [...prev, imageData]);
    } else {
      if (images.length > 0) {
        URL.revokeObjectURL(images[0].previewUrl);
      }
      setImages([imageData]);
    }
  };

  // Remove image
  const removeImage = (id) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  // Upload images
  const uploadImages = async () => {
    if (images.length === 0) {
      setError("No images to upload");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const files = images.map((img) => img.file);
      const response = await uploadAPI.uploadMultiple(files);
      const results = response.data;

      if (onImageUpload) {
        onImageUpload(multiple ? results.files : results.files[0]);
      }

      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setImages([]);
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to upload images"
      );
    } finally {
      setUploading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      images.forEach((img) => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [stream, images]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Modal & Tab state (using antd)
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("camera");

  const openModal = () => {
    setShowModal(true);
    setActiveTab("camera");
    // start camera when modal opens and camera tab active
    setTimeout(() => startCamera(), 150);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
  };

  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    for (const f of files) {
      await handleImageFile(f);
    }
    e.target.value = null;
  };

  // Stop camera whenever modal is closed to cover backdrop/Esc interactions
  useEffect(() => {
    if (!showModal) {
      // ensure camera is stopped when modal closes
      stopCamera();
    }
  }, [showModal, stopCamera]);

  return (
    <div className={`camera-upload ${className}`}>
      {/* Trigger button to open modal */}
      <div className="mb-2">
        <Button
          type="primary"
          onClick={openModal}
          disabled={disabled}
          icon={<i className="fas fa-camera me-2"></i>}
        >
          Add Image
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {uploadSuccess && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="fas fa-check-circle me-2"></i>
          Image uploaded successfully: {uploadSuccess}
          <button
            type="button"
            className="btn-close"
            onClick={() => setUploadSuccess(null)}
          ></button>
        </div>
      )}

      {uploading && (
        <div className="alert alert-info" role="alert">
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          Uploading image...
        </div>
      )}

      {/* Antd Modal with Tabs */}
      <Modal
        open={showModal}
        title="Add Image"
        onCancel={closeModal}
        footer={null}
        centered
        width={800}
      >
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <Tabs.TabPane tab="Camera" key="camera">
            {isCamera ? (
              <div className="camera-container mb-3">
                <div className="position-relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-100 rounded"
                    style={{ maxHeight: "400px", objectFit: "cover" }}
                  />
                  <div className="camera-controls position-absolute bottom-0 start-50 translate-middle-x mb-3">
                    <Button
                      shape="circle"
                      size="large"
                      onClick={capturePhoto}
                      disabled={disabled}
                      icon={<i className="fas fa-camera"></i>}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <p className="text-muted">Initializing camera...</p>
              </div>
            )}
          </Tabs.TabPane>

          <Tabs.TabPane tab="Upload" key="upload">
            <div className="mb-3">
              <label className="form-label text-white">
                Select image(s) to upload
              </label>
              <input
                type="file"
                accept="image/*"
                className="form-control bg-dark text-white border-secondary"
                multiple={multiple}
                onChange={handleFileInput}
                disabled={disabled}
              />
            </div>

            {images.length > 0 && !autoUpload && (
              <div className="mb-3">
                <Button
                  type="primary"
                  onClick={uploadImages}
                  disabled={disabled || uploading}
                >
                  {uploading ? "Uploading..." : `Upload (${images.length})`}
                </Button>
              </div>
            )}
          </Tabs.TabPane>
        </Tabs>

        {/* Canvas for capturing (hidden) */}
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

        {/* Image previews (shared) */}
        {showPreview && images.length > 0 && (
          <div className="image-previews mt-3">
            <h6>Selected Images:</h6>
            <div className="row g-3">
              {images.map((imageData) => (
                <div key={imageData.id} className="col-md-6 col-lg-4">
                  <div className="card bg-dark text-white">
                    <div className="position-relative">
                      <img
                        src={imageData.previewUrl}
                        alt="Preview"
                        className="card-img-top"
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                        onClick={() => removeImage(imageData.id)}
                        disabled={disabled || uploading}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    <div className="card-body p-2">
                      <small className="text-white-50 d-block text-truncate">
                        {imageData.name}
                      </small>
                      <small className="text-white-50">
                        {formatFileSize(imageData.size)}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CameraUpload;
