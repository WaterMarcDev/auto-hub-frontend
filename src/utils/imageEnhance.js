// Image tools for photos in the CRM: rotate, crop and "Enhance".
//
// Everything runs in the browser (no image is sent to another service).
// Enhance improves the picture itself: it enlarges it (up to 2x, longest side
// at most 2400 px), auto-corrects the levels per colour channel (brightens
// dull / dark / hazy photos), gives colours a light boost and sharpens it.
//
// Images are loaded with crossOrigin="anonymous"; the backend serves
// /uploads behind its CORS middleware, so the pixels can be read.

const MAX_SIDE = 2400; // longest side of an enhanced image, in px

export const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load the image"));
    img.src = src;
  });

const newCanvas = (width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
};

const naturalSize = (img) => ({
  width: img.naturalWidth || img.width,
  height: img.naturalHeight || img.height,
});

// Image (or canvas) rotated by 0 / 90 / 180 / 270 degrees, as a canvas.
export const rotateToCanvas = (img, rotation = 0) => {
  const { width, height } = naturalSize(img);
  const r = ((rotation % 360) + 360) % 360;
  const swap = r === 90 || r === 270;
  const canvas = newCanvas(swap ? height : width, swap ? width : height);
  const ctx = canvas.getContext("2d");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((r * Math.PI) / 180);
  ctx.drawImage(img, -width / 2, -height / 2);
  return canvas;
};

// Part of a canvas; `crop` is { x, y, w, h } as fractions (0–1) of its size.
export const cropCanvas = (source, crop) => {
  if (!crop) return source;
  const sx = Math.round(crop.x * source.width);
  const sy = Math.round(crop.y * source.height);
  const sw = Math.max(1, Math.round(crop.w * source.width));
  const sh = Math.max(1, Math.round(crop.h * source.height));
  const canvas = newCanvas(sw, sh);
  canvas.getContext("2d").drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvas;
};

// Value at the given fraction (0–1) of a 256-bucket histogram.
const percentile = (hist, total, fraction) => {
  const target = total * fraction;
  let sum = 0;
  for (let v = 0; v < 256; v++) {
    sum += hist[v];
    if (sum >= target) return v;
  }
  return 255;
};

// Per-channel auto levels: maps the 0.5% / 99.5% points to 0 / 255.
const autoLevels = (data) => {
  const hists = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
  const pixels = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    hists[0][data[i]]++;
    hists[1][data[i + 1]]++;
    hists[2][data[i + 2]]++;
  }
  const luts = hists.map((h) => {
    const lo = percentile(h, pixels, 0.005);
    const hi = percentile(h, pixels, 0.995);
    const lut = new Uint8ClampedArray(256);
    const range = Math.max(hi - lo, 1);
    // Skip channels that are already (almost) full range.
    const stretch = range < 245;
    for (let v = 0; v < 256; v++) lut[v] = stretch ? ((v - lo) * 255) / range : v;
    return lut;
  });
  for (let i = 0; i < data.length; i += 4) {
    data[i] = luts[0][data[i]];
    data[i + 1] = luts[1][data[i + 1]];
    data[i + 2] = luts[2][data[i + 2]];
  }
};

// Light colour boost: pushes each channel away from the pixel's grey value.
const saturate = (data, amount) => {
  for (let i = 0; i < data.length; i += 4) {
    const grey = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = grey + (data[i] - grey) * amount;
    data[i + 1] = grey + (data[i + 1] - grey) * amount;
    data[i + 2] = grey + (data[i + 2] - grey) * amount;
  }
};

// Unsharp mask with a 3x3 box blur: out = src + amount * (src - blur).
const sharpen = (data, width, height, amount) => {
  const src = new Uint8ClampedArray(data);
  const row = width * 4;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * row + x * 4;
      for (let c = 0; c < 3; c++) {
        const p = i + c;
        const blur =
          (src[p - row - 4] + src[p - row] + src[p - row + 4] +
            src[p - 4] + src[p] + src[p + 4] +
            src[p + row - 4] + src[p + row] + src[p + row + 4]) / 9;
        data[p] = src[p] + amount * (src[p] - blur);
      }
    }
  }
};

/**
 * Enhanced copy of an image or canvas, as a new canvas.
 * @param {HTMLImageElement|HTMLCanvasElement} source
 * @param {object} [opts] { scale = 2, sharpness = 0.8, saturation = 1.08 }
 */
export const enhanceCanvas = (source, { scale = 2, sharpness = 0.8, saturation = 1.08 } = {}) => {
  const { width: w0, height: h0 } = naturalSize(source);
  if (!w0 || !h0) throw new Error("The image is empty");

  // Enlarge (never shrink) up to `scale`, longest side at most MAX_SIDE.
  const factor = Math.max(1, Math.min(scale, MAX_SIDE / Math.max(w0, h0)));
  const canvas = newCanvas(w0 * factor, h0 * factor);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  let imageData;
  try {
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch {
    throw new Error("This image is blocked by the browser (cross-origin) and cannot be enhanced");
  }

  autoLevels(imageData.data);
  saturate(imageData.data, saturation);
  sharpen(imageData.data, canvas.width, canvas.height, sharpness);
  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

/**
 * Enhances an image URL and resolves to { url, width, height } (JPEG data URL).
 */
export async function enhanceImage(src, opts) {
  const canvas = enhanceCanvas(await loadImage(src), opts);
  return { url: canvas.toDataURL("image/jpeg", 0.92), width: canvas.width, height: canvas.height };
}

// Canvas -> JPEG File (for uploading).
export const canvasToFile = (canvas, name = "image.jpg", quality = 0.92) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Could not create the image file"));
        const base = String(name).replace(/\.[^.]+$/, "") || "image";
        resolve(new File([blob], `${base}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      quality
    );
  });

/**
 * Enhances an image URL and resolves to a JPEG File, ready to upload.
 */
export async function enhanceImageToFile(src, name, opts) {
  return canvasToFile(enhanceCanvas(await loadImage(src), opts), name);
}
