import React from "react";
import { Link } from "wouter";
import { Star, Plus } from "lucide-react";
import { MenuItem } from "../contexts/CartContext";
import { useCart } from "../contexts/CartContext";
import { formatCurrency } from "../lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

function getRemainingQuota(item: MenuItem): number | null {
  if (!item.dailyQuota || item.dailyQuota <= 0) return null;
  const sold = item.soldToday ?? 0;
  return Math.max(0, item.dailyQuota - sold);
}

export function MenuCard({ item, index = 0 }: { item: MenuItem; index?: number }) {
  const { addToCart, cart } = useCart();

  const remaining = getRemainingQuota(item);
  const inCart = cart.find(c => c.menuItem.id === item.id)?.quantity ?? 0;
  const canAdd = item.isAvailable && (remaining === null || inCart < remaining);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canAdd) {
      if (!item.isAvailable) {
        toast.error(`${item.name} sedang tidak tersedia`);
      } else {
        toast.error(`Kuota harian ${item.name} sudah habis`);
      }
      return;
    }
    addToCart(item);
    toast.success(`${item.name} ditambahkan ke keranjang`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/menu/${item.id}`} className="block group">
        <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 relative h-full flex flex-col">
          {item.isBestSeller && (
            <div className="absolute top-2 left-2 z-10 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full shadow-sm">
              Best Seller
            </div>
          )}
          
          <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {!item.isAvailable && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-foreground text-background px-3 py-1.5 rounded-full text-sm font-semibold">
                  Habis
                </span>
              </div>
            )}
            {item.isAvailable && remaining !== null && remaining <= 5 && remaining > 0 && (
              <div className="absolute bottom-2 left-2 z-10 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                Sisa {remaining} porsi
              </div>
            )}
          </div>
          
          <div className="p-3 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-serif font-semibold text-foreground text-sm line-clamp-2 leading-tight pr-1">
                {item.name}
              </h3>
              <div className="flex items-center text-accent shrink-0">
                <Star size={12} className="fill-current" />
                <span className="text-xs ml-0.5 font-medium">{item.rating}</span>
              </div>
            </div>
            
            {remaining !== null && item.isAvailable && (
              <p className="text-xs text-muted-foreground mb-1">
                {remaining === 0 ? "Kuota habis" : `${remaining} dari ${item.dailyQuota} porsi tersisa`}
              </p>
            )}
            
            <div className="mt-auto pt-3 flex items-center justify-between">
              <span className="text-primary font-semibold text-sm font-sans">
                {formatCurrency(item.price)}
              </span>
              <button 
                onClick={handleAdd}
                disabled={!canAdd}
                className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground active:scale-90 transition-all disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-primary/10 disabled:hover:text-primary"
                aria-label="Tambah ke keranjang"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
