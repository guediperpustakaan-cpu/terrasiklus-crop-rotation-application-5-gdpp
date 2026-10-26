import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "TerraSiklus — Kalkulator Rotasi Tanam & Pemantau Kesehatan Tanah",
  description:
    "Rencanakan musim tanam berdasarkan famili botani dan riwayat tanah. Cegah hama, optimalkan hara, dan panen lebih banyak dengan TerraSiklus.",
  keywords: [
    "rotasi tanaman",
    "kesehatan tanah",
    "pertanian",
    "kebun",
    "TerraSiklus",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
