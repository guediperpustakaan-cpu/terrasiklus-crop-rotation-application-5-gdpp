"use client";

import { useState } from "react";

const AMOUNTS = [6000, 12000, 18000, 30000, 50000];

export function TrakteerWidget() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(AMOUNTS[0]);

  const url = `https://trakteer.id/perpus_opera?amount=${amount}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-2xl bg-[#be1e2d] px-4 py-3 text-sm font-bold text-white shadow-xl hover:bg-[#a01825]"
      >
        ☕ Web app ini gratis & bebas iklan. Kopi kecil, server tetap jalan
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-soil-900">Traktir TerraSiklus</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-soil-500">✕</button>
            </div>
            <p className="mt-2 text-sm text-soil-600">Pilih nominal traktiran:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                    amount === a ? "bg-[#be1e2d] text-white" : "bg-soil-100 text-soil-800"
                  }`}
                >
                  Rp{a.toLocaleString("id-ID")}
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`}
                alt="QR Trakteer"
                width={220}
                height={220}
              />
            </div>
            <p className="mt-3 text-center text-xs text-soil-500">
              Scan QR atau buka{" "}
              <a href={url} target="_blank" rel="noreferrer" className="font-semibold text-[#be1e2d]">
                trakteer.id/perpus_opera
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}