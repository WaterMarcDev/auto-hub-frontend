// Image rules for every image upload in the CRM (CameraUpload, FileUpload).
// The backend accepts JPG, JPEG, PNG, GIF and WEBP (routes/upload.routes.js);
// the CRM limits each image to 5 MB.
import { Modal } from "antd";

export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

// For <input accept="...">: the file picker only offers the allowed images.
export const IMAGE_ACCEPT = ALLOWED_IMAGE_EXTENSIONS.map((e) => `.${e}`).join(",");

const FORMATS_TEXT = ALLOWED_IMAGE_EXTENSIONS.map((e) => e.toUpperCase()).join(", ");

const formatSize = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/**
 * Checks a picked file. Returns null when it can be uploaded, otherwise
 * { title, content } describing what is wrong.
 */
export const checkImageFile = (file) => {
  if (!file) return null;
  const ext = String(file.name || "").split(".").pop().toLowerCase();
  const typeOk = ALLOWED_IMAGE_TYPES.includes(String(file.type || "").toLowerCase());
  // Camera captures may have no extension; the type decides then.
  const extOk = !file.name?.includes(".") || ALLOWED_IMAGE_EXTENSIONS.includes(ext);
  if (!typeOk || !extOk) {
    return {
      title: "Image format not allowed",
      content: `"${file.name || "This file"}" is not an allowed image format. Please upload an image in one of these formats: ${FORMATS_TEXT}.`,
    };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      title: "Image is too large",
      content: `"${file.name || "This image"}" is ${formatSize(file.size)}. Please upload an image of ${MAX_IMAGE_SIZE_MB} MB or less.`,
    };
  }
  return null;
};

// Shows the problem as a popup (above any open modal).
export const showImageError = ({ title, content }) =>
  Modal.error({ title, content, zIndex: 2200, centered: true, okText: "OK" });

// Popup for an upload that the server rejected.
export const showUploadError = (err, fallback = "Failed to upload the image") => {
  const text = err?.response?.data?.error || err?.response?.data?.message || err?.message || fallback;
  const tooLarge = err?.response?.status === 413 || /too large|file size/i.test(text);
  showImageError({
    title: tooLarge ? "Image is too large" : "Image could not be uploaded",
    content: tooLarge ? `Please upload an image of ${MAX_IMAGE_SIZE_MB} MB or less.` : text,
  });
};

// True when the browser can actually decode the file as an image (a renamed
// or damaged file with an image extension fails).
export const canDecodeImageFile = (file) =>
  new Promise((resolve) => {
    if (!file) return resolve(false);
    const url = URL.createObjectURL(file);
    const img = new Image();
    const done = (ok) => {
      URL.revokeObjectURL(url);
      resolve(ok);
    };
    img.onload = () => done(img.naturalWidth > 0 && img.naturalHeight > 0);
    img.onerror = () => done(false);
    img.src = url;
  });

// checkImageFile + decode check. Resolves to null or { title, content }.
export const checkImageFileFully = async (file) => {
  const problem = checkImageFile(file);
  if (problem) return problem;
  if (!(await canDecodeImageFile(file))) {
    return {
      title: "Image could not be read",
      content: `"${file.name || "This file"}" is damaged or is not a real image. Please choose a valid ${FORMATS_TEXT} image.`,
    };
  }
  return null;
};
