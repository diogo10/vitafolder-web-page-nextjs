"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";
const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileRenderOptions = {
  sitekey: string;
  action?: string;
  theme?: "light" | "dark" | "auto";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Load Cloudflare's explicit-render script once per page. Resolves on both
 * load and error so callers never hang when the script is blocked (the server
 * fails closed when a token is required but missing).
 */
let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined" || window.turnstile) return Promise.resolve();

  if (!turnstileScriptPromise) {
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      turnstileScriptPromise = new Promise((resolve) => {
        if (window.turnstile) {
          resolve();
          return;
        }
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => resolve(), { once: true });
      });
    } else {
      turnstileScriptPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = TURNSTILE_SCRIPT_ID;
        script.src = TURNSTILE_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.addEventListener("load", () => resolve(), { once: true });
        script.addEventListener("error", () => resolve(), { once: true });
        document.head.appendChild(script);
      });
    }
  }

  return turnstileScriptPromise;
}

type TurnstileWidgetProps = {
  /**
   * Cloudflare Turnstile site key (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`). When it
   * is not configured (dev/test) the widget renders nothing and the form
   * submits without a token; the server still fails closed if a secret is
   * configured without a matching site key.
   */
  siteKey?: string;
  action?: string;
  className?: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
};

/**
 * Thin wrapper around Cloudflare's explicit-render Turnstile widget.
 *
 * The widget owns the challenge lifecycle; forms only receive the token via
 * `onToken` and should clear it on `onExpire` (or after a failed submit, since
 * tokens are single-use).
 */
export function TurnstileWidget({
  siteKey,
  action,
  className,
  onToken,
  onExpire,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onToken, onExpire });

  useEffect(() => {
    callbacksRef.current = { onToken, onExpire };
  }, [onToken, onExpire]);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || widgetIdRef.current || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme: "light",
          callback: (token) => callbacksRef.current.onToken(token),
          "expired-callback": () => callbacksRef.current.onExpire?.(),
          "error-callback": () => callbacksRef.current.onExpire?.(),
        });
      })
      .catch(() => {
        // The server verifies the token and fails closed; there is nothing
        // useful to show here beyond the form-level error.
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget may already be gone (script blocked or page torn down).
        }
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, action]);

  if (!siteKey) return null;

  return (
    <div
      ref={containerRef}
      data-turnstile-widget={action ?? "default"}
      className={cn("mt-5 flex min-h-[65px] justify-center", className)}
    />
  );
}
