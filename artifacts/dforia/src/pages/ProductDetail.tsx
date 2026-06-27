import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useCart, MenuItem } from "../contexts/CartContext";
import { ArrowLeft, Star, Minus, Plus } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MenuCard } from "../components/MenuCard";
import { useListMenuItems } from "@workspace/api-client-react";

function getRemainingQuota(item: MenuItem, currentInCart: number): number | null {
  if (!item.dailyQuota || item.dailyQuota <= 0) return null;
  const sold = item.soldToday ?? 0;
  return Math.max(0, item.dailyQuota - sold - currentInCart);
}

export default function ProductDetail() {
  const params = useParams();
  const id = params.id;
  const { data: apiItems, isLoading } = useListMenuItems();
  const menuItems = (apiItems ?? []) as unknown as MenuItem[];
  const { addToCart, cart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = menuItems.find((item) => item.id === id);
  const relatedItems = menuItems.filter(
    (item) => item.category === product?.category && item.id !== product?.id
  ).slice(0, 4);

  const inCart = product ? (cart.find(c => c.menuItem.id === product.id)?.quantity ?? 0) : 0;
  const remaining = product ? getRemainingQuota(product, inCart) : null;
  const maxQty = remaining !== null ? remaining : 99;

  if (!isLoading && !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <p className="text-lg text-muted-foreground mb-4">Produk tidak ditemukan</p>
        <Link href="/menu" className="text-primary font-medium hover:underline">
          Kembali ke Menu
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    if (!product) return;
    if (!product.isAvailable) {
      toast.error(`${product.name} sedang tidak tersedia`);
      return;
    }
    if (maxQty <= 0) {
      toast.error(`Kuota harian ${product.name} sudah habis`);
      return;
    }
    const addQty = Math.min(quantity, maxQty);
    addToCart(product, addQty);
    toast.success(`${addQty} ${product.name} ditambahkan ke keranjang`);
    setQuantity(1);
  };

  return (
    <div className="w-full pb-8">
      <Link href="/menu" className="absolute top-4 left-4 z-50 w-10 h-10 bg-background/80 backdrop-blur-md flex items-center justify-center rounded-full shadow-md text-foreground">
        <ArrowLeft size={20} />
      </Link>

      {isLoading ? (
        <>
          <Skeleton className="w-full aspect-[4/3] rounded-none" />
          <div className="p-5 space-y-4">
            <Skeleton className="w-24 h-6 rounded-full" />
            <Skeleton className="w-3/4 h-8" />
            <Skeleton className="w-1/3 h-6" />
            <div className="pt-4 space-y-2">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-2/3 h-4" />
            </div>
          </div>
        </>
      ) : product ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <div className="relative w-full aspect-[4/3]">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-80" />
            {!product.isAvailable && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-foreground text-background px-4 py-2 rounded-full text-lg font-bold">
                  Stok Habis
                </span>
              </div>
            )}
          </div>

          <div className="p-5 -mt-6 relative z-10">
            <div className="flex justify-between items-start mb-2">
              <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full uppercase tracking-wider">
                {product.category}
              </span>
              <div className="flex items-center text-accent bg-accent/10 px-2 py-1 rounded-full">
                <Star size={14} className="fill-current" />
                <span className="text-sm ml-1 font-bold">{product.rating}</span>
              </div>
            </div>

            <h1 className="font-serif text-3xl font-bold text-foreground leading-tight mb-2">
              {product.name}
            </h1>

            <p className="text-2xl font-bold text-primary font-sans mb-2">
              {formatCurrency(product.price)}
            </p>

            {remaining !== null && product.isAvailable && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                remaining === 0
                  ? "bg-destructive/10 text-destructive"
                  : remaining <= 5
                  ? "bg-orange-100 text-orange-700"
                  : "bg-green-100 text-green-700"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  remaining === 0 ? "bg-destructive" : remaining <= 5 ? "bg-orange-500" : "bg-green-500"
                }`} />
                {remaining === 0 ? "Kuota habis hari ini" : `Sisa ${remaining} dari ${product.dailyQuota} porsi`}
              </div>
            )}

            <div className="space-y-4 mb-8">
              <h3 className="font-semibold text-lg">Deskripsi</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{product.description}</p>
            </div>

            {product.isAvailable && maxQty > 0 && (
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm mb-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Jumlah</span>
                  <div className="flex items-center gap-4 bg-secondary/50 rounded-full px-2 py-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-background rounded-full transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-6 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                      className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-background rounded-full transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                {remaining !== null && (
                  <p className="text-xs text-muted-foreground -mt-2">
                    Maks. {maxQty} porsi (sudah {inCart} di keranjang)
                  </p>
                )}
                <button
                  onClick={handleAdd}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-lg shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Tambah ke Keranjang
                  <span className="font-normal opacity-80">• {formatCurrency(product.price * quantity)}</span>
                </button>
              </div>
            )}

            {product.isAvailable && maxQty === 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mb-8 text-center">
                <p className="text-destructive font-semibold">Kuota harian sudah habis</p>
                <p className="text-xs text-muted-foreground mt-1">Kuota akan reset besok</p>
              </div>
            )}

            {relatedItems.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h3 className="font-serif text-xl font-bold mb-4">Mungkin Anda Suka</h3>
                <div className="grid grid-cols-2 gap-4">
                  {relatedItems.map((item, idx) => (
                    <MenuCard key={item.id} item={item} index={idx} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
