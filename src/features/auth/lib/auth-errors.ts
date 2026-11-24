type LoginAuthError = {
  code?: string | null;
  message?: string | null;
};

const INVALID_CREDENTIALS = "Incorrect email or password. Please try again.";
const EMAIL_NOT_CONFIRMED = "Please confirm your email address before signing in.";
const TOO_MANY_ATTEMPTS = "Too many sign-in attempts. Please wait a moment and try again.";
const GENERIC_ERROR = "We couldn't sign you in. Please try again.";

/**
 * Translate a Supabase auth error into safe, user-facing copy.
 *
 * Never surface raw provider messages: they can leak account details and
 * implementation hints. Unknown errors fall back to a generic message.
 */
export function getLoginErrorMessage(error: LoginAuthError): string {
  if (error.code === "invalid_credentials") {
    return INVALID_CREDENTIALS;
  }

  if (error.code === "email_not_confirmed" || error.message?.includes("Email not confirmed")) {
    return EMAIL_NOT_CONFIRMED;
  }

  if (
    error.code === "over_request_rate_limit" ||
    error.code === "too_many_requests" ||
    error.code === "over_email_send_rate_limit"
  ) {
    return TOO_MANY_ATTEMPTS;
  }

  return GENERIC_ERROR;
}
