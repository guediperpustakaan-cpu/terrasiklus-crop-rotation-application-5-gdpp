"use client";

import {
  BarChart3,
  Leaf,
  LayoutDashboard,
  Library,
  Menu,
  NotebookPen,
  Sprout,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

const NAV = [
  { href: "/dashboard", label: "Dasbor", icon: LayoutDashboard },
  { href: "/kebun", label: "Kebun & Petak", icon: Sprout },
  { href: "/riwayat", label: "Riwayat Tanam", icon: NotebookPen },
  { href: "/katalog", label: "Katalog Tanaman", icon: Library },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navLinks = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-leaf-600 text-white shadow-sm"
                : "text-soil-600 hover:bg-leaf-50 hover:text-leaf-700"
            }`}
          >
            <Icon className="h-4.5 w-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-soil-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-600 text-white shadow-sm">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-extrabold tracking-tight text-soil-900">
                TerraSiklus
              </span>
              <span className="hidden text-[10px] font-semibold tracking-[0.16em] text-soil-400 uppercase sm:block">
                Rotasi Tanam &amp; Kesehatan Tanah
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/katalog" className="btn-secondary hidden sm:inline-flex">
              <Library className="h-4 w-4" />
              Katalog
            </Link>
            <div className="hidden items-center gap-2 rounded-full bg-leaf-50 py-1.5 pr-3.5 pl-1.5 md:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-leaf-600 text-xs font-bold text-white">
                BS
              </span>
              <span className="text-sm font-semibold text-soil-700">Bu Sari</span>
            </div>
            <button
              onClick={() => setOpen((v) => !v)}
              className="btn-secondary px-2.5 lg:hidden"
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="animate-fade-up border-t border-soil-100 bg-white px-4 py-3 lg:hidden">
            {navLinks}
          </div>
        ) : null}
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:py-8">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">
            {navLinks}
            <div className="card mt-5 bg-gradient-to-br from-leaf-600 to-leaf-800 p-4 text-white">
              <BarChart3 className="mb-2 h-5 w-5" />
              <p className="text-sm font-bold">Aturan rotasi</p>
              <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-leaf-50/90">
                <li>• Ganti famili botani tiap musim</li>
                <li>• Jeda 12 bulan per famili</li>
                <li>• Tanaman berat → pembenah tanah</li>
                <li>• Uji tanah tiap 6 bulan</li>
              </ul>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-20 lg:pb-4">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-soil-100 bg-white/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-1.5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition ${
                  active ? "text-leaf-700" : "text-soil-400"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                    active ? "bg-leaf-100" : ""
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
