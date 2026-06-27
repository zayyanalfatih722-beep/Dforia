import React from "react";
import { useLocation } from "wouter";
import { useListOrders, useListMenuItems } from "@workspace/api-client-react";
import { formatCurrency } from "../../lib/utils";
import {
  UtensilsCrossed, ClipboardList, Wallet, TrendingUp,
  CreditCard, ArrowRight, Image as ImageIcon, BarChart3, Settings, Tag
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!localStorage.getItem("dforia_admin_logged_in")) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const { data: orders = [] } = useListOrders();
  const { data: menuItems = [] } = useListMenuItems();

  const totalRevenue = orders
    .filter(o => o.status === "Selesai")
    .reduce((sum, order) => sum + order.totalPrice, 0);

  const pendingOrders = orders.filter(o => o.status === "Menunggu");

  const statCards = [
    { title: "Total Pendapatan", value: formatCurrency(totalRevenue), icon: Wallet, color: "text-green-600", bg: "bg-green-100" },
    { title: "Pesanan Baru", value: pendingOrders.length.toString(), icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Total Menu", value: menuItems.length.toString(), icon: UtensilsCrossed, color: "text-amber-600", bg: "bg-amber-100" },
    { title: "Total Pesanan", value: orders.length.toString(), icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  const menuShortcuts = [
    { href: "/admin/kasir", icon: CreditCard, label: "Kasir", desc: "Input & proses pembayaran", color: "text-primary", bg: "bg-primary/10" },
    { href: "/admin/orders", icon: ClipboardList, label: "Pesanan", desc: "Kelola order masuk", color: "text-blue-600", bg: "bg-blue-100", badge: pendingOrders.length },
    { href: "/admin/menu", icon: UtensilsCrossed, label: "Kelola Menu", desc: "Tambah & edit menu", color: "text-amber-600", bg: "bg-amber-100" },
    { href: "/admin/keuangan", icon: Wallet, label: "Keuangan", desc: "Pemasukan & pengeluaran", color: "text-green-600", bg: "bg-green-100" },
    { href: "/admin/laporan", icon: BarChart3, label: "Laporan", desc: "Grafik & analitik penjualan", color: "text-purple-600", bg: "bg-purple-100" },
    { href: "/admin/banners", icon: ImageIcon, label: "Banner", desc: "Kelola banner promo", color: "text-rose-600", bg: "bg-rose-100" },
    { href: "/admin/kupon", icon: Tag, label: "Kupon", desc: "Buat & kelola kode diskon", color: "text-orange-600", bg: "bg-orange-100" },
    { href: "/admin/settings", icon: Settings, label: "Pengaturan", desc: "Nama toko & kontak", color: "text-slate-600", bg: "bg-slate-100" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>

      <button
        onClick={() => setLocation("/admin/kasir")}
        className="w-full flex items-center justify-between bg-primary text-primary-foreground rounded-2xl px-6 py-5 shadow-md hover:bg-primary/90 active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <CreditCard size={24} />
          </div>
          <div className="text-left">
            <p className="text-lg font-bold">Buka Kasir</p>
            <p className="text-sm text-primary-foreground/75">Input pesanan & proses pembayaran</p>
          </div>
        </div>
        <ArrowRight size={22} className="opacity-80" />
      </button>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon size={21} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">{stat.title}</p>
              <h3 className="text-xl font-bold text-foreground truncate">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-serif text-lg font-bold text-foreground mb-3">Menu Admin</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {menuShortcuts.map((item) => (
            <button
              key={item.href}
              onClick={() => setLocation(item.href)}
              className="relative bg-card border border-border rounded-2xl p-4 text-left hover:shadow-md hover:border-primary/30 active:scale-[0.98] transition-all group"
            >
              {item.badge != null && item.badge > 0 && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.bg} ${item.color}`}>
                <item.icon size={19} />
              </div>
              <p className="text-sm font-bold text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h2 className="font-serif text-lg font-bold text-foreground">Pesanan Terbaru</h2>
          <button
            onClick={() => setLocation("/admin/orders")}
            className="text-xs text-primary font-semibold hover:underline"
          >
            Lihat Semua →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Pelanggan</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Tanggal</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="bg-card border-b border-border hover:bg-muted/20">
                  <td className="px-5 py-3 font-mono text-xs font-medium">{order.id}</td>
                  <td className="px-5 py-3">{order.customerName}</td>
                  <td className="px-5 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                    {format(new Date(order.createdAt), "d MMM yyyy", { locale: id })}
                  </td>
                  <td className="px-5 py-3 font-semibold text-primary">{formatCurrency(order.totalPrice)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      order.status === "Menunggu" ? "bg-amber-100 text-amber-700" :
                      order.status === "Diproses" ? "bg-blue-100 text-blue-700" :
                      order.status === "Dikirim" ? "bg-purple-100 text-purple-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    Belum ada pesanan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
