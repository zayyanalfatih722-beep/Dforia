import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { useListMenuItems, useCreateOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetSettings } from "@workspace/api-client-react";
import { formatCurrency } from "../../lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { Plus, Minus, Trash2, Printer, ShoppingBag, Search, CheckCircle } from "lucide-react";

interface PosCartItem {
  menuItem: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  };
  quantity: number;
}

export default function KasirPOS() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Tunai" | "Transfer" | "COD">("Tunai");
  const [amountPaid, setAmountPaid] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [orderSaved, setOrderSaved] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!localStorage.getItem("dforia_admin_logged_in")) setLocation("/admin/login");
  }, [setLocation]);

  const { data: menuItems = [] } = useListMenuItems();
  const { data: settings } = useGetSettings();
  const createOrderMutation = useCreateOrder();

  const categories = ["Semua", ...Array.from(new Set(menuItems.map(m => m.category)))];

  const filteredMenu = useMemo(() => {
    return menuItems.filter(m => {
      const matchCat = selectedCategory === "Semua" || m.category === selectedCategory;
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch && m.isAvailable;
    });
  }, [menuItems, selectedCategory, search]);

  const totalAmount = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const change = Number(amountPaid) - totalAmount;

  const addToCart = (item: typeof menuItems[0]) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItem: { id: item.id, name: item.name, price: item.price, image: item.image, category: item.category }, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev
      .map(c => c.menuItem.id === id ? { ...c, quantity: c.quantity + delta } : c)
      .filter(c => c.quantity > 0)
    );
  };

  const getQty = (id: string) => cart.find(c => c.menuItem.id === id)?.quantity ?? 0;

  const handleSaveOrder = async () => {
    if (cart.length === 0) { toast.error("Keranjang masih kosong"); return; }
    const orderId = `POS-${Date.now()}`;
    try {
      const order = await createOrderMutation.mutateAsync({
        data: {
          id: orderId,
          items: cart as unknown as { [key: string]: unknown },
          customerName: customerName || "Pelanggan Umum",
          whatsapp: "-",
          address: "Bayar di Tempat",
          notes: amountPaid ? `Bayar: ${formatCurrency(Number(amountPaid))}` : "",
          paymentMethod,
          status: "Selesai",
          totalPrice: totalAmount,
          subtotal: totalAmount,
          discount: 0,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      setOrderSaved({ ...order, amountPaid: Number(amountPaid) || totalAmount, items: cart });
      toast.success("Pesanan berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan pesanan ke server");
    }
  };

  const handlePrint = () => {
    if (!orderSaved) { toast.error("Simpan pesanan terlebih dahulu"); return; }
    window.print();
  };

  const handleNewOrder = () => {
    setCart([]);
    setCustomerName("");
    setAmountPaid("");
    setOrderSaved(null);
    setPaymentMethod("Tunai");
  };

  const storeName = settings?.storeName || "D'Foria Kitchen";
  const storeWa = settings?.whatsappNumber || "";

  return (
    <div className="space-y-4 print:hidden-wrapper">
      <h1 className="font-serif text-3xl font-bold text-foreground print:hidden">Kasir</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 print:hidden">
        <div className="lg:col-span-3 space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Cari menu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredMenu.map(item => {
              const qty = getQty(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="relative bg-card border border-border rounded-xl overflow-hidden text-left hover:border-primary hover:shadow-md transition-all duration-200 active:scale-95 group"
                >
                  {qty > 0 && (
                    <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {qty}
                    </div>
                  )}
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-foreground line-clamp-1">{item.name}</p>
                    <p className="text-xs font-bold text-accent mt-0.5">{formatCurrency(item.price)}</p>
                  </div>
                </button>
              );
            })}
            {filteredMenu.length === 0 && (
              <div className="col-span-3 py-12 text-center text-muted-foreground">
                <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Tidak ada menu</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-foreground">Pesanan Saat Ini</h2>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nama pelanggan (opsional)"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full p-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:border-primary"
              />
              <div className="flex gap-2">
                {(["Tunai", "Transfer", "COD"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      paymentMethod === m ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <ShoppingBag size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Pilih menu di sebelah kiri</p>
                </div>
              ) : cart.map(item => (
                <div key={item.menuItem.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <img src={item.menuItem.image} alt={item.menuItem.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{item.menuItem.name}</p>
                    <p className="text-xs text-accent font-bold">{formatCurrency(item.menuItem.price)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => updateQty(item.menuItem.id, -1)} className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.menuItem.id, 1)} className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-border pt-3 space-y-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Uang Diterima</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)}
                    className="w-full p-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:border-primary"
                  />
                  {Number(amountPaid) > 0 && (
                    <div className={`flex justify-between text-sm font-semibold mt-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      <span>Kembalian</span>
                      <span>{formatCurrency(Math.max(0, change))}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              {!orderSaved ? (
                <>
                  <button
                    onClick={handleNewOrder}
                    className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={15} />
                    Bersihkan
                  </button>
                  <button
                    onClick={handleSaveOrder}
                    disabled={createOrderMutation.isPending}
                    className="flex-[2] py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                  >
                    <CheckCircle size={15} />
                    {createOrderMutation.isPending ? "Menyimpan..." : "Simpan Pesanan"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handlePrint}
                    className="flex-1 py-2.5 border border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer size={15} />
                    Cetak Struk
                  </button>
                  <button
                    onClick={handleNewOrder}
                    className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={15} />
                    Pesanan Baru
                  </button>
                </>
              )}
            </div>

            {orderSaved && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700 text-sm">
                <CheckCircle size={16} />
                <span className="font-medium">Pesanan #{orderSaved.id} berhasil disimpan!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div ref={receiptRef} className="hidden print:block print-receipt">
        {orderSaved && (
          <div style={{ fontFamily: "monospace", fontSize: "12px", maxWidth: "300px", margin: "0 auto", padding: "12px" }}>
            <div style={{ textAlign: "center", borderBottom: "1px dashed #000", paddingBottom: "8px", marginBottom: "8px" }}>
              <div style={{ fontSize: "16px", fontWeight: "bold" }}>{storeName}</div>
              {storeWa && <div>WA: {storeWa}</div>}
              <div>================================</div>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <div>No: {orderSaved.id}</div>
              <div>Tgl: {format(new Date(orderSaved.createdAt), "dd/MM/yyyy HH:mm", { locale: idLocale })}</div>
              <div>Kasir: Admin</div>
              {orderSaved.customerName !== "Pelanggan Umum" && <div>Pelanggan: {orderSaved.customerName}</div>}
            </div>
            <div style={{ borderTop: "1px dashed #000", paddingTop: "8px", marginBottom: "8px" }}>
              {(orderSaved.items as PosCartItem[]).map((item, i) => (
                <div key={i} style={{ marginBottom: "4px" }}>
                  <div>{item.menuItem.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{item.quantity} x {formatCurrency(item.menuItem.price)}</span>
                    <span>{formatCurrency(item.menuItem.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px dashed #000", paddingTop: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                <span>TOTAL</span>
                <span>{formatCurrency(orderSaved.totalPrice)}</span>
              </div>
              {orderSaved.amountPaid > orderSaved.totalPrice && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Bayar</span>
                    <span>{formatCurrency(orderSaved.amountPaid)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Kembali</span>
                    <span>{formatCurrency(orderSaved.amountPaid - orderSaved.totalPrice)}</span>
                  </div>
                </>
              )}
              <div>Pembayaran: {orderSaved.paymentMethod}</div>
            </div>
            <div style={{ textAlign: "center", marginTop: "12px", borderTop: "1px dashed #000", paddingTop: "8px", fontSize: "11px" }}>
              <div>Terima kasih telah berbelanja</div>
              <div>di {storeName}</div>
              <div>================================</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
