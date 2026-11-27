import type { Metadata } from "next";
import { DashboardSidebar } from "@/features/dashboard/components/DashboardSidebar";

export const metadata: Metadata = {
  title: "HouseMira — Dashboard",
  description: "Your family dashboard for calendars, reminders, and shared lists.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-cream font-sans text-ink md:flex-row">
      <DashboardSidebar />
      <main className="flex-1 px-5 py-10 sm:px-8 lg:px-12">{children}</main>
    </div>
  );
}
