import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  UtensilsCrossed, LayoutDashboard, Image as ImageIcon,
  ClipboardList, Settings, LogOut, Wallet, BarChart3, CreditCard, Store, Bell, Tag
} from "lucide-react";
import { useNewOrderNotification } from "../hooks/useNewOrderNotification";
import { toast } from "sonner";

function useWaitingOrderCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("dforia_orders");
        if (!raw) return setCount(0);
        const orders: any[] = JSON.parse(raw);
        setCount(orders.filter(o => o.status === "Menunggu").length);
      } catch { setCount(0); }
    };

    read();
    const id = setInterval(read, 3000);
    return () => clearInterval(id);
  }, []);

  return count;
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const waitingCount = useWaitingOrderCount();
  const [prevCount, setPrevCount] = useState<number | null>(null);

  useNewOrderNotification(true);

  useEffect(() => {
    if (prevCount === null) {
      setPrevCount(waitingCount);
      return;
    }
    if (waitingCount > prevCount) {
      const diff = waitingCount - prevCount;
      toast.success(`🛎️ ${diff} pesanan baru masuk!`, {
        description: "Segera periksa halaman Pesanan.",
        duration: 5000,
      });
    }
    setPrevCount(waitingCount);
  }, [waitingCount]);

  const handleLogout = () => {
    localStorage.removeItem("dforia_admin_logged_in");
    window.location.href = "/admin/login";
  };

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/menu", icon: UtensilsCrossed, label: "Kelola Menu" },
    { href: "/admin/banners", icon: ImageIcon, label: "Kelola Banner" },
    { href: "/admin/orders", icon: ClipboardList, label: "Pesanan", badge: waitingCount },
    { href: "/admin/kasir", icon: CreditCard, label: "Kasir" },
    { href: "/admin/keuangan", icon: Wallet, label: "Keuangan" },
    { href: "/admin/laporan", icon: BarChart3, label: "Laporan" },
    { href: "/admin/kupon", icon: Tag, label: "Kupon" },
    { href: "/admin/settings", icon: Settings, label: "Pengaturan" },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? location === "/admin" : location.startsWith(href);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row print:block">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-60 flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0 print:hidden">
        <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
          <div>
            <p className="font-serif text-xs text-sidebar-foreground/60 tracking-widest uppercase mb-0.5">Admin Panel</p>
            <h1 className="font-serif text-xl font-bold text-sidebar-primary">D'Foria Kitchen</h1>
          </div>
          {waitingCount > 0 && (
            <div className="relative">
              <Bell size={18} className="text-primary animate-pulse" />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {waitingCount > 9 ? "9+" : waitingCount}
              </span>
            </div>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                isActive(item.href)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon size={17} />
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <Store size={17} />
            Lihat Toko
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={17} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Header Mobile */}
      <header className="md:hidden bg-sidebar border-b border-sidebar-border sticky top-0 z-50 print:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-serif text-lg font-bold text-sidebar-primary">D'Foria Admin</h1>
          <div className="flex items-center gap-1">
            {waitingCount > 0 && (
              <div className="relative mr-1">
                <Bell size={18} className="text-primary animate-pulse" />
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {waitingCount > 9 ? "9+" : waitingCount}
                </span>
              </div>
            )}
            <Link
              href="/"
              className="p-2 text-sidebar-foreground rounded-lg hover:bg-sidebar-accent transition-colors flex items-center gap-1.5 text-xs font-medium pr-3"
            >
              <Store size={16} />
              Toko
            </Link>
            <button onClick={handleLogout} className="p-2 text-destructive rounded-lg hover:bg-destructive/10 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <nav className="flex overflow-x-auto px-3 pb-2 gap-1.5 hide-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors relative ${
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground bg-secondary/60 hover:bg-secondary"
              }`}
            >
              <item.icon size={13} />
              {item.label}
              {item.badge != null && item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] px-0.5 rounded-full flex items-center justify-center">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full max-w-[1200px] mx-auto print:p-0 print:max-w-none">
        {children}
      </main>
    </div>
  );
}
