type LoginAuthError = {
  code?: string | null;
  message?: string | null;
};

const INVALID_CREDENTIALS = "Incorrect email or password. Please try again.";
const EMAIL_NOT_CONFIRMED = "Please confirm your email address before signing in.";
const TOO_MANY_ATTEMPTS = "Too many sign-in attempts. Please wait a moment and try again.";
const GENERIC_ERROR = "We couldn't sign you in. Please try again.";
const EMAIL_ALREADY_REGISTERED = "An account with this email already exists. Try signing in.";
const WEAK_PASSWORD = "Choose a stronger password with at least 8 characters.";
const SIGNUP_UNAVAILABLE = "Account creation is temporarily unavailable. Try again.";
const SIGNUP_TOO_MANY_ATTEMPTS = "Too many signup attempts. Please wait a moment and try again.";
const SIGNUP_GENERIC_ERROR = "We couldn't create your account. Please try again.";

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

/**
 * Translate a Supabase signup error into safe, user-facing copy.
 *
 * Signup errors can reveal whether an account exists, so only the generic
 * "already registered" case is surfaced and everything else falls back to
 * neutral copy.
 */
export function getSignupErrorMessage(error: LoginAuthError): string {
  if (
    error.code === "user_already_exists" ||
    error.code === "email_exists" ||
    error.message?.toLowerCase().includes("already registered")
  ) {
    return EMAIL_ALREADY_REGISTERED;
  }

  if (error.code === "weak_password" || error.message?.toLowerCase().includes("password")) {
    return WEAK_PASSWORD;
  }

  if (error.code === "signup_disabled") {
    return SIGNUP_UNAVAILABLE;
  }

  if (
    error.code === "over_request_rate_limit" ||
    error.code === "too_many_requests" ||
    error.code === "over_email_send_rate_limit"
  ) {
    return SIGNUP_TOO_MANY_ATTEMPTS;
  }

  return SIGNUP_GENERIC_ERROR;
}
