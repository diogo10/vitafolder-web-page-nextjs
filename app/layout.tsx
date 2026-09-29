import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HouseMira — Run your home like a pro",
  description:
    "HouseMira brings your calendar, reminders, and shared lists into one calm, private space — so everyone stays in the loop without the chaos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
