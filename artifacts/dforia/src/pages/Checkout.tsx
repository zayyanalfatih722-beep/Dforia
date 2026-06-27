import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "../contexts/CartContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { SEED_SETTINGS } from "../hooks/useSeedData";
import { formatCurrency } from "../lib/utils";
import { ArrowLeft, Copy, CheckCircle2, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Coupon } from "./admin/Kupon";
import { useRecordMenuSold, getListMenuItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const checkoutSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().min(9, "Nomor WhatsApp tidak valid"),
  address: z.string().min(10, "Alamat terlalu singkat"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["COD", "Transfer"]),
});

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { cart, cartTotal, clearCart } = useCart();
  const [orders, setOrders] = useLocalStorage<any[]>("dforia_orders", []);
  const [profile, setProfile] = useLocalStorage("dforia_customer_profile", { name: "", phone: "" });
  const [settings] = useLocalStorage("dforia_settings", SEED_SETTINGS);
  const [coupons] = useLocalStorage<Coupon[]>("dforia_coupons", []);
  const [copied, setCopied] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const recordSoldMutation = useRecordMenuSold();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (cart.length === 0) setLocation("/cart");
  }, [cart, setLocation]);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: profile.name || "",
      phone: profile.phone || "",
      address: "",
      notes: "",
      paymentMethod: "COD",
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? Math.round(cartTotal * appliedCoupon.value / 100)
      : Math.min(appliedCoupon.value, cartTotal)
    : 0;

  const finalTotal = cartTotal - discountAmount;

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const found = coupons.find(c => c.code === code && c.isActive);
    if (!found) { toast.error("Kode kupon tidak valid atau tidak aktif"); return; }
    if (found.minOrder > 0 && cartTotal < found.minOrder) {
      toast.error(`Minimal order ${formatCurrency(found.minOrder)} untuk menggunakan kupon ini`);
      return;
    }
    setAppliedCoupon(found);
    toast.success(`Kupon ${found.code} berhasil dipakai! Diskon ${found.type === "percent" ? `${found.value}%` : formatCurrency(found.value)}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const onSubmit = async (values: z.infer<typeof checkoutSchema>) => {
    setProfile({ name: values.name, phone: values.phone });

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: orderId,
      items: [...cart],
      customerName: values.name,
      whatsapp: values.phone,
      address: values.address,
      notes: values.notes || "",
      paymentMethod: values.paymentMethod,
      status: "Menunggu",
      totalPrice: finalTotal,
      subtotal: cartTotal,
      discount: discountAmount,
      couponCode: appliedCoupon?.code || null,
      createdAt: new Date().toISOString(),
    };

    setOrders([newOrder, ...orders]);

    // Record sold quantities via API → auto-closes items that hit daily quota
    try {
      await recordSoldMutation.mutateAsync({
        data: {
          items: cart.map(c => ({ id: c.menuItem.id, quantity: c.quantity })),
        },
      });
      // Refresh menu so all devices see updated soldToday / isAvailable
      queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
    } catch {
      // Non-blocking — order was still saved
    }

    clearCart();

    const itemsText = cart.map(item =>
      `- ${item.menuItem.name} x${item.quantity} (${formatCurrency(item.menuItem.price * item.quantity)})`
    ).join("\n");

    const text =
      `Halo D'Foria Kitchen, saya ingin memesan:\n\n` +
      `*ID Pesanan:* ${orderId}\n` +
      `${itemsText}\n\n` +
      `*Subtotal:* ${formatCurrency(cartTotal)}\n` +
      (discountAmount > 0 ? `*Diskon (${appliedCoupon?.code}):* -${formatCurrency(discountAmount)}\n` : "") +
      `*Total:* ${formatCurrency(finalTotal)}\n\n` +
      `*Nama:* ${values.name}\n` +
      `*No WA:* ${values.phone}\n` +
      `*Alamat:* ${values.address}\n` +
      (values.notes ? `*Catatan:* ${values.notes}\n` : "") +
      `*Metode Pembayaran:* ${values.paymentMethod}`;

    const waNumber = settings?.whatsappNumber || "6282255994981";
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, "_blank");
    setLocation("/orders");
    toast.success("Pesanan berhasil dibuat!");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Disalin ke clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (cart.length === 0) return null;

  return (
    <div className="w-full min-h-screen bg-muted/20 pb-8">
      <header className="bg-background px-4 py-4 border-b border-border flex items-center sticky top-0 z-30 shadow-sm">
        <Link href="/cart" className="p-1 -ml-1 text-foreground hover:text-primary transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-serif text-xl font-bold ml-2 flex-1">Checkout</h1>
      </header>

      <div className="p-4 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Delivery Info */}
            <section className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
                Info Pengiriman
              </h2>
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} className="bg-background" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor WhatsApp</FormLabel>
                  <FormControl><Input type="tel" placeholder="08123456789" {...field} className="bg-background" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Lengkap</FormLabel>
                  <FormControl><Textarea placeholder="Jl. Sudirman No. 123..." {...field} className="bg-background resize-none" rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl><Input placeholder="Misal: Sambal dipisah" {...field} className="bg-background" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </section>

            {/* Kupon Diskon */}
            <section className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-3">
              <h2 className="font-serif text-lg font-bold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</span>
                Kode Kupon
              </h2>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <Tag size={16} />
                    <div>
                      <p className="font-bold font-mono text-sm">{appliedCoupon.code}</p>
                      <p className="text-xs">
                        Hemat {appliedCoupon.type === "percent" ? `${appliedCoupon.value}%` : formatCurrency(appliedCoupon.value)} — diskon {formatCurrency(discountAmount)}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={handleRemoveCoupon} className="p-1 text-green-600 hover:text-red-500 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                    placeholder="Masukkan kode kupon"
                    className="flex-1 p-2.5 border border-border rounded-xl bg-background text-sm font-mono focus:outline-none focus:border-primary uppercase"
                  />
                  <button type="button" onClick={handleApplyCoupon}
                    className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors whitespace-nowrap">
                    Pakai
                  </button>
                </div>
              )}
            </section>

            {/* Payment Method */}
            <section className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">3</span>
                Metode Pembayaran
              </h2>
              <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                      <FormItem className="flex items-center space-x-3 space-y-0 bg-background border border-border p-4 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                        <FormControl><RadioGroupItem value="COD" /></FormControl>
                        <FormLabel className="font-medium cursor-pointer flex-1">Bayar di Tempat (COD)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 bg-background border border-border p-4 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                        <FormControl><RadioGroupItem value="Transfer" /></FormControl>
                        <FormLabel className="font-medium cursor-pointer flex-1">Transfer Bank</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {paymentMethod === "Transfer" && (
                <div className="bg-secondary/30 border border-secondary p-4 rounded-xl space-y-2 animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-sm font-medium">Silahkan transfer ke rekening berikut:</p>
                  <div className="bg-background p-3 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground uppercase font-bold">{settings.bankName}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="font-mono text-lg font-semibold tracking-wider">{settings.accountNumber}</p>
                      <button type="button" onClick={() => copyToClipboard(settings.accountNumber)} className="text-primary p-1.5 hover:bg-primary/10 rounded-md transition-colors">
                        {copied ? <CheckCircle2 size={18} className="text-green-600" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Upload bukti transfer di halaman Pesanan setelah order dibuat.</p>
                </div>
              )}
            </section>

            {/* Summary */}
            <section className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold">Ringkasan Pesanan</h2>
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.menuItem.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.quantity}x {item.menuItem.name}</span>
                    <span className="font-medium">{formatCurrency(item.menuItem.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-3 mt-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ongkos Kirim</span>
                    <span className="text-green-600 font-medium">Gratis</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 flex items-center gap-1">
                        <Tag size={12} /> Diskon ({appliedCoupon?.code})
                      </span>
                      <span className="text-green-600 font-semibold">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
                    <span>Total Keseluruhan</span>
                    <span className="text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={recordSoldMutation.isPending}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all text-lg disabled:opacity-70"
            >
              {recordSoldMutation.isPending ? "Memproses..." : "Pesan Sekarang"}
            </button>
          </form>
        </Form>
      </div>
    </div>
  );
}
