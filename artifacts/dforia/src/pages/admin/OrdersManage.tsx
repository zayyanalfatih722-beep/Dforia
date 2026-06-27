import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useListOrders, useUpdateOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "../../lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Trash2, AlertTriangle, ImageIcon, CheckCircle, RefreshCw } from "lucide-react";

export default function OrdersManage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (!localStorage.getItem("dforia_admin_logged_in")) setLocation("/admin/login");
  }, [setLocation]);

  const { data: orders = [], isLoading, refetch } = useListOrders();

  const updateMutation = useUpdateOrder();

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { status: newStatus } });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      toast.success(`Status diperbarui menjadi ${newStatus}`);
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch {
      toast.error("Gagal memperbarui status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pesanan ini?")) return;
    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      toast.success("Pesanan dihapus");
      if (selectedOrder?.id === id) setSelectedOrder(null);
    } catch {
      toast.error("Gagal menghapus pesanan");
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Hapus SEMUA pesanan? Tindakan ini tidak dapat dibatalkan!")) return;
    try {
      await fetch("/api/orders", { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      toast.success("Semua pesanan berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus semua pesanan");
    }
  };

  const filtered = orders.filter(o => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "Semua" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusClasses = (status: string) => {
    if (status === "Menunggu") return "bg-amber-100 text-amber-700 border border-amber-200";
    if (status === "Diproses") return "bg-blue-100 text-blue-700 border border-blue-200";
    if (status === "Dikirim") return "bg-purple-100 text-purple-700 border border-purple-200";
    if (status === "Dibatalkan") return "bg-red-100 text-red-700 border border-red-200";
    return "bg-green-100 text-green-700 border border-green-200";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-serif text-3xl font-bold text-foreground">Kelola Pesanan</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
            title="Refresh pesanan"
          >
            <RefreshCw size={17} />
          </button>
          {orders.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-destructive/90 transition-colors shadow-sm"
            >
              <AlertTriangle size={18} />
              Hapus Semua
            </button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Cari ID atau nama pelanggan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-border rounded-lg bg-background text-sm outline-none focus:border-primary"
          >
            <option value="Semua">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Diproses">Diproses</option>
            <option value="Dikirim">Dikirim</option>
            <option value="Selesai">Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">ID & Waktu</th>
                <th className="px-6 py-4 font-medium">Pelanggan</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Memuat pesanan...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Tidak ada pesanan yang sesuai.</td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="bg-card border-b border-border hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <p className="font-mono font-medium">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "d MMM yyyy, HH:mm")}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.whatsapp}</p>
                      {order.paymentMethod === "Transfer" && (
                        <span className={`inline-flex items-center gap-1 text-xs mt-1 px-2 py-0.5 rounded-full font-medium ${order.buktiTransfer ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {order.buktiTransfer ? <><CheckCircle size={10} /> Bukti Terkirim</> : <><ImageIcon size={10} /> Belum Ada Bukti</>}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">{formatCurrency(order.totalPrice)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1.5 rounded-full outline-none cursor-pointer w-28 ${getStatusClasses(order.status)}`}
                      >
                        <option value="Menunggu">Menunggu</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Dikirim">Dikirim</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-primary hover:underline font-medium"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Hapus Pesanan"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pesanan {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Pelanggan</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                  <p>{selectedOrder.whatsapp}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Waktu</p>
                  <p className="font-medium">{format(new Date(selectedOrder.createdAt), "d MMMM yyyy", { locale: idLocale })}</p>
                  <p>{format(new Date(selectedOrder.createdAt), "HH:mm")}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Alamat Pengiriman</p>
                  <p className="font-medium bg-muted/50 p-2.5 rounded-lg border border-border mt-1">{selectedOrder.address}</p>
                </div>
                {selectedOrder.notes && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">Catatan Pesanan</p>
                    <p className="font-medium bg-amber-50 text-amber-900 p-2.5 rounded-lg border border-amber-200 mt-1">{selectedOrder.notes}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Metode Pembayaran</p>
                  <p className="font-medium inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded mt-1">{selectedOrder.paymentMethod}</p>
                </div>

                {selectedOrder.paymentMethod === "Transfer" && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs mb-2">Bukti Transfer</p>
                    {selectedOrder.buktiTransfer ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                          <CheckCircle size={15} />
                          Bukti transfer sudah dikirim pelanggan
                        </div>
                        <img
                          src={selectedOrder.buktiTransfer}
                          alt="Bukti Transfer"
                          className="w-full rounded-xl border border-border object-contain max-h-64"
                        />
                        <a
                          href={selectedOrder.buktiTransfer}
                          download={`bukti-${selectedOrder.id}.jpg`}
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                        >
                          <ImageIcon size={13} /> Unduh Bukti
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">
                        <ImageIcon size={16} />
                        Pelanggan belum mengunggah bukti transfer
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-3">Item Pesanan</h4>
                <div className="space-y-3">
                  {(selectedOrder.items as unknown as any[]).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="flex gap-2">
                        <span className="font-medium w-6 text-muted-foreground">{item.quantity}x</span>
                        <span>{item.menuItem?.name ?? item.name ?? "Item"}</span>
                      </span>
                      <span className="font-medium">{formatCurrency((item.menuItem?.price ?? item.price ?? 0) * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-border pt-3 mt-3 font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(selectedOrder.totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:border-primary"
                >
                  <option value="Menunggu">Menunggu</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Dikirim">Dikirim</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
