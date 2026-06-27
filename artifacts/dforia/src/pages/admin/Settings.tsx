import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Save, Image as ImageIcon, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Settings() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!localStorage.getItem("dforia_admin_logged_in")) setLocation("/admin/login");
  }, [setLocation]);

  const { data: settings, isLoading } = useGetSettings();
  const updateMutation = useUpdateSettings();

  const [form, setForm] = useState({
    storeName: "", whatsappNumber: "", bankName: "", accountNumber: "",
    logoUrl: "", bannerUrl: "", address: "", openTime: "08:00", closeTime: "22:00",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        storeName: settings.storeName,
        whatsappNumber: settings.whatsappNumber,
        bankName: settings.bankName,
        accountNumber: settings.accountNumber,
        logoUrl: settings.logoUrl ?? "",
        bannerUrl: settings.bannerUrl ?? "",
        address: settings.address ?? "",
        openTime: settings.openTime ?? "08:00",
        closeTime: settings.closeTime ?? "22:00",
      });
      setCredForm(f => ({ ...f, newUsername: settings.adminUsername ?? "dforia_admin" }));
    }
  }, [settings]);

  const [credForm, setCredForm] = useState({
    currentPassword: "", newUsername: "", newPassword: "", confirmPassword: "",
  });
  const [credLoading, setCredLoading] = useState(false);
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({ data: form });
      queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      toast.success("Pengaturan berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan pengaturan");
    }
  };

  const handleCredSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (credForm.newPassword && credForm.newPassword !== credForm.confirmPassword) {
      toast.error("Password baru tidak cocok");
      return;
    }
    if (!credForm.newUsername.trim()) {
      toast.error("Username tidak boleh kosong");
      return;
    }
    setCredLoading(true);
    try {
      const res = await fetch("/api/auth/update-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: credForm.currentPassword,
          newUsername: credForm.newUsername.trim(),
          newPassword: credForm.newPassword || undefined,
        }),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        setCredForm({ currentPassword: "", newUsername: credForm.newUsername, newPassword: "", confirmPassword: "" });
        toast.success("Akun berhasil diperbarui");
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal memperbarui akun");
      }
    } catch {
      toast.error("Gagal menghubungi server");
    } finally {
      setCredLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "bannerUrl") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(f => ({ ...f, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground p-8">Memuat pengaturan...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="font-serif text-3xl font-bold text-foreground">Pengaturan Toko</h1>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Info Umum */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
          <h2 className="font-serif text-xl font-bold border-b border-border pb-2">Info Umum</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Toko</label>
              <input type="text" value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })}
                className="w-full p-2.5 border border-border rounded-lg bg-background focus:border-primary outline-none" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor WhatsApp</label>
              <input type="text" value={form.whatsappNumber} onChange={e => setForm({ ...form, whatsappNumber: e.target.value })}
                className="w-full p-2.5 border border-border rounded-lg bg-background focus:border-primary outline-none" required />
              <p className="text-xs text-muted-foreground">Gunakan 62 di awal tanpa +, contoh: 628123456789</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Alamat Toko</label>
              <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full p-2.5 border border-border rounded-lg bg-background focus:border-primary outline-none resize-none" rows={3} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium block">Jam Operasional</label>
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-[200px]">
                  <label className="text-xs text-muted-foreground mb-1 block">Buka</label>
                  <input type="time" value={form.openTime} onChange={e => setForm({ ...form, openTime: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-lg bg-background focus:border-primary outline-none" required />
                </div>
                <span className="text-muted-foreground font-medium mt-5">-</span>
                <div className="flex-1 max-w-[200px]">
                  <label className="text-xs text-muted-foreground mb-1 block">Tutup</label>
                  <input type="time" value={form.closeTime} onChange={e => setForm({ ...form, closeTime: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-lg bg-background focus:border-primary outline-none" required />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Media & Visual */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
          <h2 className="font-serif text-xl font-bold border-b border-border pb-2">Media & Visual</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-sm font-medium">Logo Toko</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
                  {form.logoUrl
                    ? <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    : <ImageIcon size={24} className="text-muted-foreground opacity-50" />}
                </div>
                <div className="space-y-2 flex-1">
                  <label className="cursor-pointer inline-flex bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors">
                    Upload Logo
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, "logoUrl")} className="hidden" />
                  </label>
                  {form.logoUrl && <button type="button" onClick={() => setForm({ ...form, logoUrl: "" })} className="block text-xs text-destructive hover:underline">Hapus Logo</button>}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-medium">Banner Utama (Header)</label>
              <div className="space-y-3">
                <div className="w-full h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
                  {form.bannerUrl
                    ? <img src={form.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    : <ImageIcon size={24} className="text-muted-foreground opacity-50" />}
                </div>
                <div className="flex justify-between items-center">
                  <label className="cursor-pointer inline-flex bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors">
                    Upload Banner
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, "bannerUrl")} className="hidden" />
                  </label>
                  {form.bannerUrl && <button type="button" onClick={() => setForm({ ...form, bannerUrl: "" })} className="text-xs text-destructive hover:underline">Hapus Banner</button>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Rekening Bank */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
          <h2 className="font-serif text-xl font-bold border-b border-border pb-2">Info Rekening Bank</h2>
          <p className="text-sm text-muted-foreground">Informasi ini akan ditampilkan kepada pelanggan yang memilih metode pembayaran Transfer Bank.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Bank / E-Wallet</label>
              <input type="text" value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })}
                className="w-full p-2.5 border border-border rounded-lg bg-background focus:border-primary outline-none" placeholder="BCA / Mandiri / GoPay" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor Rekening / HP</label>
              <input type="text" value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                className="w-full p-2.5 border border-border rounded-lg bg-background focus:border-primary outline-none" required />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 pb-4">
          <button type="submit" disabled={updateMutation.isPending}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md disabled:opacity-60">
            <Save size={20} />
            {updateMutation.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>

      {/* Keamanan Akun */}
      <form onSubmit={handleCredSubmit} className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-5 mb-10">
        <h2 className="font-serif text-xl font-bold border-b border-border pb-2 flex items-center gap-2">
          <ShieldCheck size={20} className="text-primary" />
          Keamanan Akun
        </h2>
        <p className="text-sm text-muted-foreground">Ganti username dan password untuk login ke panel admin. Berlaku di semua perangkat.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Password Saat Ini <span className="text-destructive">*</span></label>
            <div className="relative">
              <input type={showPwd.current ? "text" : "password"} value={credForm.currentPassword}
                onChange={e => setCredForm({ ...credForm, currentPassword: e.target.value })}
                placeholder="Masukkan password saat ini" required
                className="w-full p-2.5 pr-10 border border-border rounded-lg bg-background focus:border-primary outline-none" />
              <button type="button" onClick={() => setShowPwd(s => ({ ...s, current: !s.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPwd.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Username Baru</label>
            <input type="text" value={credForm.newUsername} onChange={e => setCredForm({ ...credForm, newUsername: e.target.value })}
              placeholder="Username baru" className="w-full p-2.5 border border-border rounded-lg bg-background focus:border-primary outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password Baru <span className="text-xs text-muted-foreground">(kosongkan jika tidak diubah)</span></label>
            <div className="relative">
              <input type={showPwd.new ? "text" : "password"} value={credForm.newPassword}
                onChange={e => setCredForm({ ...credForm, newPassword: e.target.value })}
                placeholder="Password baru"
                className="w-full p-2.5 pr-10 border border-border rounded-lg bg-background focus:border-primary outline-none" />
              <button type="button" onClick={() => setShowPwd(s => ({ ...s, new: !s.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPwd.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {credForm.newPassword && (
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Konfirmasi Password Baru</label>
              <div className="relative">
                <input type={showPwd.confirm ? "text" : "password"} value={credForm.confirmPassword}
                  onChange={e => setCredForm({ ...credForm, confirmPassword: e.target.value })}
                  placeholder="Ulangi password baru"
                  className="w-full p-2.5 pr-10 border border-border rounded-lg bg-background focus:border-primary outline-none" />
                <button type="button" onClick={() => setShowPwd(s => ({ ...s, confirm: !s.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={credLoading}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md text-sm disabled:opacity-60">
            <ShieldCheck size={17} />
            {credLoading ? "Menyimpan..." : "Simpan Akun"}
          </button>
        </div>
      </form>
    </div>
  );
}
