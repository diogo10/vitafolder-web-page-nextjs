"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLoginErrorMessage, getSignupErrorMessage } from "./lib/auth-errors";
import { loginSchema, signupSchema } from "./schemas";

export type LoginActionErrors = {
  email?: string;
  password?: string;
  form?: string;
};

export type LoginActionResult = { ok: true } | { ok: false; errors: LoginActionErrors };

export type SignupActionErrors = {
  email?: string;
  password?: string;
  form?: string;
};

export type SignupActionResult =
  { ok: true; requiresEmailConfirmation: boolean } | { ok: false; errors: SignupActionErrors };

function getDashboardRedirectUrl(): string {
  return `${env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "")}/dashboard`;
}

export async function loginAction(input: unknown): Promise<LoginActionResult> {
  const result = loginSchema.safeParse(input);
  if (!result.success) {
    const errors: LoginActionErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field === "email" && !errors.email) errors.email = issue.message;
      if (field === "password" && !errors.password) errors.password = issue.message;
    }
    return { ok: false, errors };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    console.error("[auth] missing SUPABASE_ANON_KEY — login is not configured.");
    return { ok: false, errors: { form: "Sign-in is temporarily unavailable. Try again." } };
  }

  const { email, password } = result.data;
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, errors: { form: getLoginErrorMessage(error) } };
  }

  // Auth cookies changed, so refresh any server-rendered state that depends
  // on the session.
  revalidatePath("/", "layout");

  return { ok: true };
}

export async function signupAction(input: unknown): Promise<SignupActionResult> {
  const result = signupSchema.safeParse(input);
  if (!result.success) {
    const errors: SignupActionErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field === "email" && !errors.email) errors.email = issue.message;
      if (field === "password" && !errors.password) errors.password = issue.message;
    }
    return { ok: false, errors };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    console.error("[auth] missing SUPABASE_ANON_KEY — signup is not configured.");
    return {
      ok: false,
      errors: { form: "Account creation is temporarily unavailable. Try again." },
    };
  }

  const { email, password } = result.data;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: getDashboardRedirectUrl() },
  });

  if (error) {
    return { ok: false, errors: { form: getSignupErrorMessage(error) } };
  }

  // Supabase returns no session when email confirmation is enabled. The
  // account still exists, but the user must confirm before they can sign in.
  revalidatePath("/", "layout");

  return { ok: true, requiresEmailConfirmation: !data.session };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(`[auth] sign-out failed: ${error.message}`);
    }
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
