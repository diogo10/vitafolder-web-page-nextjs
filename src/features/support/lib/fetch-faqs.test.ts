import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchFaqs, getFaqsEndpoint } from "./fetch-faqs";

const row = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  slug: "reset-password",
  locale: "en",
  category_slug: "account",
  category_title: "Account",
  question: "How do I reset my password?",
  answer_markdown: "Open settings and choose Reset password.",
  sort_order: 1,
};

const baseUrl = "https://example.supabase.co";
const anonKey = "test-anon-key";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getFaqsEndpoint", () => {
  it("targets the faqs table filtered by locale and ordered", () => {
    const endpoint = getFaqsEndpoint(baseUrl, "en");
    expect(endpoint).toContain("/rest/v1/faqs?");
    expect(endpoint).toContain("locale=eq.en");
    expect(endpoint).toContain("select=");
    expect(endpoint).toContain("order=");
  });

  it("strips trailing slashes from the base URL", () => {
    expect(getFaqsEndpoint(`${baseUrl}/`, "pt")).toContain(`${baseUrl}/rest/v1/faqs?`);
  });
});

describe("fetchFaqs", () => {
  it("fetches and validates FAQ rows with Supabase auth headers", async () => {
    const fetchFn = vi.fn(async () => jsonResponse([row]));
    const faqs = await fetchFaqs({
      locale: "en",
      fetchFn: fetchFn as unknown as typeof fetch,
      baseUrl,
      anonKey,
    });

    expect(faqs).toEqual([row]);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(getFaqsEndpoint(baseUrl, "en"));
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe(`Bearer ${anonKey}`);
    expect(headers["apikey"]).toBe(anonKey);
  });

  it("throws a generic error and logs on non-OK responses", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchFn = vi.fn(async () => new Response("db exploded", { status: 500 }));

    await expect(
      fetchFaqs({
        fetchFn: fetchFn as unknown as typeof fetch,
        baseUrl,
        anonKey,
      })
    ).rejects.toThrow("Could not load FAQs. Try again.");
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(String(errorSpy.mock.calls[0]?.[0])).toContain("500");
  });

  it("throws when the payload fails validation", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchFn = vi.fn(async () => jsonResponse([{ ...row, locale: "es" }]));

    await expect(
      fetchFaqs({
        fetchFn: fetchFn as unknown as typeof fetch,
        baseUrl,
        anonKey,
      })
    ).rejects.toThrow("Could not load FAQs. Try again.");
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it("throws a reachability error when the network fails", async () => {
    const fetchFn = vi.fn(async () => {
      throw new Error("network down");
    });

    await expect(
      fetchFaqs({
        fetchFn: fetchFn as unknown as typeof fetch,
        baseUrl,
        anonKey,
      })
    ).rejects.toThrow("Could not reach the FAQ service. Try again.");
  });

  it("throws without calling fetch when the anon key is missing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchFn = vi.fn(async () => jsonResponse([row]));

    await expect(
      fetchFaqs({
        fetchFn: fetchFn as unknown as typeof fetch,
        baseUrl,
        anonKey: "",
      })
    ).rejects.toThrow("Could not load FAQs. Try again.");
    expect(fetchFn).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
