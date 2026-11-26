// Shared rules for the CRM "Add Part Request" and "Add Junk Car" forms.
// The server checks the same (partRequest.controller.js / junkCar.controller.js).

export const MIN_YEAR = 1900;

// Name box on both forms: optional, at most 15 characters.
export const LEAD_NAME_MAX_LENGTH = 15;

const isBlank = (value) => value === undefined || value === null || String(value).trim() === "";

// Year: 4 digits from 1900 to the current year (no future years).
export const yearRule = {
    validator: (_, value) => {
        if (isBlank(value)) return Promise.resolve();
        const maxYear = new Date().getFullYear();
        const text = String(value).trim();
        return /^\d{4}$/.test(text) && Number(text) >= MIN_YEAR && Number(text) <= maxYear
            ? Promise.resolve()
            : Promise.reject(new Error(`Enter a year from ${MIN_YEAR} to ${maxYear}`));
    },
};

// Name (optional): when typed it can't be only spaces, and it is at most
// LEAD_NAME_MAX_LENGTH characters. Name, Phone and Email are each optional,
// but at least one is needed to reach the customer. Put
// dependencies={["phone", "email"]} on the Name Form.Item so this re-checks
// when those change.
export const leadNameRules = [
    {
        validator: (_, value) =>
            typeof value === "string" && value.length > 0 && value.trim() === ""
                ? Promise.reject(new Error("Name cannot be only spaces"))
                : Promise.resolve(),
    },
    { max: LEAD_NAME_MAX_LENGTH, message: `Name can be at most ${LEAD_NAME_MAX_LENGTH} characters` },
    ({ getFieldValue }) => ({
        validator: (_, value) => {
            if (typeof value === "string" && value.length > 0 && value.trim() === "") return Promise.resolve(); // shown above
            return isBlank(value) && isBlank(getFieldValue("phone")) && isBlank(getFieldValue("email"))
                ? Promise.reject(new Error("Enter a name, phone or email"))
                : Promise.resolve();
        },
    }),
];

// Trimmed text with inner spaces collapsed, or undefined when blank (so it
// isn't sent).
export const cleanText = (value) => {
    if (typeof value !== "string") return value;
    const text = value.trim().replace(/\s+/g, " ");
    return text || undefined;
};
