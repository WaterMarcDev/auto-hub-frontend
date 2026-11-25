// Every description field in the CRM accepts at most this many characters.
export const MAX_DESCRIPTION_LENGTH = 500;

// Form rule: flags a description that is longer than the limit (e.g. an older
// record saved before the limit existed) instead of saving it silently.
export const descriptionRule = {
  max: MAX_DESCRIPTION_LENGTH,
  message: `Description can be at most ${MAX_DESCRIPTION_LENGTH} characters. Please shorten it.`,
};
