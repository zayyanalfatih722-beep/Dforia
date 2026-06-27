import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { formatCurrency } from "../../lib/utils";
import { toast } from "sonner";
import { Plus, Trash2, Tag, ToggleLeft, ToggleRight } from "lucide-react";

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  isActive: boolean;
}

const EMPTY_FORM: { code: string; type: "percent" | "fixed"; value: string; minOrder: string; isActive: boolean } = { code: "", type: "percent", value: "", minOrder: "", isActive: true };

export default function KuponManage() {
  const [, setLocation] = useLocation();
  const [coupons, setCoupons] = useLocalStorage<Coupon[]>("dforia_coupons", []);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!localStorage.getItem("dforia_admin_logged_in")) setLocation("/admin/login");
  }, [setLocation]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { toast.error("Kode kupon tidak boleh kosong"); return; }
    if (!form.value || Number(form.value) <= 0) { toast.error("Nilai diskon harus lebih dari 0"); return; }
    if (form.type === "percent" && Number(form.value) > 100) { toast.error("Diskon persen maksimal 100%"); return; }
    const exists = coupons.find(c => c.code.toLowerCase() === form.code.trim().toLowerCase());
    if (exists) { toast.error("Kode kupon sudah ada"); return; }

    const newCoupon: Coupon = {
      id: `CPN-${Date.now()}`,
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder) || 0,
      isActive: form.isActive,
    };
    setCoupons([...coupons, newCoupon]);
    setForm(EMPTY_FORM);
    toast.success(`Kupon ${newCoupon.code} berhasil ditambahkan`);
  };

  const handleToggle = (id: string) => {
    setCoupons(coupons.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const handleDelete = (id: string, code: string) => {
    if (!confirm(`Hapus kupon ${code}?`)) return;
    setCoupons(coupons.filter(c => c.id !== id));
    toast.success("Kupon dihapus");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-serif text-3xl font-bold text-foreground">Kelola Kupon</h1>

      {/* Form Tambah */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <h2 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
          <Plus size={18} className="text-primary" /> Tambah Kupon Baru
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Kode Kupon <span className="text-destructive">*</span></label>
            <input
              type="text"
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="HEMAT10"
              className="w-full p-2.5 border border-border rounded-lg bg-background focus:border-primary outline-none text-sm font-mono uppercase"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Tipe Diskon <span className="text-destructive">*</span></label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value as "percent" | "fixed" })}
              className="w-full p-2.5 border border-border rounded-lg bg-background focus:border-primary outline-none text-sm"
            >
              <option value="percent">Persen (%)</option>
              <option value="fixed">Nominal (Rp)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Nilai Diskon <span className="text-destructive">*</span>
              <span className="text-muted-foreground text-xs ml-1">({form.type === "percent" ? "%" : "Rp"})</span>
            </label>
            <input
              type="number"
              value={form.value}
              onChange={e => setForm({ ...form, value: e.target.value })}
              placeholder={form.type === "percent" ? "10" : "5000"}
              min="1"
              max={form.type === "percent" ? "100" : undefined}
              className="w-full p-2.5 border border-border rounded-lg bg-background focus:border-primary outline-none text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Minimal Order <span className="text-muted-foreground text-xs">(Rp, 0 = tidak ada min)</span>
            </label>
            <input
              type="number"
              value={form.minOrder}
              onChange={e => setForm({ ...form, minOrder: e.target.value })}
              placeholder="0"
              min="0"
              className="w-full p-2.5 border border-border rounded-lg bg-background focus:border-primary outline-none text-sm"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm font-medium">Kupon aktif langsung</span>
            </label>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus size={16} /> Tambah Kupon
            </button>
          </div>
        </form>
      </div>

      {/* Daftar Kupon */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <Tag size={18} className="text-primary" />
          <h2 className="font-serif text-lg font-bold">Daftar Kupon ({coupons.length})</h2>
        </div>

        {coupons.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Tag size={36} className="mx-auto mb-3 opacity-25" />
            <p className="text-sm">Belum ada kupon. Tambahkan di atas.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {coupons.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-primary text-base tracking-wider">{c.code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {c.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>
                      Diskon: <strong className="text-foreground">{c.type === "percent" ? `${c.value}%` : formatCurrency(c.value)}</strong>
                    </span>
                    <span>
                      Min. order: <strong className="text-foreground">{c.minOrder > 0 ? formatCurrency(c.minOrder) : "Tidak ada"}</strong>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(c.id)}
                    title={c.isActive ? "Nonaktifkan" : "Aktifkan"}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {c.isActive ? <ToggleRight size={28} className="text-primary" /> : <ToggleLeft size={28} />}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.code)}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
