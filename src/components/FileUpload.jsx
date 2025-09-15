import React, { useState, useRef } from "react";
import { uploadAPI } from "../utils/api";

const FileUpload = ({
  onFileSelect,
  onFileUpload,
  multiple = false,
  className = "",
  disabled = false,
  showPreview = true,
  autoUpload = true,
  accept = "image/*",
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const inputRef = useRef(null);

  const handleInputChange = async (e) => {
    const selected = Array.from(e.target.files || []);
    await handleSelectedFiles(selected);
    // reset input so same file can be selected again if needed
    if (inputRef.current) inputRef.current.value = null;
  };

  const handleSelectedFiles = async (selectedFiles) => {
    setError("");

    // Filter by accepted mime types (basic)
    const validFiles = selectedFiles.filter((f) => {
      if (accept && !f.type.match(accept.replace("*", ".*"))) {
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      setError("No valid files selected");
      return;
    }

    // Validate size and type and optionally auto upload
    for (const file of validFiles) {
      if (!file.type.startsWith("image/")) {
        setError("Please select only image files");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
    }

    if (autoUpload && validFiles.length > 0) {
      setUploading(true);
      try {
        // If multiple allowed and more than one file, call uploadMultiple
        if (multiple && validFiles.length > 1) {
          const response = await uploadAPI.uploadMultiple(validFiles);
          const results = response.data;
          if (onFileUpload) onFileUpload(results.files || results);
          setUploadSuccess(
            (results.files &&
              results.files.map((f) => f.originalName).join(", ")) ||
              "Uploaded"
          );
        } else {
          // Upload files one by one and return first result or array if multiple
          const uploaded = [];
          for (const file of validFiles) {
            const res = await uploadAPI.uploadImage(file);
            uploaded.push(res.data);
          }
          if (onFileUpload) onFileUpload(multiple ? uploaded : uploaded[0]);
          setUploadSuccess(
            multiple
              ? uploaded.map((u) => u.originalName).join(", ")
              : uploaded[0].originalName
          );
        }

        setUploading(false);
        setTimeout(() => setUploadSuccess(null), 3000);
        return;
      } catch (err) {
        console.error("Auto-upload error:", err);
        setError(
          err.response?.data?.error || err.message || "Failed to upload files"
        );
        setUploading(false);
        // fall through to preview behavior
      }
    }

    // Create preview objects
    const previewObjs = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
    }));

    if (multiple) {
      setFiles((prev) => [...prev, ...previewObjs]);
    } else {
      // revoke old preview
      files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      setFiles(previewObjs.slice(0, 1));
    }

    if (onFileSelect) {
      onFileSelect(
        multiple ? previewObjs.map((p) => p.file) : previewObjs[0].file
      );
    }
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const toRemove = prev.find((p) => p.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      setError("No files to upload");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const rawFiles = files.map((f) => f.file);
      if (multiple && rawFiles.length > 1) {
        const res = await uploadAPI.uploadMultiple(rawFiles);
        const results = res.data;
        if (onFileUpload) onFileUpload(results.files || results);
      } else {
        const res = await uploadAPI.uploadImage(rawFiles[0]);
        if (onFileUpload) onFileUpload(res.data);
      }

      files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      setFiles([]);
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to upload files"
      );
    } finally {
      setUploading(false);
    }
  };

  React.useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    };
  }, [files]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`file-upload ${className}`}>
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
          File(s) uploaded: {uploadSuccess}
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
          Uploading files...
        </div>
      )}

      <div className="upload-controls mb-3">
        <div className="d-flex gap-2 flex-wrap">
          <label className="btn btn-primary mb-0">
            <i className="fas fa-file-upload me-2"></i>
            Select File{multiple ? "s" : ""}
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleInputChange}
              style={{ display: "none" }}
              disabled={disabled}
            />
          </label>

          {files.length > 0 && !autoUpload && (
            <button
              type="button"
              className="btn btn-success"
              onClick={uploadFiles}
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
                  Upload ({files.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showPreview && files.length > 0 && (
        <div className="file-previews">
          <h6>Selected File{files.length > 1 ? "s" : ""}:</h6>
          <div className="row g-3">
            {files.map((f) => (
              <div key={f.id} className="col-md-6 col-lg-4">
                <div className="card">
                  <div className="position-relative">
                    <img
                      src={f.previewUrl}
                      alt={f.name}
                      className="card-img-top"
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                      onClick={() => removeFile(f.id)}
                      disabled={disabled || uploading}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="card-body p-2">
                    <small className="text-muted d-block text-truncate">
                      {f.name}
                    </small>
                    <small className="text-muted">
                      {formatFileSize(f.size)}
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

export default FileUpload;
