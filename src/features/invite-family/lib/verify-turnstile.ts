const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_TIMEOUT_MS = 8_000;

export type VerifyTurnstileOptions = {
  secret?: string;
  fetchFn?: typeof fetch;
  remoteIp?: string;
};

export async function verifyTurnstileToken(
  token: string,
  options: VerifyTurnstileOptions = {}
): Promise<boolean> {
  const secret = options.secret ?? process.env.TURNSTILE_SECRET_KEY;
  if (!secret || token.trim() === "") return false;
  const fetchFn = options.fetchFn ?? fetch;

  const body = new URLSearchParams({ secret, response: token });
  if (options.remoteIp) body.set("remoteip", options.remoteIp);

  let response: Response;
  try {
    response = await fetchFn(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS),
    });
  } catch {
    return false;
  }
  if (!response.ok) return false;
  try {
    const data = (await response.json()) as unknown as { success?: unknown };
    return data.success === true;
  } catch {
    return false;
  }
}
