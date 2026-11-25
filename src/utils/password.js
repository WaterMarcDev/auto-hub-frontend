// Password rules for user accounts (Add User, Reset Password).
// Mirrors auto-hub-backend/utils/password.js. Max 64: passwords are hashed
// with bcrypt, which ignores anything after 72 bytes.
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 64;

export const passwordRules = [
  { required: true, message: "Password is required" },
  {
    validator: (_, value) =>
      value && !String(value).trim()
        ? Promise.reject(new Error("Password cannot be only spaces"))
        : Promise.resolve(),
  },
  { min: PASSWORD_MIN_LENGTH, message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` },
  { max: PASSWORD_MAX_LENGTH, message: `Password can be at most ${PASSWORD_MAX_LENGTH} characters` },
];
