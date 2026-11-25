// Shared bits of the customer forms / lists (Customer Register, Customer
// List, Waiver). Limits mirror auto-hub-backend/controllers/customer.controller.js.
import { Modal } from "antd";

export const NAME_MAX_LENGTH = 50; // first name, last name
export const FULL_NAME_MAX_LENGTH = 100; // waiver "Full Name" (first + last)
export const MOBILE_MAX_LENGTH = 20;
export const EMAIL_MAX_LENGTH = 254;

// antd rule: an optional text that, when filled in, is not only spaces.
export const notOnlySpacesRule = (label) => ({
  validator: (_, value) =>
    typeof value === "string" && value.length > 0 && !value.trim()
      ? Promise.reject(new Error(`${label} cannot be only spaces`))
      : Promise.resolve(),
});

// Trimmed text, or undefined when nothing but spaces was entered.
export const cleanText = (value) => {
  const text = typeof value === "string" ? value.trim() : value;
  return text || undefined;
};

// Resolves true when the image at `src` can be decoded by the browser. A file
// that only has an image extension (a corrupted / renamed file) fails here.
// A slow network is not held against the file: after 15 s it counts as fine.
export const canDecodeImage = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(false);
    const img = new Image();
    const timer = setTimeout(() => resolve(true), 15000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img.naturalWidth > 0 && img.naturalHeight > 0);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.src = src;
  });

export const showCorruptImageError = () =>
  Modal.error({
    title: "Image could not be read",
    content:
      "This file is not a valid image (it may be damaged or renamed). Please upload a clear JPG, PNG, GIF or WEBP photo of the ID.",
    zIndex: 2200,
    centered: true,
    okText: "OK",
  });
