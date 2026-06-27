import { useState } from "react";
import { Link } from "wouter";
import { Search, ShoppingBag, Star, Zap, Grid3X3, MessageSquareQuote, UtensilsCrossed, Sparkles } from "lucide-react";
import { HeroBanner } from "../components/HeroBanner";
import { MenuCard } from "../components/MenuCard";
import { SkeletonGrid } from "../components/SkeletonCard";
import { Marquee } from "../components/Marquee";
import { MenuItem } from "../contexts/CartContext";
import { useCart } from "../contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useListMenuItems } from "@workspace/api-client-react";
import { useEffect } from "react";
import { useDailyGreeting } from "../hooks/useDailyGreeting";

type Tab = "bestseller" | "promo" | "kategori" | "testimoni";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "bestseller", label: "Best Seller", icon: Star },
  { id: "promo", label: "Promo", icon: Zap },
  { id: "kategori", label: "Kategori", icon: Grid3X3 },
  { id: "testimoni", label: "Testimoni", icon: MessageSquareQuote },
];

const TESTIMONIALS = [
  { name: "Rina S.", rating: 5, text: "Rasanya luar biasa! Nasi gorengnya mantap banget, bumbu meresap sempurna. Pasti pesan lagi!", avatar: "R" },
  { name: "Budi P.", rating: 5, text: "Pelayanan cepat dan makanan datang masih panas. Rendang sapinya juara, worth it banget!", avatar: "B" },
  { name: "Siti N.", rating: 5, text: "D'Foria jadi langganan keluarga kami. Paket keluarganya cocok banget untuk makan bersama.", avatar: "S" },
  { name: "Dani R.", rating: 4, text: "Kopi susu gula arennya enak banget! Pas buat menemani kerja. Recommended deh!", avatar: "D" },
  { name: "Maya L.", rating: 5, text: "Soto ayamnya gurih dan segar. Paling suka makannya waktu hujan. Selalu konsisten rasanya!", avatar: "M" },
];

function SmallClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
      {format(now, "EEE, d MMM · HH:mm:ss", { locale: idLocale })}
    </span>
  );
}

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-16 text-center text-muted-foreground">
      <UtensilsCrossed size={32} className="mx-auto mb-2 opacity-20" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

export default function Home() {
  const { data: apiItems, isLoading } = useListMenuItems();
  const menuItems = (apiItems ?? []) as unknown as MenuItem[];

  const [activeTab, setActiveTab] = useState<Tab>("bestseller");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const { cartCount } = useCart();
  const { greeting, label, sub } = useDailyGreeting();

  const bestSellers = menuItems.filter(m => m.isBestSeller && m.isAvailable);
  const promoItems = menuItems.filter(m => m.isAvailable).slice(0, 6);
  const categories = ["Semua", ...Array.from(new Set(menuItems.map(m => m.category)))];
  const categoryFiltered = menuItems.filter(m =>
    m.isAvailable && (selectedCategory === "Semua" || m.category === selectedCategory) &&
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 py-2.5 flex justify-between items-center shadow-sm flex-shrink-0">
        <div>
          <h1 className="font-serif text-xl font-bold text-primary leading-tight">D'Foria</h1>
          <SmallClock />
        </div>
        <Link href="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors">
          <ShoppingBag size={22} />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 bg-accent text-accent-foreground text-[10px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full border-2 border-background">
              {cartCount}
            </span>
          )}
        </Link>
      </header>

      {/* Hero + Marquee — fixed height */}
      <div className="flex-shrink-0">
        <HeroBanner compact />
        <Marquee />
      </div>

      {/* Daily Personalized Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex-shrink-0 mx-3 my-2 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border border-primary/15 px-4 py-3 flex items-start gap-3"
      >
        <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
          <Sparkles size={14} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">{greeting}</p>
          <p className="text-xs font-semibold text-foreground leading-snug">{label}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
        </div>
      </motion.div>

      {/* Tab Bar */}
      <div className="flex-shrink-0 bg-background border-b border-border px-2 pt-2">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg text-xs font-semibold border-b-2 transition-all duration-200 ${
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content — scrollable only within this area */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="p-4"><SkeletonGrid count={4} /></div>
          ) : activeTab === "bestseller" ? (
            <motion.div key="bestseller" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="p-4 space-y-3">
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-serif text-lg font-bold text-foreground">Best Sellers</h2>
                <Link href="/menu" className="text-xs text-primary font-medium hover:underline">Lihat Semua →</Link>
              </div>
              {bestSellers.length === 0 ? (
                <EmptyState text="Belum ada menu best seller" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {bestSellers.map((item, idx) => (
                    <MenuCard key={item.id} item={item} index={idx} />
                  ))}
                </div>
              )}
            </motion.div>

          ) : activeTab === "promo" ? (
            <motion.div key="promo" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="p-4 space-y-3">
              <h2 className="font-serif text-lg font-bold text-foreground mb-1">Promo Hari Ini</h2>
              {promoItems.length === 0 ? (
                <EmptyState text="Belum ada promo" />
              ) : (
                <div className="space-y-3">
                  {promoItems.map((item, idx) => (
                    <Link key={item.id} href={`/menu/${item.id}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06, duration: 0.4 }}
                        className="flex gap-3 bg-card border border-border rounded-2xl p-3 hover:shadow-md active:scale-[0.98] transition-all duration-200 group"
                      >
                        <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.category}</span>
                            <p className="font-serif font-semibold text-sm text-foreground mt-1 truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{item.description}</p>
                          </div>
                          <p className="font-bold text-accent text-sm">
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.price)}
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>

          ) : activeTab === "kategori" ? (
            <motion.div key="kategori" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="p-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                <input
                  type="text"
                  placeholder="Cari menu..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              {/* Category chips */}
              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {/* Menu grid */}
              {categoryFiltered.length === 0 ? (
                <EmptyState text="Tidak ada menu ditemukan" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {categoryFiltered.map((item, idx) => (
                    <MenuCard key={item.id} item={item} index={idx} />
                  ))}
                </div>
              )}
            </motion.div>

          ) : (
            <motion.div key="testimoni" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="p-4 space-y-3">
              <h2 className="font-serif text-lg font-bold text-foreground mb-1">Kata Mereka</h2>
              <div className="space-y-3">
                {TESTIMONIALS.map((t, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.4 }}
                    className="bg-card border border-border rounded-2xl p-4 space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #7A263A, #D6B16F)" }}
                      >
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{t.name}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`text-[12px] ${i < t.rating ? "text-accent" : "text-muted-foreground/30"}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <span className="ml-auto text-[10px] text-accent font-medium tracking-wide">D'Foria</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
