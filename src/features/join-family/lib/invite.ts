const CODE_KEYS = ["code", "invite", "inviteCode", "invitation", "token"] as const;

type SearchParamsLike =
  Record<string, string | string[] | undefined> | { get: (key: string) => string | null };

function firstString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function normalizeCode(value: string | null | undefined): string {
  if (!value) return "";
  return value.trim().slice(0, 64);
}

/**
 * Extract an invite code from URL search params.
 * Accepts `code`, `invite`, `inviteCode`, `invitation`, and `token`
 * (in that priority order) to stay compatible with invite links.
 */
export function extractInviteCode(
  searchParams: URLSearchParams | SearchParamsLike | undefined | null
): string {
  if (!searchParams) return "";
  if (
    typeof searchParams === "object" &&
    "get" in searchParams &&
    typeof (searchParams as { get: unknown }).get === "function"
  ) {
    const getter = (searchParams as { get: (key: string) => string | null }).get.bind(searchParams);
    for (const key of CODE_KEYS) {
      const hit = normalizeCode(getter(key));
      if (hit) return hit;
    }
    return "";
  }
  const record = searchParams as Record<string, string | string[] | undefined>;
  for (const key of CODE_KEYS) {
    const hit = normalizeCode(firstString(record[key]));
    if (hit) return hit;
  }
  return "";
}

export function extractEmail(
  searchParams: URLSearchParams | SearchParamsLike | undefined | null
): string {
  if (!searchParams) return "";
  if (
    typeof searchParams === "object" &&
    "get" in searchParams &&
    typeof (searchParams as { get: unknown }).get === "function"
  ) {
    const getter = (searchParams as { get: (key: string) => string | null }).get.bind(searchParams);
    return (getter("email") ?? "").trim().slice(0, 254);
  }
  const record = searchParams as Record<string, string | string[] | undefined>;
  const raw = firstString(record["email"]);
  return (raw ?? "").trim().slice(0, 254);
}
