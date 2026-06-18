import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { TermSheetProvider } from "@/components/term-sheet";
import { SWRegister } from "@/components/sw-register";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stationfall Companion",
  description: "Pravidlový průvodce deskovkou Stationfall (Zkáza na orbitě).",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="cs" className={`dark ${inter.variable}`}>
      <body className="min-h-dvh pb-16 antialiased">
        <TermSheetProvider>{children}</TermSheetProvider>
        <BottomNav />
        <SWRegister />
      </body>
    </html>
  );
}
