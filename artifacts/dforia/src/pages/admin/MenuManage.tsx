import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { formatCurrency } from "../../lib/utils";
import { Plus, Edit, Trash2, Search, Image as ImageIcon, RotateCcw, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  useListMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  getListMenuItemsQueryKey,
} from "@workspace/api-client-react";
import type { MenuItem, MenuItemInput, MenuItemUpdate } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

type EditingItem = Omit<MenuItemInput, "id"> & { id?: string };

export default function MenuManage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!localStorage.getItem("dforia_admin_logged_in")) setLocation("/admin/login");
  }, [setLocation]);

  const { data: menuItems = [], isLoading } = useListMenuItems();
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();
  const deleteMutation = useDeleteMenuItem();

  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const defaultItem: EditingItem = {
    id: undefined,
    name: "", description: "", price: 0, image: "", category: "Makanan Berat",
    rating: 5.0, isBestSeller: false, isAvailable: true, dailyQuota: 0, soldToday: 0, quotaResetDate: "",
  };

  const invalidateMenu = () => queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      if (editingItem.id) {
        const { id, ...rest } = editingItem;
        await updateMutation.mutateAsync({ id, data: rest as MenuItemUpdate });
      } else {
        const newId = `M-${Date.now()}`;
        const { id: _id, ...rest } = editingItem;
        await createMutation.mutateAsync({
          data: { ...rest, id: newId, soldToday: 0, quotaResetDate: "" },
        });
      }
      toast.success(editingItem.id ? "Menu berhasil diperbarui" : "Menu berhasil ditambahkan");
      await invalidateMenu();
      setIsDialogOpen(false);
    } catch {
      toast.error("Gagal menyimpan menu");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      await invalidateMenu();
      toast.success("Menu dihapus");
    } catch {
      toast.error("Gagal menghapus menu");
    }
  };

  const toggleAvailable = async (item: MenuItem) => {
    try {
      await updateMutation.mutateAsync({ id: item.id, data: { isAvailable: !item.isAvailable } as MenuItemUpdate });
      await invalidateMenu();
      toast.success(item.isAvailable ? "Menu ditutup" : "Menu dibuka");
    } catch {
      toast.error("Gagal mengubah status");
    }
  };

  const resetSoldToday = async (item: MenuItem) => {
    try {
      await updateMutation.mutateAsync({ id: item.id, data: { soldToday: 0, isAvailable: true } as MenuItemUpdate });
      await invalidateMenu();
      toast.success("Kuota direset & menu dibuka kembali");
    } catch {
      toast.error("Gagal reset kuota");
    }
  };

  const resetAllSoldToday = async () => {
    if (!confirm("Reset kuota semua menu hari ini?")) return;
    try {
      const itemsWithQuota = menuItems.filter(i => i.dailyQuota > 0);
      await Promise.all(
        itemsWithQuota.map(i =>
          updateMutation.mutateAsync({ id: i.id, data: { soldToday: 0, isAvailable: true } as MenuItemUpdate })
        )
      );
      await invalidateMenu();
      toast.success("Semua kuota harian direset");
    } catch {
      toast.error("Gagal reset kuota");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingItem) setEditingItem({ ...editingItem, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const filtered = menuItems.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-serif text-3xl font-bold text-foreground">Kelola Menu</h1>
        <div className="flex gap-2">
          <button
            onClick={resetAllSoldToday}
            className="border border-border text-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-muted transition-colors text-sm"
          >
            <RotateCcw size={16} />
            Reset Kuota Hari Ini
          </button>
          <button
            onClick={() => { setEditingItem({ ...defaultItem }); setIsDialogOpen(true); }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Tambah Menu
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Menu</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Harga</th>
                <th className="px-6 py-4 font-medium text-center">Kuota Harian</th>
                <th className="px-6 py-4 font-medium text-center">Buka/Tutup</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Memuat menu...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Belum ada menu. Klik "Tambah Menu" untuk mulai.</td></tr>
              ) : filtered.map((item) => {
                const quota = item.dailyQuota ?? 0;
                const sold = item.soldToday ?? 0;
                const remaining = quota > 0 ? Math.max(0, quota - sold) : null;
                const isFull = remaining !== null && remaining === 0;

                return (
                  <tr key={item.id} className="bg-card border-b border-border hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.image || "https://placehold.co/100x100?text=No+Image"} alt={item.name} className="w-10 h-10 rounded-md object-cover bg-muted" />
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          {item.isBestSeller && <span className="text-xs font-medium text-accent">★ Best Seller</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{item.category}</td>
                    <td className="px-6 py-4 font-semibold text-primary">{formatCurrency(item.price)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        {quota > 0 ? (
                          <>
                            <div className="flex items-center gap-1.5">
                              <TrendingUp size={13} className="text-muted-foreground" />
                              <span className={`text-sm font-semibold ${isFull ? "text-destructive" : "text-foreground"}`}>
                                {sold}/{quota}
                              </span>
                            </div>
                            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${isFull ? "bg-destructive" : sold / quota > 0.7 ? "bg-orange-500" : "bg-green-500"}`}
                                style={{ width: `${Math.min(100, (sold / quota) * 100)}%` }}
                              />
                            </div>
                            {isFull && (
                              <button onClick={() => resetSoldToday(item)} className="text-xs text-primary hover:underline flex items-center gap-1">
                                <RotateCcw size={11} /> Reset
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Tidak terbatas</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <Switch checked={item.isAvailable} onCheckedChange={() => toggleAvailable(item)} />
                        <span className={`text-xs font-medium ${item.isAvailable ? "text-green-600" : "text-muted-foreground"}`}>
                          {item.isAvailable ? "Buka" : "Tutup"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingItem({ ...item, id: item.id }); setIsDialogOpen(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? "Edit Menu" : "Tambah Menu Baru"}</DialogTitle>
          </DialogHeader>

          {editingItem && (
            <form onSubmit={handleSave} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 space-y-4">
                  <label className="text-sm font-medium">Foto Menu</label>
                  <div className="w-full aspect-square max-w-[200px] mx-auto bg-muted rounded-xl border-2 border-dashed border-border overflow-hidden flex items-center justify-center">
                    {editingItem.image ? (
                      <img src={editingItem.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-muted-foreground flex flex-col items-center">
                        <ImageIcon size={32} className="mb-2 opacity-50" />
                        <span className="text-xs font-medium">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="relative cursor-pointer bg-primary text-primary-foreground text-center py-2 px-4 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors w-full">
                      Upload dari Galeri
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {editingItem.image && (
                      <button type="button" onClick={() => setEditingItem({ ...editingItem, image: "" })}
                        className="py-2 px-4 rounded-lg font-medium text-sm text-destructive border border-destructive/20 hover:bg-destructive/10 transition-colors w-full">
                        Hapus Foto
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Atau masukkan URL gambar</label>
                    <input type="url" value={editingItem.image ?? ""} onChange={e => setEditingItem({ ...editingItem, image: e.target.value })}
                      className="w-full p-2 border rounded-md text-sm" placeholder="https://..." />
                  </div>
                </div>

                <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Menu</label>
                    <input type="text" value={editingItem.name ?? ""} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full p-2.5 border rounded-md" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Harga (Rp)</label>
                    <input type="number" value={editingItem.price || ""} onChange={e => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                      className="w-full p-2.5 border rounded-md" required min="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kategori</label>
                    <select value={editingItem.category ?? "Makanan Berat"} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full p-2.5 border rounded-md bg-background">
                      <option value="Makanan Berat">Makanan Berat</option>
                      <option value="Makanan Ringan">Makanan Ringan</option>
                      <option value="Minuman">Minuman</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Paket Hemat">Paket Hemat</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rating (1-5)</label>
                    <input type="number" step="0.1" min="1" max="5" value={editingItem.rating ?? 5}
                      onChange={e => setEditingItem({ ...editingItem, rating: Number(e.target.value) })}
                      className="w-full p-2.5 border rounded-md" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Kuota Harian (Porsi)</label>
                    <div className="flex items-center gap-3">
                      <input type="number" min="0" max="999"
                        value={editingItem.dailyQuota ?? 0}
                        onChange={e => setEditingItem({ ...editingItem, dailyQuota: Number(e.target.value) })}
                        className="w-32 p-2.5 border rounded-md" />
                      <p className="text-xs text-muted-foreground flex-1">
                        {(editingItem.dailyQuota ?? 0) === 0
                          ? "0 = tidak terbatas (tanpa kuota)"
                          : `Maks. ${editingItem.dailyQuota} porsi per hari. Otomatis tutup jika habis.`}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Deskripsi</label>
                    <textarea value={editingItem.description ?? ""} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full p-2.5 border rounded-md resize-none" rows={3} required />
                  </div>
                  <div className="flex gap-6 md:col-span-2 mt-2 p-4 bg-muted/30 rounded-lg border border-border">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingItem.isAvailable ?? true}
                        onChange={e => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                        className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary" />
                      <span className="text-sm font-medium">Buka (Tersedia)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingItem.isBestSeller ?? false}
                        onChange={e => setEditingItem({ ...editingItem, isBestSeller: e.target.checked })}
                        className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent" />
                      <span className="text-sm font-medium">Jadikan Best Seller</span>
                    </label>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t">
                <DialogClose asChild>
                  <button type="button" className="px-6 py-2.5 border rounded-lg font-medium hover:bg-muted transition-colors">Batal</button>
                </DialogClose>
                <button type="submit" disabled={isSaving}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60">
                  {isSaving ? "Menyimpan..." : "Simpan Menu"}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
