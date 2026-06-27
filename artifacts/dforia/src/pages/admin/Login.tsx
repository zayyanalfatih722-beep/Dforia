import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";
import { UtensilsCrossed, ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        localStorage.setItem("dforia_admin_logged_in", "true");
        setLocation("/admin");
        toast.success("Berhasil masuk");
      } else {
        toast.error("Username atau password salah");
      }
    } catch {
      toast.error("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border border-border">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4">
            <UtensilsCrossed size={32} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-primary">D'Foria Admin</h1>
          <p className="text-muted-foreground mt-2">Masuk ke panel kontrol</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all mt-4 disabled:opacity-60"
          >
            {loading ? "Memeriksa..." : "Masuk"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-border text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={15} />
            Kembali ke Toko Pelanggan
          </Link>
        </div>
      </div>
    </div>
  );
}
