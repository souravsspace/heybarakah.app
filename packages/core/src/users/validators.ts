export const PROFILE_NAME_MAX_LENGTH = 120;
export const PROFILE_COMPLETED_AT_MAX_LENGTH = 64;

export function validateProfileInput(input: {
  name?: string;
  completedAt?: string;
}) {
  if (input.name !== undefined) {
    if (input.name.length > PROFILE_NAME_MAX_LENGTH) {
      throw new Error(`name exceeds ${PROFILE_NAME_MAX_LENGTH} characters`);
    }
    // Reject C0 control chars and DEL so they never reach storage.
    for (const ch of input.name) {
      const code = ch.codePointAt(0) ?? 0;
      if (code < 0x20 || code === 0x7f) {
        throw new Error("name contains invalid characters");
      }
    }
  }
  if (
    input.completedAt !== undefined &&
    input.completedAt.length > PROFILE_COMPLETED_AT_MAX_LENGTH
  ) {
    throw new Error(
      `completedAt exceeds ${PROFILE_COMPLETED_AT_MAX_LENGTH} characters`
    );
  }
}
