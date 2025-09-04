import React, { useState, useRef } from "react";

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
          facingMode: "environment", // Use back camera on mobile
        },
      });

      setStream(mediaStream);
      setIsCamera(true);

      // Wait for video element to be ready
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

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCamera(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
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

    // Stop camera after capture unless multiple is enabled
    if (!multiple) {
      stopCamera();
    }
  };

  // Handle individual image file
  const handleImageFile = async (file) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select only image files");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setError("");

    // If autoUpload is enabled, upload immediately
    if (autoUpload) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const result = await response.json();

        if (onImageUpload) {
          onImageUpload(result);
        }

        setUploadSuccess(result.originalName);
        setUploading(false);

        // Clear success message after 3 seconds
        setTimeout(() => setUploadSuccess(null), 3000);
        return;
      } catch (err) {
        console.error("Auto-upload error:", err);
        setError(err.message || "Failed to upload image");
        setUploading(false);
        // Fall through to normal preview behavior on error
      }
    }

    // Create preview URL for manual upload mode
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
      // Clean up previous preview URL
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
      const uploadPromises = images.map(async (imageData) => {
        const formData = new FormData();
        formData.append("image", imageData.file);

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        return await response.json();
      });

      const results = await Promise.all(uploadPromises);

      if (onImageUpload) {
        onImageUpload(multiple ? results : results[0]);
      }

      // Clear images after successful upload
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setImages([]);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      // Cleanup camera stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      // Cleanup preview URLs
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

  return (
    <div className={`camera-upload ${className}`}>
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

      {/* Camera View */}
      {isCamera && (
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
              <button
                type="button"
                className="btn btn-light btn-lg rounded-circle me-3"
                onClick={capturePhoto}
                disabled={disabled}
              >
                <i className="fas fa-camera"></i>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={stopCamera}
              >
                <i className="fas fa-times me-2"></i>Close Camera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas for capturing (hidden) */}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {/* Upload Controls */}
      {!isCamera && (
        <div className="upload-controls mb-3">
          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-primary"
              onClick={startCamera}
              disabled={disabled}
            >
              <i className="fas fa-camera me-2"></i>Open Camera
            </button>

            {images.length > 0 && !autoUpload && (
              <button
                type="button"
                className="btn btn-success"
                onClick={uploadImages}
                disabled={disabled || uploading}
              >
                {uploading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt me-2"></i>
                    Upload ({images.length})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Image Previews */}
      {showPreview && images.length > 0 && (
        <div className="image-previews">
          <h6>Selected Images:</h6>
          <div className="row g-3">
            {images.map((imageData) => (
              <div key={imageData.id} className="col-md-6 col-lg-4">
                <div className="card">
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
                    <small className="text-muted d-block text-truncate">
                      {imageData.name}
                    </small>
                    <small className="text-muted">
                      {formatFileSize(imageData.size)}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraUpload;
