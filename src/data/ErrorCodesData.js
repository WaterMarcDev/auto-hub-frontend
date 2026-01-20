export const errorCodes = [
    // --- Authentication & Access ---
    {
        code: "AUTH-001",
        message: "Invalid credentials",
        context: "Login Page",
        role: "All Roles",
        meaning: "The email address or password you entered does not match our records.",
        resolution: "Double-check your email and password. Ensure caps lock is off. If you forgot your password, contact an administrator to reset it."
    },
    {
        code: "AUTH-002",
        message: "User not found",
        context: "Login / User Management",
        role: "Admin",
        meaning: "The system cannot find a user with the provided email address.",
        resolution: "Verify the email address is correct. If the user is new, ensure they have been registered in the system."
    },
    {
        code: "AUTH-003",
        message: "Token expired / Session expired",
        context: "Any Page",
        role: "All Roles",
        meaning: "Your secure session has lasted too long or has been invalidated.",
        resolution: "You will be redirected to the login page. Please log in again to continue."
    },
    {
        code: "AUTH-004",
        message: "Access Denied / Forbidden",
        context: "Restricted Pages (e.g., Admin Dashboard)",
        role: "Staff / User",
        meaning: "You do not have the necessary permissions to view this page or perform this action.",
        resolution: "If you believe you should have access, contact your manager or the system administrator to update your user role."
    },

    // --- Inventory & Parts ---
    {
        code: "INV-001",
        message: "VIN already exists",
        context: "Car Intake / Inventory",
        role: "Inventory Manager",
        meaning: "A vehicle with this Vehicle Identification Number (VIN) has already been entered into the system.",
        resolution: "Search for the VIN in the inventory list. If it's a duplicate entry, use the existing record. If it was archived, check the archives."
    },
    {
        code: "INV-002",
        message: "Part not found",
        context: "Part Search",
        role: "Sales / Inventory",
        meaning: "The requested part could not be located in the database.",
        resolution: "Check the spelling of the part name. Ensure the correct filters (Make, Model, Year) are applied."
    },
    {
        code: "INV-003",
        message: "Inventory limit reached",
        context: "Adding Inventory",
        role: "Inventory Manager",
        meaning: "The system cannot accept more items at this time (rare).",
        resolution: "Contact technical support to check database storage limits."
    },

    // --- Network & System ---
    {
        code: "SYS-001",
        message: "Network Error / Failed to fetch",
        context: "Any Page",
        role: "All Roles",
        meaning: "Your computer cannot connect to the server. You might be offline or the server is down.",
        resolution: "Check your internet connection. Refresh the page. If the problem persists, wait a few minutes and try again or contact IT support."
    },
    {
        code: "SYS-002",
        message: "500 Internal Server Error",
        context: "Any Action",
        role: "All Roles",
        meaning: "Something went wrong on the server side that the system didn't expect.",
        resolution: "Refresh the page and try again. If it happens repeatedly, take a screenshot of what you were doing and report it to technical support."
    },
    {
        code: "SYS-003",
        message: "Loading timeout",
        context: "Dashboard / Large Lists",
        role: "All Roles",
        meaning: "The data took too long to load.",
        resolution: "Check your internet speed. Try refreshing. If trying to load a very large report, try filtering for a smaller date range."
    },

    // --- Forms & Validation ---
    {
        code: "VAL-001",
        message: "Field is required",
        context: "Forms (Intake, User Creation)",
        role: "All Roles",
        meaning: "You skipped a mandatory field that must be filled out.",
        resolution: "Look for fields marked with a red asterisk (*) or highlighted in red. Fill them out and try submitting again."
    },
    {
        code: "VAL-002",
        message: "Invalid email format",
        context: "User Forms / Client Forms",
        role: "All Roles",
        meaning: "The email address is missing an '@' symbol or a domain (like .com).",
        resolution: "Correct the email format (e.g., name@example.com)."
    },
    {
        code: "VAL-003",
        message: "Passwords do not match",
        context: "Change Password / Register",
        role: "All Roles",
        meaning: "The two password fields (Password and Confirm Password) have different text.",
        resolution: "Retype your password carefully in both boxes."
    },

    // --- Uploads ---
    {
        code: "UPL-001",
        message: "File too large",
        context: "Image Upload",
        role: "Inventory Manager",
        meaning: "The image or document you are trying to upload is bigger than the allowed limit.",
        resolution: "Resize the image or compress the PDF. Try to keep files under 5MB."
    },
    {
        code: "UPL-002",
        message: "Unsupported file type",
        context: "Image Upload",
        role: "Inventory Manager",
        meaning: "You tried to upload a file that isn't an image (like a Word doc) where an image is expected.",
        resolution: "Only upload JPG or PNG files for vehicle photos."
    }
];
