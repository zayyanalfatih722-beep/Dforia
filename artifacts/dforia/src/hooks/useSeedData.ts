import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export const SEED_MENU = [
  { id: "1", name: "Nasi Goreng Spesial", description: "Nasi goreng dengan bumbu rahasia, telur, ayam suwir, dan udang.", price: 45000, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800", category: "Makanan Berat", rating: 4.8, isBestSeller: true, isAvailable: true },
  { id: "2", name: "Aayam Bakar Madu", description: "Ayam bakar pilihan dengan olesan madu murni dan sambal terasi.", price: 55000, image: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&q=80&w=800", category: "Makanan Berat", rating: 4.7, isBestSeller: true, isAvailable: true },
  { id: "3", name: "Soto Ayam Lamongan", description: "Soto ayam berkuah kuning gurih dengan koya spesial.", price: 40000, image: "https://images.unsplash.com/photo-1626082895617-2c6ab34758cb?auto=format&fit=crop&q=80&w=800", category: "Makanan Berat", rating: 4.6, isBestSeller: false, isAvailable: true },
  { id: "4", name: "Rendang Sapi", description: "Potongan daging sapi empuk dengan bumbu rendang Minang asli yang dimasak perlahan.", price: 65000, image: "https://images.unsplash.com/photo-1626074964464-9eb51b327b87?auto=format&fit=crop&q=80&w=800", category: "Makanan Berat", rating: 4.9, isBestSeller: true, isAvailable: true },
  { id: "5", name: "Mie Goreng Seafood", description: "Mie goreng dengan udang, cumi, dan sayuran segar.", price: 50000, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=800", category: "Makanan Berat", rating: 4.5, isBestSeller: false, isAvailable: true },
  { id: "6", name: "Pisang Goreng Keju", description: "Pisang kepok goreng renyah dengan taburan keju dan susu kental manis.", price: 25000, image: "https://images.unsplash.com/photo-1606502973842-f64bc2785fe5?auto=format&fit=crop&q=80&w=800", category: "Makanan Ringan", rating: 4.6, isBestSeller: false, isAvailable: true },
  { id: "7", name: "Tahu Crispy", description: "Tahu pong goreng garing dengan sambal kecap pedas manis.", price: 20000, image: "https://images.unsplash.com/photo-1599307767316-776affbaa61a?auto=format&fit=crop&q=80&w=800", category: "Makanan Ringan", rating: 4.3, isBestSeller: false, isAvailable: true },
  { id: "8", name: "Es Teh Manis", description: "Teh melati segar dengan es batu.", price: 15000, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800", category: "Minuman", rating: 4.8, isBestSeller: true, isAvailable: true },
  { id: "9", name: "Jus Alpukat", description: "Jus alpukat kental dengan sirup cokelat.", price: 25000, image: "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&q=80&w=800", category: "Minuman", rating: 4.7, isBestSeller: false, isAvailable: true },
  { id: "10", name: "Kopi Susu Gula Aren", description: "Kopi espresso dengan susu segar dan gula aren premium.", price: 28000, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800", category: "Minuman", rating: 4.9, isBestSeller: true, isAvailable: true },
  { id: "11", name: "Paket Keluarga", description: "Paket komplit untuk 4 orang: 4 Nasi, 1 Ayam Bakar Utuh, 4 Es Teh, dan Sambal.", price: 180000, image: "https://images.unsplash.com/photo-1544025162-8360065a7dcb?auto=format&fit=crop&q=80&w=800", category: "Paket Hemat", rating: 4.9, isBestSeller: true, isAvailable: true },
];

export const SEED_BANNERS = [
  { id: "b1", title: "Promo Hari Ini", subtitle: "Diskon 20% untuk semua Makanan Berat", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200", bgColor: "from-primary/80 to-primary" },
  { id: "b2", title: "Menu Baru", subtitle: "Cobain Rendang Sapi Spesial kami", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1200", bgColor: "from-accent/80 to-accent" },
  { id: "b3", title: "Gratis Ongkir", subtitle: "Untuk pesanan di atas Rp 150.000", image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&q=80&w=1200", bgColor: "from-primary/90 to-black/80" },
];

export const SEED_SETTINGS = {
  storeName: "D'Foria Kitchen",
  whatsappNumber: "6282255994981",
  bankName: "BRI",
  accountNumber: "1234567890123",
  logoUrl: "",
  bannerUrl: "",
  address: "Jl. Contoh Alamat No. 123",
  openTime: "08:00",
  closeTime: "22:00"
};

export function useSeedData() {
  const [menu, setMenu] = useLocalStorage("dforia_menu", [] as any[]);
  const [banners, setBanners] = useLocalStorage("dforia_banners", [] as any[]);
  const [settings, setSettings] = useLocalStorage("dforia_settings", SEED_SETTINGS);

  useEffect(() => {
    if (menu.length === 0) setMenu(SEED_MENU);
    if (banners.length === 0) setBanners(SEED_BANNERS);
    if (!settings || !settings.storeName) setSettings(SEED_SETTINGS);
  }, []);
}
