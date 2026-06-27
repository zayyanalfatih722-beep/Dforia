import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useListOrders } from "@workspace/api-client-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { formatCurrency } from "../../lib/utils";
import { format, isToday, isThisWeek, isThisMonth, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { Trash2, TrendingUp, TrendingDown, Wallet, PackageCheck, Plus } from "lucide-react";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const EXPENSE_CATEGORIES = ["Bahan Baku", "Operasional", "Gaji", "Lainnya"];

type Period = "Harian" | "Mingguan" | "Bulanan" | "Semua";

function inPeriod(dateObj: Date, period: Period): boolean {
  if (period === "Harian") return isToday(dateObj);
  if (period === "Mingguan") return isThisWeek(dateObj, { weekStartsOn: 1 });
  if (period === "Bulanan") return isThisMonth(dateObj);
  return true;
}

export default function Keuangan() {
  const [, setLocation] = useLocation();
  const [expenses, setExpenses] = useLocalStorage<Expense[]>("dforia_expenses", []);
  const [period, setPeriod] = useState<Period>("Bulanan");
  const [activeTab, setActiveTab] = useState<"pemasukan" | "pengeluaran">("pemasukan");
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: EXPENSE_CATEGORIES[0],
    date: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    if (!localStorage.getItem("dforia_admin_logged_in")) setLocation("/admin/login");
  }, [setLocation]);

  const { data: orders = [] } = useListOrders();

  const filteredOrders = useMemo(() =>
    orders.filter(o => o.status === "Selesai" && inPeriod(new Date(o.createdAt), period)),
    [orders, period]
  );

  const filteredExpenses = useMemo(() =>
    expenses
      .filter(e => inPeriod(parseISO(e.date), period))
      .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, period]
  );

  const totalPemasukan = filteredOrders.reduce((s, o) => s + o.totalPrice, 0);
  const totalPengeluaran = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const saldoKas = totalPemasukan - totalPengeluaran;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) return;
    const newExp: Expense = {
      id: `EXP-${Date.now()}`,
      description: form.description.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
    };
    setExpenses([...expenses, newExp]);
    setForm({ ...form, description: "", amount: "" });
    toast.success("Pengeluaran berhasil dicatat");
  };

  const handleDeleteExpense = (id: string) => {
    if (!confirm("Hapus catatan pengeluaran ini?")) return;
    setExpenses(expenses.filter(e => e.id !== id));
    toast.success("Catatan dihapus");
  };

  const PERIOD_TABS: Period[] = ["Harian", "Mingguan", "Bulanan", "Semua"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-serif text-3xl font-bold text-foreground">Keuangan</h1>
        <div className="flex bg-card border border-border rounded-lg p-1 gap-0.5">
          {PERIOD_TABS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 text-green-700 rounded-lg"><TrendingUp size={18} /></div>
            <p className="text-xs font-medium text-muted-foreground">Pemasukan</p>
          </div>
          <p className="text-xl font-bold text-green-700">{formatCurrency(totalPemasukan)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{filteredOrders.length} pesanan selesai</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-100 text-red-700 rounded-lg"><TrendingDown size={18} /></div>
            <p className="text-xs font-medium text-muted-foreground">Pengeluaran</p>
          </div>
          <p className="text-xl font-bold text-red-700">{formatCurrency(totalPengeluaran)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{filteredExpenses.length} transaksi</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-accent/20 text-accent-foreground rounded-lg"><Wallet size={18} /></div>
            <p className="text-xs font-medium text-muted-foreground">Saldo Kas</p>
          </div>
          <p className={`text-xl font-bold ${saldoKas < 0 ? "text-red-700" : "text-primary"}`}>{formatCurrency(saldoKas)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Pemasukan - Pengeluaran</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><PackageCheck size={18} /></div>
            <p className="text-xs font-medium text-muted-foreground">Order Selesai</p>
          </div>
          <p className="text-xl font-bold text-blue-700">{filteredOrders.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">periode ini</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("pemasukan")}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${activeTab === "pemasukan" ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            Uang Masuk
          </button>
          <button
            onClick={() => setActiveTab("pengeluaran")}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${activeTab === "pengeluaran" ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            Uang Keluar
          </button>
        </div>

        {activeTab === "pemasukan" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                <tr>
                  <th className="px-5 py-3 font-medium">Tanggal & ID</th>
                  <th className="px-5 py-3 font-medium">Pelanggan</th>
                  <th className="px-5 py-3 font-medium">Pembayaran</th>
                  <th className="px-5 py-3 font-medium text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">Belum ada pemasukan di periode ini</td></tr>
                ) : filteredOrders.map(o => (
                  <tr key={o.id} className="border-b border-border hover:bg-muted/20">
                    <td className="px-5 py-3">
                      <p className="font-mono text-xs font-medium">{o.id}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(o.createdAt), "d MMM yyyy HH:mm", { locale: idLocale })}</p>
                    </td>
                    <td className="px-5 py-3 font-medium">{o.customerName}</td>
                    <td className="px-5 py-3">
                      <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">{o.paymentMethod}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-green-600">{formatCurrency(o.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
              {filteredOrders.length > 0 && (
                <tfoot className="bg-muted/30 border-t-2 border-border">
                  <tr>
                    <td colSpan={3} className="px-5 py-3 font-bold text-sm">Total Pemasukan</td>
                    <td className="px-5 py-3 text-right font-bold text-green-700 text-base">{formatCurrency(totalPemasukan)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <div className="bg-muted/30 rounded-xl p-4">
              <h3 className="font-serif text-base font-bold mb-3 flex items-center gap-2">
                <Plus size={16} className="text-primary" />
                Tambah Pengeluaran
              </h3>
              <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Keterangan pengeluaran"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    required
                    className="w-full p-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:border-primary"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Jumlah (Rp)"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  required
                  min="1"
                  className="w-full p-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:border-primary"
                />
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full p-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:border-primary"
                >
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                  className="w-full p-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:border-primary"
                />
                <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Catat Pengeluaran
                  </button>
                </div>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                    <th className="px-4 py-3 font-medium">Keterangan</th>
                    <th className="px-4 py-3 font-medium">Kategori</th>
                    <th className="px-4 py-3 font-medium text-right">Jumlah</th>
                    <th className="px-4 py-3 font-medium text-center">Hapus</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Belum ada pengeluaran di periode ini</td></tr>
                  ) : filteredExpenses.map(exp => (
                    <tr key={exp.id} className="border-b border-border hover:bg-muted/20">
                      <td className="px-4 py-3 whitespace-nowrap text-xs">{format(parseISO(exp.date), "d MMM yyyy", { locale: idLocale })}</td>
                      <td className="px-4 py-3">{exp.description}</td>
                      <td className="px-4 py-3"><span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">{exp.category}</span></td>
                      <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(exp.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDeleteExpense(exp.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {filteredExpenses.length > 0 && (
                  <tfoot className="bg-muted/30 border-t-2 border-border">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 font-bold text-sm">Total Pengeluaran</td>
                      <td className="px-4 py-3 text-right font-bold text-red-700 text-base">{formatCurrency(totalPengeluaran)}</td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
