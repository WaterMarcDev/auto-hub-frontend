import React, { useState, useRef } from "react";
import { uploadAPI } from "../utils/api";

const FileUpload = ({
  onFileSelect,
  onFileUpload,
  // Support Ant Design Form field control
  value,
  onChange,
  multiple = false,
  className = "",
  disabled = false,
  showPreview = false,
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
          if (onChange) onChange(multiple ? uploaded : uploaded[0]);
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

    // Create preview/file objects. Only create object URL when showPreview is true
    const previewObjs = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      previewUrl: showPreview ? URL.createObjectURL(file) : null,
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

    // Inform controlled form about selected raw files (before upload)
    if (onChange) {
      onChange(multiple ? previewObjs.map((p) => p.file) : previewObjs[0].file);
    }
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const toRemove = prev.find((p) => p.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
      const remaining = prev.filter((p) => p.id !== id);
      // notify form with remaining raw File objects or null
      if (onChange) {
        if (multiple) onChange(remaining.map((p) => p.file).filter(Boolean));
        else onChange(remaining[0] ? remaining[0].file : null);
      }
      return remaining;
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
        if (onChange) onChange(results.files || results);
      } else {
        const res = await uploadAPI.uploadImage(rawFiles[0]);
        if (onFileUpload) onFileUpload(res.data);
        if (onChange) onChange(res.data);
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

  // If component is controlled via `value` (e.g., existing image URL or uploaded object),
  // show preview(s). Value can be a string (URL), an object with `url`/`path`, or an array.
  React.useEffect(() => {
    if (!value) return;

    // avoid overwriting when local files are present
    if (files.length > 0) return;

    const makePreview = (val) => {
      if (typeof val === "string") {
        return {
          id: Date.now() + Math.random(),
          file: null,
          name: val.split("/").pop(),
          size: 0,
          previewUrl: val,
        };
      }
      if (val && typeof val === "object") {
        const url =
          val.url || val.path || val.previewUrl || val.location || val;
        return {
          id: Date.now() + Math.random(),
          file: null,
          name: val.originalName || val.name || url.split("/").pop(),
          size: val.size || 0,
          previewUrl: url,
        };
      }
      return null;
    };

    if (Array.isArray(value)) {
      const previewObjs = value.map((v) => makePreview(v)).filter(Boolean);
      if (previewObjs.length > 0) setFiles(previewObjs);
    } else {
      const p = makePreview(value);
      if (p) setFiles([p]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

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

      {showPreview && files.length > 0 ? (
        <div className="file-previews">
          <h6>Selected File{files.length > 1 ? "s" : ""}:</h6>
          <div className="row g-3">
            {files.map((f) => (
              <div key={f.id} className="col-12">
                <div className="d-flex align-items-center justify-content-between p-2 border rounded mb-2">
                  <div>
                    <div
                      className="fw-semibold text-truncate"
                      style={{ maxWidth: "320px" }}
                    >
                      {f.name}
                    </div>
                    <div className="text-muted" style={{ fontSize: "12px" }}>
                      {formatFileSize(f.size)}
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeFile(f.id)}
                      disabled={disabled || uploading}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FileUpload;
