import { useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useListBanners } from "@workspace/api-client-react";
import { SEED_BANNERS } from "../hooks/useSeedData";
import { Link } from "wouter";
import { ShoppingBag, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import { useDailyGreeting } from "../hooks/useDailyGreeting";

export function HeroBanner({ compact = false }: { compact?: boolean }) {
  const { data: banners = SEED_BANNERS } = useListBanners();
  const { greeting, label, sub } = useDailyGreeting();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => {
      emblaApi.off("select", onSelect);
      clearInterval(interval);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (compact) return;
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [compact]);

  if (!banners || banners.length === 0) return null;

  if (compact) {
    return (
      <div className="relative w-full overflow-hidden" style={{ height: "190px" }}>
        <div className="absolute inset-0" ref={emblaRef}>
          <div className="flex h-full">
            {banners.map((banner, index) => (
              <div key={banner.id || index} className="relative flex-[0_0_100%] h-full">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-5">
          <motion.p
            key={greeting}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[#D6B16F] text-[10px] font-bold tracking-[0.22em] uppercase mb-1"
          >
            {greeting}
          </motion.p>
          <motion.p
            key={label}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="font-serif text-sm font-semibold text-white leading-snug max-w-[260px]"
          >
            {label}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-white/60 text-[11px] mt-1 mb-3"
          >
            {sub}
          </motion.p>
          <div className="flex gap-2">
            <Link href="/checkout" className="px-4 py-1.5 bg-[#7A263A] text-white text-xs font-semibold rounded-full hover:bg-[#9a3050] transition-colors flex items-center gap-1.5">
              <ShoppingBag size={12} /> Pesan
            </Link>
            <Link href="/menu" className="px-4 py-1.5 bg-white/15 backdrop-blur text-white text-xs font-semibold rounded-full border border-white/30 hover:bg-white/25 transition-colors flex items-center gap-1.5">
              <UtensilsCrossed size={12} /> Menu
            </Link>
          </div>
        </div>
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
          {banners.map((_, index) => (
            <button key={index} onClick={() => emblaApi?.scrollTo(index)}
              className={`rounded-full transition-all duration-300 ${index === selectedIndex ? "w-5 h-1 bg-[#D6B16F]" : "w-1.5 h-1 bg-white/30"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={heroRef} className="relative w-full overflow-hidden" style={{ minHeight: "100svh" }}>
      <div
        className="absolute inset-0"
        ref={emblaRef}
        style={{ transform: `translateY(${scrollY * 0.3}px)`, willChange: "transform" }}
      >
        <div className="flex h-full" style={{ height: "110svh" }}>
          {banners.map((banner, index) => (
            <div key={banner.id || index} className="relative flex-[0_0_100%] h-full">
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20" style={{ minHeight: "100svh" }}>
        <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 1, delay: 0.2, ease: "easeOut" }} className="flex items-center gap-3 mb-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D6B16F]" />
          <span className="text-[#D6B16F] text-xs font-medium tracking-[0.3em] uppercase">Premium Kitchen</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D6B16F]" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} className="overflow-hidden">
          <h1 className="font-serif font-bold leading-[1.1] tracking-tight text-white hero-shimmer-text" style={{ fontSize: "clamp(2.2rem, 8vw, 4.5rem)" }}>
            Welcome To<br /><span className="italic text-[#D6B16F]">D'Foria</span> Kitchen
          </h1>
        </motion.div>
        <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }} className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D6B16F] to-transparent my-6" />
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }} className="text-white/80 font-light leading-relaxed max-w-xs" style={{ fontSize: "clamp(0.9rem, 3.5vw, 1.1rem)" }}>
          Masakan Rumahan Premium<br />dengan Cita Rasa Istimewa
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.3, ease: "easeOut" }} className="flex flex-col sm:flex-row gap-3 mt-10">
          <Link href="/checkout" className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#7A263A] text-white font-semibold text-sm tracking-wide rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(122,38,58,0.5)] active:scale-95">
            <span className="absolute inset-0 bg-gradient-to-r from-[#7A263A] via-[#9a3050] to-[#7A263A] bg-[length:200%_100%] group-hover:animate-shimmer-btn" />
            <ShoppingBag size={16} className="relative z-10" />
            <span className="relative z-10">Pesan Sekarang</span>
          </Link>
          <Link href="/menu" className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur-md text-white font-semibold text-sm tracking-wide rounded-full border border-white/30 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:border-[#D6B16F] hover:text-[#D6B16F] active:scale-95">
            <UtensilsCrossed size={16} />
            <span>Lihat Menu</span>
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <span className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
        </motion.div>
      </div>
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
        {banners.map((_, index) => (
          <button key={index} onClick={() => emblaApi?.scrollTo(index)}
            className={`rounded-full transition-all duration-300 ${index === selectedIndex ? "w-6 h-1.5 bg-[#D6B16F]" : "w-2 h-1.5 bg-white/30"}`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
