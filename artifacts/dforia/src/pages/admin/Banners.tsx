import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  bgColor: string;
}

export default function BannersManage() {
  const [, setLocation] = useLocation();
  const [banners, setBanners] = useLocalStorage<Banner[]>("dforia_banners", []);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("dforia_admin_logged_in")) setLocation("/admin/login");
  }, [setLocation]);

  const defaultBanner: Banner = { id: "", title: "", subtitle: "", image: "", bgColor: "from-primary/80 to-primary" };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    if (editingBanner.id) {
      setBanners(banners.map(b => b.id === editingBanner.id ? editingBanner : b));
      toast.success("Banner diperbarui");
    } else {
      setBanners([...banners, { ...editingBanner, id: `B-${Date.now()}` }]);
      toast.success("Banner ditambahkan");
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus banner ini?")) {
      setBanners(banners.filter(b => b.id !== id));
      toast.success("Banner dihapus");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-3xl font-bold">Kelola Banner</h1>
        <button
          onClick={() => { setEditingBanner(defaultBanner); setIsDialogOpen(true); }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90"
        >
          <Plus size={18} /> Tambah
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            <div className="relative h-40">
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-xs font-bold bg-accent text-accent-foreground px-2 py-0.5 rounded-full uppercase">{banner.title}</span>
                <h3 className="text-white font-serif font-bold text-lg leading-tight mt-1">{banner.subtitle}</h3>
              </div>
            </div>
            <div className="p-3 bg-card flex justify-end gap-2">
              <button onClick={() => { setEditingBanner(banner); setIsDialogOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Edit size={16} />
              </button>
              <button onClick={() => handleDelete(banner.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBanner?.id ? "Edit Banner" : "Tambah Banner"}</DialogTitle>
          </DialogHeader>
          {editingBanner && (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Judul Kecil (Badge)</label>
                <input type="text" value={editingBanner.title} onChange={e => setEditingBanner({...editingBanner, title: e.target.value})} className="w-full p-2 border rounded-md mt-1" required />
              </div>
              <div>
                <label className="text-sm font-medium">Teks Utama</label>
                <input type="text" value={editingBanner.subtitle} onChange={e => setEditingBanner({...editingBanner, subtitle: e.target.value})} className="w-full p-2 border rounded-md mt-1" required />
              </div>
              <div>
                <label className="text-sm font-medium">URL Gambar</label>
                <input type="url" value={editingBanner.image} onChange={e => setEditingBanner({...editingBanner, image: e.target.value})} className="w-full p-2 border rounded-md mt-1" required />
              </div>
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <button type="button" className="px-4 py-2 border rounded-md hover:bg-muted">Batal</button>
                </DialogClose>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Simpan</button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
