import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const day = DAYS[now.getDay()];
  const date = now.getDate();
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="mx-4 rounded-2xl overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #7A263A 0%, #5a1a2a 60%, #3d0f1c 100%)",
        boxShadow: "0 8px 40px rgba(122,38,58,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(214,177,111,0.3) 0%, transparent 60%),
                            radial-gradient(circle at 80% 80%, rgba(214,177,111,0.15) 0%, transparent 50%)`,
        }}
      />

      <div className="relative z-10 px-6 py-6 flex flex-col items-center gap-3">
        {/* Gold ornament */}
        <div className="flex items-center gap-2 mb-1">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#D6B16F]" />
          <span className="text-[#D6B16F] text-[9px] font-medium tracking-[0.3em] uppercase">Waktu Sekarang</span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#D6B16F]" />
        </div>

        {/* Date */}
        <p className="font-serif text-white/90 font-medium tracking-wide"
          style={{ fontSize: "clamp(0.95rem, 3.5vw, 1.15rem)" }}>
          {day}, {date} {month} {year}
        </p>

        {/* Digital clock */}
        <div className="flex items-end gap-1">
          <span
            className="font-serif font-bold text-white tabular-nums leading-none"
            style={{ fontSize: "clamp(2.8rem, 11vw, 4.5rem)", letterSpacing: "-0.02em" }}
          >
            {hh}
          </span>
          <span
            className="font-serif font-bold text-[#D6B16F] leading-none pb-1 animate-pulse"
            style={{ fontSize: "clamp(2rem, 8vw, 3rem)" }}
          >
            :
          </span>
          <span
            className="font-serif font-bold text-white tabular-nums leading-none"
            style={{ fontSize: "clamp(2.8rem, 11vw, 4.5rem)", letterSpacing: "-0.02em" }}
          >
            {mm}
          </span>
          <span
            className="font-serif font-bold text-[#D6B16F] leading-none pb-1 animate-pulse"
            style={{ fontSize: "clamp(2rem, 8vw, 3rem)" }}
          >
            :
          </span>
          <span
            className="font-serif font-bold tabular-nums leading-none"
            style={{
              fontSize: "clamp(2.8rem, 11vw, 4.5rem)",
              letterSpacing: "-0.02em",
              color: "#D6B16F",
            }}
          >
            {ss}
          </span>
        </div>

        {/* WIB label */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D6B16F] animate-pulse" />
          <span className="text-white/60 text-xs tracking-[0.25em] font-medium uppercase">WIB</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#D6B16F] animate-pulse" />
        </div>
      </div>

      {/* Bottom gold accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#D6B16F] to-transparent" />
    </motion.div>
  );
}
