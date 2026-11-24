"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLoginErrorMessage } from "./lib/auth-errors";
import { loginSchema } from "./schemas";

export type LoginActionErrors = {
  email?: string;
  password?: string;
  form?: string;
};

export type LoginActionResult = { ok: true } | { ok: false; errors: LoginActionErrors };

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
