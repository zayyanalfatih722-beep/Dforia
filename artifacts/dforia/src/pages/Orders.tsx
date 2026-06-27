import React, { useRef } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { formatCurrency } from "../lib/utils";
import { ClipboardList, Clock, CheckCircle2, Truck, PackageOpen, Upload, ImageIcon, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

export default function Orders() {
  const [orders, setOrders] = useLocalStorage<any[]>("dforia_orders", []);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Menunggu": return { color: "text-amber-600 bg-amber-100", icon: Clock, label: "Menunggu Konfirmasi" };
      case "Diproses": return { color: "text-blue-600 bg-blue-100", icon: PackageOpen, label: "Sedang Diproses" };
      case "Dikirim": return { color: "text-purple-600 bg-purple-100", icon: Truck, label: "Dalam Pengiriman" };
      case "Selesai": return { color: "text-green-600 bg-green-100", icon: CheckCircle2, label: "Selesai" };
      default: return { color: "text-gray-600 bg-gray-100", icon: Clock, label: status };
    }
  };

  const handleUploadBukti = (orderId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, buktiTransfer: reader.result as string } : o
      ));
      toast.success("Bukti transfer berhasil diunggah!");
    };
    reader.readAsDataURL(file);
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-primary/50 mb-6">
          <ClipboardList size={48} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Belum Ada Pesanan</h2>
        <p className="text-muted-foreground">Anda belum pernah memesan sebelumnya.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-muted/20 pb-8">
      <header className="bg-background px-4 py-4 border-b border-border shadow-sm sticky top-0 z-30">
        <h1 className="font-serif text-xl font-bold text-center">Riwayat Pesanan</h1>
      </header>

      <div className="p-4 space-y-4">
        {orders.map((order) => {
          const status = getStatusConfig(order.status);
          const StatusIcon = status.icon;
          const isTransfer = order.paymentMethod === "Transfer";
          const sudahUpload = !!order.buktiTransfer;

          return (
            <div key={order.id} className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">{order.id}</p>
                  <p className="text-sm font-medium mt-0.5">
                    {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm", { locale: id })}
                  </p>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                  <StatusIcon size={12} />
                  {status.label}
                </div>
              </div>

              <div className="space-y-2">
                {order.items.slice(0, 2).map((item: any) => (
                  <div key={item.menuItem.id} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.quantity}x {item.menuItem.name}</span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-xs text-muted-foreground italic">+ {order.items.length - 2} item lainnya</p>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Metode Bayar</p>
                  <p className="text-sm font-medium">{order.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-bold text-primary">{formatCurrency(order.totalPrice)}</p>
                </div>
              </div>

              {/* Upload Bukti Transfer */}
              {isTransfer && (
                <div className="pt-2 border-t border-border space-y-3">
                  {sudahUpload ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                        <CheckCircle size={16} />
                        Bukti transfer sudah dikirim
                      </div>
                      <div className="relative rounded-xl overflow-hidden border border-border">
                        <img
                          src={order.buktiTransfer}
                          alt="Bukti Transfer"
                          className="w-full max-h-48 object-cover"
                        />
                        <button
                          onClick={() => fileRefs.current[order.id]?.click()}
                          className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg"
                        >
                          Ganti
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRefs.current[order.id]?.click()}
                      className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary rounded-xl py-3 text-sm font-semibold transition-all"
                    >
                      <Upload size={16} />
                      Upload Bukti Transfer
                    </button>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={el => { fileRefs.current[order.id] = el; }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadBukti(order.id, file);
                    }}
                  />
                  {!sudahUpload && (
                    <p className="text-xs text-muted-foreground text-center">
                      Upload foto bukti transfer agar pesanan segera diproses
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
