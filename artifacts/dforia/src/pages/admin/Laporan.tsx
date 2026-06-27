import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useListOrders, useListMenuItems } from "@workspace/api-client-react";
import { formatCurrency } from "../../lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  format, isToday, isThisWeek, isThisMonth,
  eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { TrendingUp, ShoppingBag, Star, Package } from "lucide-react";

type Period = "Harian" | "Mingguan" | "Bulanan";

const COLORS = ["#7A263A", "#D6B16F", "#5a8a6a", "#4a7ab5", "#c05a2a", "#7a5ab5"];

function inPeriod(date: Date, period: Period) {
  if (period === "Harian") return isToday(date);
  if (period === "Mingguan") return isThisWeek(date, { weekStartsOn: 1 });
  return isThisMonth(date);
}

function getDateRange(period: Period): Date[] {
  const today = new Date();
  if (period === "Harian") {
    return Array.from({ length: 24 }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate(), i));
  }
  if (period === "Mingguan") {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: endOfWeek(today, { weekStartsOn: 1 }) });
  }
  const start = startOfMonth(today);
  return eachDayOfInterval({ start, end: endOfMonth(today) });
}

export default function Laporan() {
  const [, setLocation] = useLocation();
  const [period, setPeriod] = useState<Period>("Bulanan");

  useEffect(() => {
    if (!localStorage.getItem("dforia_admin_logged_in")) setLocation("/admin/login");
  }, [setLocation]);

  const { data: orders = [] } = useListOrders();
  const { data: menuItems = [] } = useListMenuItems();

  const filteredOrders = useMemo(() =>
    orders.filter(o => o.status === "Selesai" && inPeriod(new Date(o.createdAt), period)),
    [orders, period]
  );

  const allPeriodOrders = useMemo(() =>
    orders.filter(o => inPeriod(new Date(o.createdAt), period)),
    [orders, period]
  );

  const totalPemasukan = filteredOrders.reduce((s, o) => s + o.totalPrice, 0);
  const avgOrderValue = filteredOrders.length > 0 ? totalPemasukan / filteredOrders.length : 0;

  const chartData = useMemo(() => {
    const range = getDateRange(period);

    if (period === "Harian") {
      return range.map(hour => {
        const h = hour.getHours();
        const label = `${String(h).padStart(2, "0")}:00`;
        const dayOrders = filteredOrders.filter(o => new Date(o.createdAt).getHours() === h);
        return {
          label,
          Penjualan: dayOrders.reduce((s, o) => s + o.totalPrice, 0),
          Pesanan: dayOrders.length,
        };
      });
    }

    return range.map(day => {
      const dayOrders = filteredOrders.filter(o => new Date(o.createdAt).toDateString() === day.toDateString());
      return {
        label: format(day, period === "Mingguan" ? "EEE" : "d", { locale: idLocale }),
        Penjualan: dayOrders.reduce((s, o) => s + o.totalPrice, 0),
        Pesanan: dayOrders.length,
      };
    });
  }, [filteredOrders, period]);

  const topItems = useMemo(() => {
    const countMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredOrders.forEach(o => {
      (o.items as unknown as any[])?.forEach((item: any) => {
        const id = item.menuItem?.id ?? item.id ?? "unknown";
        const name = item.menuItem?.name ?? item.name ?? "Unknown";
        const price = item.menuItem?.price ?? item.price ?? 0;
        if (!countMap[id]) countMap[id] = { name, qty: 0, revenue: 0 };
        countMap[id].qty += item.quantity;
        countMap[id].revenue += price * item.quantity;
      });
    });
    return Object.values(countMap).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [filteredOrders]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = { };
    allPeriodOrders.forEach(o => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allPeriodOrders]);

  const totalItems = filteredOrders.reduce((s, o) =>
    s + ((o.items as unknown as any[])?.reduce((q: number, i: any) => q + i.quantity, 0) ?? 0), 0);

  const PERIODS: Period[] = ["Harian", "Mingguan", "Bulanan"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-serif text-3xl font-bold text-foreground">Laporan</h1>
        <div className="flex bg-card border border-border rounded-lg p-1 gap-0.5">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Penjualan", value: formatCurrency(totalPemasukan), icon: TrendingUp, color: "green", sub: "periode ini" },
          { label: "Jumlah Pesanan", value: filteredOrders.length.toString(), icon: ShoppingBag, color: "blue", sub: "pesanan selesai" },
          { label: "Rata-rata Order", value: formatCurrency(avgOrderValue), icon: Star, color: "amber", sub: "per pesanan" },
          { label: "Menu Terjual", value: totalItems.toString(), icon: Package, color: "purple", sub: "item" },
        ].map((card, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className={`inline-flex p-2 rounded-lg mb-2 ${
              card.color === "green" ? "bg-green-100 text-green-700" :
              card.color === "blue" ? "bg-blue-100 text-blue-700" :
              card.color === "amber" ? "bg-amber-100 text-amber-700" :
              "bg-purple-100 text-purple-700"
            }`}>
              <card.icon size={18} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-serif text-xl font-bold mb-1">Grafik Penjualan</h2>
        <p className="text-sm text-muted-foreground mb-5">
          {period === "Harian" ? "Per jam hari ini" : period === "Mingguan" ? "Per hari minggu ini" : "Per hari bulan ini"}
        </p>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v === 0 ? "0" : `${v / 1000}k`} />
              <RechartsTooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Bar dataKey="Penjualan" fill="#7A263A" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold mb-4">Menu Terlaris</h2>
          {topItems.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">Belum ada data penjualan</div>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, idx) => {
                const maxQty = topItems[0].qty;
                const pct = maxQty > 0 ? (item.qty / maxQty) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground truncate pr-4">{item.name}</span>
                      <span className="flex-shrink-0 text-muted-foreground">{item.qty} terjual</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: "linear-gradient(90deg, #7A263A, #D6B16F)" }}
                      />
                    </div>
                    <p className="text-xs text-right text-accent font-semibold">{formatCurrency(item.revenue)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold mb-4">Status Pesanan</h2>
          {statusData.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">Belum ada pesanan di periode ini</div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {statusData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-muted-foreground">{d.name}</span>
                    <span className="text-xs font-bold text-foreground ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="font-serif text-xl font-bold">Riwayat Pesanan Selesai</h2>
          <p className="text-sm text-muted-foreground">{filteredOrders.length} pesanan — {period.toLowerCase()}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
              <tr>
                <th className="px-5 py-3 font-medium">ID & Waktu</th>
                <th className="px-5 py-3 font-medium">Pelanggan</th>
                <th className="px-5 py-3 font-medium">Item</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">Belum ada pesanan selesai di periode ini</td></tr>
              ) : filteredOrders.slice(0, 20).map(o => (
                <tr key={o.id} className="border-b border-border hover:bg-muted/20">
                  <td className="px-5 py-3">
                    <p className="font-mono text-xs font-medium">{o.id}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(o.createdAt), "d MMM yyyy, HH:mm", { locale: idLocale })}</p>
                  </td>
                  <td className="px-5 py-3 font-medium">{o.customerName}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {(o.items as unknown as any[])?.slice(0, 2).map((item: any) => item.menuItem?.name ?? item.name).join(", ")}
                    {((o.items as unknown as any[])?.length ?? 0) > 2 && ` +${(o.items as unknown as any[]).length - 2} lainnya`}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-primary">{formatCurrency(o.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
