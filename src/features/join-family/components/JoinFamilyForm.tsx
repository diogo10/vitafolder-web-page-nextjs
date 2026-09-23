"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { extractEmail, extractInviteCode } from "../lib/invite";
import { joinFamilySchema } from "../schemas";

type JoinFamilyFormProps = {
  initialEmail?: string;
  initialCode?: string;
};

export function JoinFamilyForm({ initialEmail = "", initialCode = "" }: JoinFamilyFormProps) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => initialEmail || extractEmail(searchParams));
  const [inviteCode, setInviteCode] = useState(
    () => initialCode || extractInviteCode(searchParams)
  );
  const [errors, setErrors] = useState<{ email?: string; inviteCode?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  // Sync from the URL on client-side navigation without clobbering user input
  // or server-provided initial values.
  useEffect(() => {
    const fromUrlEmail = extractEmail(searchParams);
    const fromUrlCode = extractInviteCode(searchParams);
    if (fromUrlEmail) {
      setEmail((current) => current || fromUrlEmail);
    }
    if (fromUrlCode) {
      setInviteCode((current) => current || fromUrlCode);
    }
  }, [searchParams]);

  // Sync when the server provides new initial values (e.g. fresh ?code= navigation).
  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (initialCode) setInviteCode(initialCode);
  }, [initialCode]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = joinFamilySchema.safeParse({ email, inviteCode });
    if (!result.success) {
      const fieldErrors: { email?: string; inviteCode?: string } = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === "email" && !fieldErrors.email) fieldErrors.email = issue.message;
        if (field === "inviteCode" && !fieldErrors.inviteCode)
          fieldErrors.inviteCode = issue.message;
      }
      setErrors(fieldErrors);
      setSubmitted(false);
      return;
    }
    setErrors({});
    setSubmitted(true);
  }

  return (
    <div>
      <h2 className="m-0 text-lg font-extrabold text-[#634f39]">Get Started</h2>
      <p className="mb-0 mt-2 text-[10.5px] text-[#b8a080]">Enter your email to join the circle</p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mt-7 text-left">
          <label
            htmlFor="join-email"
            className="mb-2 ml-[3px] block text-[7.5px] font-bold tracking-[0.14em] text-brand"
          >
            EMAIL ADDRESS
          </label>
          <div
            className={cn(
              "flex h-[52px] items-center gap-2.5 rounded-[13px] border bg-[#faf9f6] px-4",
              errors.email ? "border-red-400" : "border-[#f0ebe3]"
            )}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1.5" y="3" width="13" height="10" rx="2" fill="#c9b99a" />
              <path
                d="m3 5.5 5 3.5 5-3.5"
                stroke="#faf9f6"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              id="join-email"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "join-email-error" : undefined}
              className="h-full w-full border-0 bg-transparent text-[13.5px] text-[#634f39] outline-none placeholder:text-[#c9b99a]"
            />
          </div>
          {errors.email && (
            <p id="join-email-error" role="alert" className="mt-2 text-xs text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div className="mt-4 text-left">
          <label
            htmlFor="join-code"
            className="mb-2 ml-[3px] block text-[7.5px] font-bold tracking-[0.14em] text-brand"
          >
            INVITE CODE
          </label>
          <div
            className={cn(
              "flex h-[52px] items-center gap-2.5 rounded-[13px] border bg-[#faf9f6] px-4",
              errors.inviteCode ? "border-red-400" : "border-[#f0ebe3]"
            )}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="12" height="12" rx="2.5" fill="#c9b99a" />
              <path d="M5.5 8h5M8 5.5v5" stroke="#faf9f6" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              id="join-code"
              name="code"
              type="text"
              placeholder="e.g. FAMILY-1234"
              autoComplete="off"
              spellCheck={false}
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              aria-invalid={Boolean(errors.inviteCode)}
              aria-describedby={errors.inviteCode ? "join-code-error" : "join-code-hint"}
              className="h-full w-full border-0 bg-transparent text-[13.5px] text-[#634f39] outline-none placeholder:text-[#c9b99a]"
            />
          </div>
          {errors.inviteCode ? (
            <p id="join-code-error" role="alert" className="mt-2 text-xs text-red-600">
              {errors.inviteCode}
            </p>
          ) : (
            <p id="join-code-hint" className="mt-2 text-[10px] leading-snug text-[#c9b99a]">
              Paste the code from your invitation — it fills automatically from a ?code= link.
            </p>
          )}
        </div>

        <button
          type="submit"
          className="mt-[18px] inline-flex h-[62px] w-full items-center justify-center gap-3 rounded-2xl bg-brand text-[13.5px] font-bold text-white shadow-[0_10px_20px_rgba(139,115,85,0.3)] transition-colors hover:bg-[#7a6348]"
        >
          Join Family Circle
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M2.5 8h10M9 4.5 12.5 8 9 11.5"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
      {submitted && (
        <p
          role="status"
          className="mx-auto mt-4 max-w-[300px] text-xs font-semibold text-[#634f39]"
        >
          You&rsquo;re on the list — check your inbox for the next step.
        </p>
      )}
      <hr className="mb-0 mt-[34px] border-0 border-t border-[#faf9f6]" />
      <p className="mx-auto mb-0 mt-[22px] max-w-[300px] text-[8.2px] leading-[1.7] text-[#c9b99a]">
        By joining, you&rsquo;ll get instant access to the shared family dashboard.
      </p>
      <a href="#" className="mt-2.5 inline-block text-xs font-bold text-brand no-underline">
        Learn more
      </a>
      <p className="mb-0 mt-1.5 text-xs text-[#1a1a1a]">about our commitment to privacy.</p>
    </div>
  );
}
