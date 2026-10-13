"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { sendInviteAction, type InviteFamilyActionErrors } from "../actions";
import { inviteFamilySchema } from "../schemas";

const LOCALE_OPTIONS = [
  { value: "en", label: "English (en)" },
  { value: "pt", label: "Português (pt)" },
  { value: "es", label: "Español (es)" },
];

type InviteFamilyFormProps = {
  initialInviteCode?: string;
};

const inputClass =
  "h-full w-full border-0 bg-transparent text-[13.5px] text-[#634f39] outline-none placeholder:text-[#c9b99a]";

function fieldShell(hasError: boolean): string {
  return cn(
    "flex h-[52px] items-center gap-2.5 rounded-[13px] border bg-[#faf9f6] px-4",
    hasError ? "border-red-400" : "border-[#f0ebe3]"
  );
}

export function InviteFamilyForm({ initialInviteCode = "" }: InviteFamilyFormProps) {
  const [to, setTo] = useState("");
  const [locale, setLocale] = useState("en");
  const [inviterName, setInviterName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [errors, setErrors] = useState<InviteFamilyActionErrors>({});
  const [formError, setFormError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = inviteFamilySchema.safeParse({
      to,
      locale,
      inviterName,
      familyName,
      inviteCode,
    });
    if (!parsed.success) {
      const fieldErrors: InviteFamilyActionErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof InviteFamilyActionErrors | undefined;
        if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      setFormError("");
      setSentTo("");
      return;
    }
    setErrors({});
    setFormError("");
    setSentTo("");
    setIsPending(true);
    try {
      const result = await sendInviteAction(parsed.data);
      if (!result.ok) {
        setErrors(result.errors);
        setFormError(result.formError ?? "");
        return;
      }
      setSentTo(parsed.data.to);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      <h2 className="m-0 text-lg font-extrabold text-[#634f39]">Invite your family</h2>
      <p className="mb-0 mt-2 text-[10.5px] text-[#b8a080]">
        Send an email invitation to your family circle
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mt-7 text-left">
          <label
            htmlFor="invite-to"
            className="mb-2 ml-[3px] block text-[7.5px] font-bold tracking-[0.14em] text-brand"
          >
            RECIPIENT EMAIL
          </label>
          <div className={fieldShell(Boolean(errors.to))}>
            <input
              id="invite-to"
              name="to"
              type="email"
              placeholder="email@example.com"
              autoComplete="email"
              required
              value={to}
              onChange={(event) => setTo(event.target.value)}
              aria-invalid={Boolean(errors.to)}
              aria-describedby={errors.to ? "invite-to-error" : undefined}
              className={inputClass}
            />
          </div>
          {errors.to && (
            <p id="invite-to-error" role="alert" className="mt-2 text-xs text-red-600">
              {errors.to}
            </p>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="text-left">
            <label
              htmlFor="invite-inviter"
              className="mb-2 ml-[3px] block text-[7.5px] font-bold tracking-[0.14em] text-brand"
            >
              YOUR NAME
            </label>
            <div className={fieldShell(Boolean(errors.inviterName))}>
              <input
                id="invite-inviter"
                name="inviterName"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                required
                value={inviterName}
                onChange={(event) => setInviterName(event.target.value)}
                aria-invalid={Boolean(errors.inviterName)}
                aria-describedby={errors.inviterName ? "invite-inviter-error" : undefined}
                className={inputClass}
              />
            </div>
            {errors.inviterName && (
              <p id="invite-inviter-error" role="alert" className="mt-2 text-xs text-red-600">
                {errors.inviterName}
              </p>
            )}
          </div>

          <div className="text-left">
            <label
              htmlFor="invite-family-name"
              className="mb-2 ml-[3px] block text-[7.5px] font-bold tracking-[0.14em] text-brand"
            >
              FAMILY NAME
            </label>
            <div className={fieldShell(Boolean(errors.familyName))}>
              <input
                id="invite-family-name"
                name="familyName"
                type="text"
                placeholder="Smith Family"
                autoComplete="off"
                required
                value={familyName}
                onChange={(event) => setFamilyName(event.target.value)}
                aria-invalid={Boolean(errors.familyName)}
                aria-describedby={errors.familyName ? "invite-family-name-error" : undefined}
                className={inputClass}
              />
            </div>
            {errors.familyName && (
              <p id="invite-family-name-error" role="alert" className="mt-2 text-xs text-red-600">
                {errors.familyName}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="text-left">
            <label
              htmlFor="invite-code"
              className="mb-2 ml-[3px] block text-[7.5px] font-bold tracking-[0.14em] text-brand"
            >
              INVITE CODE
            </label>
            <div className={fieldShell(Boolean(errors.inviteCode))}>
              <input
                id="invite-code"
                name="inviteCode"
                type="text"
                placeholder="ABC-123"
                autoComplete="off"
                spellCheck={false}
                required
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
                aria-invalid={Boolean(errors.inviteCode)}
                aria-describedby={errors.inviteCode ? "invite-code-error" : undefined}
                className={inputClass}
              />
            </div>
            {errors.inviteCode && (
              <p id="invite-code-error" role="alert" className="mt-2 text-xs text-red-600">
                {errors.inviteCode}
              </p>
            )}
          </div>

          <div className="text-left">
            <label
              htmlFor="invite-locale"
              className="mb-2 ml-[3px] block text-[7.5px] font-bold tracking-[0.14em] text-brand"
            >
              LANGUAGE
            </label>
            <div className={fieldShell(Boolean(errors.locale))}>
              <select
                id="invite-locale"
                name="locale"
                value={locale}
                onChange={(event) => setLocale(event.target.value)}
                aria-invalid={Boolean(errors.locale)}
                aria-describedby={errors.locale ? "invite-locale-error" : undefined}
                className={inputClass}
              >
                {LOCALE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.locale && (
              <p id="invite-locale-error" role="alert" className="mt-2 text-xs text-red-600">
                {errors.locale}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-[18px] inline-flex h-[62px] w-full items-center justify-center gap-3 rounded-2xl bg-brand text-[13.5px] font-bold text-white shadow-[0_10px_20px_rgba(139,115,85,0.3)] transition-colors hover:bg-[#7a6348] disabled:opacity-70"
        >
          {isPending ? "Sending…" : "Send Invite"}
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
      {formError && (
        <p role="alert" className="mx-auto mt-4 max-w-[300px] text-xs font-semibold text-red-600">
          {formError}
        </p>
      )}
      {sentTo && (
        <p
          role="status"
          className="mx-auto mt-4 max-w-[300px] text-xs font-semibold text-[#634f39]"
        >
          Invite sent to {sentTo} — they&rsquo;ll get an email with your invite code.
        </p>
      )}
      <hr className="mb-0 mt-[34px] border-0 border-t border-[#faf9f6]" />
      <p className="mx-auto mb-0 mt-[22px] max-w-[300px] text-[8.2px] leading-[1.7] text-[#c9b99a]">
        Your invite email is sent securely through our invitation service.
      </p>
    </div>
  );
}
