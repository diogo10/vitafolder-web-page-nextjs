"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { loginAction } from "../actions";
import { sanitizeNextPath } from "../lib/redirect";
import { loginSchema } from "../schemas";

type LoginErrors = {
  email?: string;
  password?: string;
  form?: string;
};

type LoginFormProps = {
  /** Same-origin destination to open after a successful sign-in. */
  nextPath?: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const destination = sanitizeNextPath(nextPath);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: LoginErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "email" && !fieldErrors.email) fieldErrors.email = issue.message;
        if (field === "password" && !fieldErrors.password) fieldErrors.password = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsPending(true);
    try {
      const result = await loginAction(parsed.data);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      router.replace(destination);
      router.refresh();
    } catch {
      setErrors({ form: "We couldn't sign you in. Please try again." });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 text-left">
      <div>
        <label
          htmlFor="login-email"
          className="mb-2 ml-[3px] block text-[11px] font-bold tracking-[0.12em] text-brand"
        >
          EMAIL ADDRESS
        </label>
        <div
          className={cn(
            "flex h-[52px] items-center gap-2.5 rounded-[13px] border bg-[#faf9f6] px-4 transition-colors focus-within:border-brand",
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
            id="login-email"
            name="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className="h-full w-full border-0 bg-transparent text-[14px] text-ink outline-none placeholder:text-[#c9b99a]"
          />
        </div>
        {errors.email && (
          <p id="login-email-error" role="alert" className="mt-2 text-xs text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      <div className="mt-5">
        <label
          htmlFor="login-password"
          className="mb-2 ml-[3px] block text-[11px] font-bold tracking-[0.12em] text-brand"
        >
          PASSWORD
        </label>
        <div
          className={cn(
            "flex h-[52px] items-center gap-2.5 rounded-[13px] border bg-[#faf9f6] px-4 transition-colors focus-within:border-brand",
            errors.password ? "border-red-400" : "border-[#f0ebe3]"
          )}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="3" y="7" width="10" height="7" rx="2" fill="#c9b99a" />
            <path
              d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"
              stroke="#c9b99a"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            className="h-full w-full border-0 bg-transparent text-[14px] text-ink outline-none placeholder:text-[#c9b99a]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="shrink-0 rounded p-1 text-[11px] font-bold uppercase tracking-[0.08em] text-brand transition-colors hover:text-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && (
          <p id="login-password-error" role="alert" className="mt-2 text-xs text-red-600">
            {errors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-7 inline-flex h-[54px] w-full items-center justify-center gap-3 rounded-[14px] bg-brand text-[14px] font-bold text-white shadow-[0_10px_20px_rgba(139,115,85,0.28)] transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Signing in…" : "Sign in"}
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

      {errors.form && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">
          {errors.form}
        </p>
      )}
    </form>
  );
}
