// Email check: name@domain.tld, where the domain has at least one dot and
// the ending (.com, .net, .co.uk ...) is a real top-level domain from the
// IANA list (so "name@site.cooim" is rejected). Also rejects spaces, a
// missing @ or domain, double dots and leading / trailing dots or dashes.
// Mirrors auto-hub-backend/utils/email.js.
import { EMAIL_TLDS } from "./emailTlds";

export const EMAIL_REGEX =
  /^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+-]+(?<!\.)@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

// The ending after the last dot, lower-cased ("com" for name@mail.example.com).
const emailTld = (email) => email.slice(email.lastIndexOf(".") + 1).toLowerCase();

/**
 * Error message for an email, or null when it is valid.
 */
export const emailError = (value) => {
  const email = typeof value === "string" ? value.trim() : "";
  if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address, e.g. name@example.com";
  }
  const tld = emailTld(email);
  if (!EMAIL_TLDS.has(tld)) {
    return `".${tld}" is not a real email domain ending. Check the spelling (e.g. .com, .net, .org)`;
  }
  return null;
};

export const isValidEmail = (value) => emailError(value) === null;

// antd Form rule: optional email, but when filled in it must be valid.
// Use together with { required: true } for a mandatory email.
export const emailRule = {
  validator: (_, value) => {
    const error = value ? emailError(value) : null;
    return error ? Promise.reject(new Error(error)) : Promise.resolve();
  },
};

// Trims spaces around an email (Form.Item `normalize`).
export const normalizeEmail = (value) => (typeof value === "string" ? value.trim() : value);
