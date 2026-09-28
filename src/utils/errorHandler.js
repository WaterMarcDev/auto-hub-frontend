import { errorCodes } from "../data/ErrorCodesData";

/**
 * Tries to find a matching error definition from the list of known errors.
 * @param {object} error - The axios error object or standard error object
 * @returns {object|null} - The matched error object from ErrorCodesData, or null if no match found
 */
export const findMatchingError = (error) => {
    if (!error) return null;

    const status = error.response ? error.response.status : null;
    const message = error.response?.data?.message || error.message || "";
    // Some backend errors might come as { error: "message" }
    const altMessage = error.response?.data?.error || "";
    const combinedMsg = (message + " " + altMessage).toLowerCase();

    // 1. Check for specific status codes matches
    if (status === 500) {
        return errorCodes.find((e) => e.code === "SYS-002");
    }
    if (status === 401 || status === 403) {
        // Distinguish between invalid credentials vs token/access denied if possible
        if (combinedMsg.includes("expired")) {
            return errorCodes.find((e) => e.code === "AUTH-003");
        }
        if (combinedMsg.includes("denied") || combinedMsg.includes("forbidden")) {
            return errorCodes.find((e) => e.code === "AUTH-004");
        }
        // distinct 401 vs 403?
        // Default to AUTH-001 for generic login failures or 401s
        return errorCodes.find((e) => e.code === "AUTH-001");
    }

    // 2. Check for message content matches

    // AUTH-001: Invalid credentials (explicit check for status 400 cases)
    if (combinedMsg.includes("invalid credentials")) {
        return errorCodes.find((e) => e.code === "AUTH-001");
    }

    // AUTH-002: User not found
    if (combinedMsg.includes("user not found") || combinedMsg.includes("user does not exist")) {
        return errorCodes.find((e) => e.code === "AUTH-002");
    }

    // SYS-001: Network Error
    if (combinedMsg.includes("network error") || combinedMsg.includes("failed to fetch")) {
        return errorCodes.find((e) => e.code === "SYS-001");
    }

    // SYS-003: Timeout
    if (combinedMsg.includes("timeout") || combinedMsg.includes("timed out")) {
        return errorCodes.find((e) => e.code === "SYS-003");
    }

    // INV-001: VIN exists / processed
    if (
        (combinedMsg.includes("vin") && (combinedMsg.includes("exist") || combinedMsg.includes("processed") || combinedMsg.includes("duplicate"))) ||
        combinedMsg.includes("vehicle identification number")
    ) {
        return errorCodes.find((e) => e.code === "INV-001");
    }

    // INV-002: Part not found
    if (combinedMsg.includes("part") && (combinedMsg.includes("not found") || combinedMsg.includes("missing"))) {
        return errorCodes.find((e) => e.code === "INV-002");
    }

    // INV-003: Inventory limit
    if (combinedMsg.includes("inventory limit") || combinedMsg.includes("storage limit") || combinedMsg.includes("cannot accept more items")) {
        return errorCodes.find((e) => e.code === "INV-003");
    }

    // VAL-001: Field required
    if (combinedMsg.includes("required") || combinedMsg.includes("mandatory") || combinedMsg.includes("missing field")) {
        return errorCodes.find((e) => e.code === "VAL-001");
    }

    // VAL-002: Invalid email
    if (combinedMsg.includes("invalid email") || combinedMsg.includes("email format")) {
        return errorCodes.find((e) => e.code === "VAL-002");
    }

    // VAL-003: Passwords match
    if (combinedMsg.includes("passwords do not match") || combinedMsg.includes("password mismatch")) {
        return errorCodes.find((e) => e.code === "VAL-003");
    }

    // UPL-001: File too large
    if (combinedMsg.includes("file too large") || combinedMsg.includes("size limit") || combinedMsg.includes("file size")) {
        return errorCodes.find((e) => e.code === "UPL-001");
    }

    // UPL-002: Unsupported file type
    if (combinedMsg.includes("unsupported file") || combinedMsg.includes("invalid file type") || combinedMsg.includes("file format")) {
        return errorCodes.find((e) => e.code === "UPL-002");
    }

    // Fallback?
    return null;
};

/**
 * Returns a formatted error message with the simplified code.
 * @param {object} error - The original error
 * @returns {string} - Combined string like "(error-001) Invalid credentials"
 */
export const getSimplifiedErrorString = (error) => {
    const match = findMatchingError(error);
    const originalMsg = error.response?.data?.message || error.response?.data?.error || error.message || "Unknown error";

    if (match) {
        // Use the mapped message if it's very generic, or keep the specific backend message but prepended with code?
        // User said: "simple error code along with the message like (error-001) so and so error"
        // If backend says "VIN 123 exists", we should probably keep that specificity but add (error-005).
        return `(${match.simpleCode}) ${originalMsg}`;
    }

    return originalMsg;
};
