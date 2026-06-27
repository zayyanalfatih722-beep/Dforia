import React, { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { User, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useLocalStorage("dforia_customer_profile", { name: "", phone: "" });
  const [name, setName] = useState(profile.name || "");
  const [phone, setPhone] = useState(profile.phone || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ name, phone });
    toast.success("Profil berhasil diperbarui");
  };

  return (
    <div className="w-full min-h-screen bg-muted/20 pb-8">
      <header className="bg-background px-4 py-4 border-b border-border shadow-sm sticky top-0 z-30">
        <h1 className="font-serif text-xl font-bold text-center">Profil Saya</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center mt-4 mb-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 border border-primary/20">
            <User size={40} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            {profile.name || "Tamu"}
          </h2>
          <p className="text-muted-foreground">{profile.phone || "Belum ada nomor WA"}</p>
        </div>

        {/* Tombol Admin Panel */}
        <button
          onClick={() => setLocation("/admin/login")}
          className="w-full flex items-center justify-between bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors rounded-2xl px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <ShieldCheck size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-primary">Panel Admin</p>
              <p className="text-xs text-muted-foreground">Kelola toko, kasir & keuangan</p>
            </div>
          </div>
          <span className="text-primary text-lg font-bold">→</span>
        </button>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <h3 className="font-serif text-lg font-bold mb-4">Edit Profil</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama Anda"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">
                Nomor WhatsApp
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Misal: 08123456789"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Save size={18} />
              Simpan Profil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
