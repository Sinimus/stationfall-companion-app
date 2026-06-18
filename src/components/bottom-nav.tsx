"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BookOpen, Route, Search } from "lucide-react";

const ITEMS = [
  { href: "/postavy", label: "Postavy", Icon: Users },
  { href: "/glosar", label: "Glosář", Icon: BookOpen },
  { href: "/pruvodci", label: "Průvodci", Icon: Route },
  { href: "/hledat", label: "Hledat", Icon: Search },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Hlavní navigace"
      className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
    >
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className="flex flex-col items-center gap-1 py-2 text-xs text-zinc-500 aria-[current=page]:text-zinc-900 dark:aria-[current=page]:text-zinc-100"
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
