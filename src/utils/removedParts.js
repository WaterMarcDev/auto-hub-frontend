// Parts removed from the CRM: A1, A2, Windshield, Heated Windshield and
// Heated Rear Windshield.
// Mirrors auto-hub-backend/utils/removedParts.js (the backend enforces it).
// Names are compared lower-cased with everything but letters/digits dropped,
// so "Heated Windshield", "heatedWindshield" and "windShield" all match.
// The plain Rear Windshield is not removed.
const REMOVED_PART_KEYS = new Set([
  "a1",
  "a2",
  "windshield",
  "windscreen",
  "windscreenwindshield",
  "heatedwindshield",
  "heatedrearwindshield",
]);

export const isRemovedPart = (name) =>
  REMOVED_PART_KEYS.has(String(name || "").toLowerCase().replace(/[^a-z0-9]/g, ""));
