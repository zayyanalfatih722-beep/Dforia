import React from "react";
import { Link } from "wouter";
import { useCart, MenuItem } from "../contexts/CartContext";
import { formatCurrency } from "../lib/utils";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useListMenuItems } from "@workspace/api-client-react";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { data: apiItems } = useListMenuItems();
  const menuItems = (apiItems ?? []) as unknown as MenuItem[];

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-primary/50 mb-6">
          <ShoppingBag size={48} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Keranjang Kosong</h2>
        <p className="text-muted-foreground mb-8">
          Belum ada menu yang ditambahkan. Yuk, lihat menu lezat kami!
        </p>
        <Link href="/menu" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-md hover:bg-primary/90 transition-colors">
          Lihat Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-muted/20 pb-24">
      <header className="bg-background px-4 py-4 border-b border-border shadow-sm sticky top-0 z-30">
        <h1 className="font-serif text-xl font-bold text-center">Keranjang Saya</h1>
      </header>

      <div className="p-4 space-y-4">
        <AnimatePresence>
          {cart.map((item) => {
            const liveMenu = menuItems.find(m => m.id === item.menuItem.id) ?? item.menuItem;
            const quota = liveMenu.dailyQuota ?? 0;
            const sold = liveMenu.soldToday ?? 0;
            const remaining = quota > 0 ? Math.max(0, quota - sold - item.quantity) : null;

            return (
              <motion.div
                key={item.menuItem.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, height: 0, overflow: "hidden" }}
                transition={{ duration: 0.2 }}
                className="bg-card border border-border p-3 rounded-2xl shadow-sm flex gap-4"
              >
                <img src={item.menuItem.image} alt={item.menuItem.name} className="w-24 h-24 object-cover rounded-xl bg-muted" />
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-semibold text-foreground leading-tight line-clamp-1">{item.menuItem.name}</h3>
                    <p className="text-primary font-bold text-sm mt-1">{formatCurrency(item.menuItem.price)}</p>
                    {quota > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Sisa kuota: {Math.max(0, quota - sold - item.quantity)} porsi
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-secondary/50 rounded-full px-1 py-1">
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-foreground hover:bg-background rounded-full transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-4 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => {
                          if (remaining !== null && remaining <= 0) {
                            toast.error("Kuota harian untuk menu ini sudah habis");
                            return;
                          }
                          updateQuantity(item.menuItem.id, item.quantity + 1);
                        }}
                        disabled={remaining !== null && remaining <= 0}
                        className="w-7 h-7 flex items-center justify-center text-foreground hover:bg-background rounded-full transition-colors disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.menuItem.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-destructive/10"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-40 flex justify-center">
        <div className="w-full max-w-[430px] bg-background border-t border-border p-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Ongkos Kirim</span>
              <span className="text-green-600 font-medium">Gratis</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border/50">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(cartTotal)}</span>
            </div>
          </div>
          <Link href="/checkout"
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            Lanjut Checkout
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
