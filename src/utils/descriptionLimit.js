// Every description field in the CRM accepts at most this many characters.
export const MAX_DESCRIPTION_LENGTH = 500;

// Form rule: flags a description that is longer than the limit (e.g. an older
// record saved before the limit existed) instead of saving it silently.
// True for text made only of spaces ("" is not: an empty box is fine).
export const isOnlySpaces = (value) =>
  typeof value === "string" && value.length > 0 && value.trim() === "";

// Form rule: a description of only spaces is refused (shown under the box).
export const noOnlySpacesRule = (label = "Description") => ({
  validator: (_, value) =>
    isOnlySpaces(value)
      ? Promise.reject(new Error(`${label} cannot be only spaces`))
      : Promise.resolve(),
});

export const descriptionRule = {
  max: MAX_DESCRIPTION_LENGTH,
  message: `Description can be at most ${MAX_DESCRIPTION_LENGTH} characters. Please shorten it.`,
};
