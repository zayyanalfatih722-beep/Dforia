import { useRef, useEffect, useState } from "react";

const MARQUEE_TEXT = [
  "Selamat Datang di D'Foria Kitchen",
  "Menerima Pesanan Harian",
  "Fresh Every Day",
  "Siap Antar ke Lokasi Anda",
  "Terima Kasih Telah Memilih D'Foria Kitchen",
];

export function Marquee() {
  return (
    <div className="relative w-full overflow-hidden bg-[#7A263A] py-3 border-y border-[#9a3050]">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#7A263A] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#7A263A] to-transparent z-10 pointer-events-none" />

      <div className="marquee-track flex items-center gap-0 whitespace-nowrap">
        {[...MARQUEE_TEXT, ...MARQUEE_TEXT].map((text, idx) => (
          <span key={idx} className="inline-flex items-center gap-3 px-6">
            <span
              className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-white/90"
            >
              {text}
            </span>
            <span className="text-[#D6B16F] text-base leading-none select-none" aria-hidden>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
