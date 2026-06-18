import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";

export const metadata: Metadata = {
  title: "Stationfall Companion",
  description: "Pravidlový průvodce deskovkou Stationfall (Zkáza na orbitě).",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="cs">
      <body className="min-h-dvh pb-16 antialiased">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
