import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "HouseMira — Dashboard",
  description: "Your family dashboard for calendars, reminders, and shared lists.",
};

// The dashboard is session-gated, so it must never be prerendered: the auth
// check reads request cookies. Without this, a build that happens to run
// without SUPABASE_ANON_KEY makes `createSupabaseServerClient()` return before
// touching `cookies()`, Next.js classifies the route as static, and every
// request 500s at runtime with DYNAMIC_SERVER_USAGE.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const auth = supabase ? await supabase.auth.getUser() : null;

  if (auth?.error) {
    console.error(`[dashboard] failed to load the signed-in user: ${auth.error.message}`);
  }

  const user = auth?.data.user ?? null;

  if (!user) {
    // Preserve the intended destination so login can return the visitor here.
    redirect("/login?next=%2Fdashboard");
  }

  return (
    <div className="mx-auto w-full max-w-[960px]">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Your home</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-[34px]">Dashboard</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-mist">
        Welcome{user.email ? `, ${user.email}` : ""}. Your family overview will appear here.
      </p>

      <section
        aria-labelledby="dashboard-overview-heading"
        className="mt-8 rounded-[24px] border border-line bg-white p-6 shadow-[0_20px_45px_rgba(26,26,26,0.06)] sm:p-8"
      >
        <h2 id="dashboard-overview-heading" className="text-lg font-bold text-ink">
          Overview
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-mist">
          This is your main dashboard placeholder. Calendars, reminders, and shared lists will live
          here soon.
        </p>
      </section>
    </div>
  );
}
