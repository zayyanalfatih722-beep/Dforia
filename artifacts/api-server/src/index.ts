import app from "./app";
import { logger } from "./lib/logger";
import { db, menuItemsTable } from "@workspace/db";
import { count } from "drizzle-orm";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const SEED_MENU = [
  { id: "1", name: "Nasi Goreng Spesial", description: "Nasi goreng dengan bumbu rahasia, telur, ayam suwir, dan udang.", price: 45000, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800", category: "Makanan Berat", rating: 4.8, isBestSeller: true, isAvailable: true, dailyQuota: 0, soldToday: 0, quotaResetDate: "" },
  { id: "2", name: "Ayam Bakar Madu", description: "Ayam bakar pilihan dengan olesan madu murni dan sambal terasi.", price: 55000, image: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&q=80&w=800", category: "Makanan Berat", rating: 4.7, isBestSeller: true, isAvailable: true, dailyQuota: 0, soldToday: 0, quotaResetDate: "" },
  { id: "3", name: "Soto Ayam Lamongan", description: "Soto ayam berkuah kuning gurih dengan koya spesial.", price: 40000, image: "https://images.unsplash.com/photo-1626082895617-2c6ab34758cb?auto=format&fit=crop&q=80&w=800", category: "Makanan Berat", rating: 4.6, isBestSeller: false, isAvailable: true, dailyQuota: 0, soldToday: 0, quotaResetDate: "" },
  { id: "4", name: "Rendang Sapi", description: "Potongan daging sapi empuk dengan bumbu rendang Minang asli yang dimasak perlahan.", price: 65000, image: "https://images.unsplash.com/photo-1626074964464-9eb51b327b87?auto=format&fit=crop&q=80&w=800", category: "Makanan Berat", rating: 4.9, isBestSeller: true, isAvailable: true, dailyQuota: 0, soldToday: 0, quotaResetDate: "" },
  { id: "5", name: "Mie Goreng Seafood", description: "Mie goreng dengan udang, cumi, dan sayuran segar.", price: 50000, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=800", category: "Makanan Berat", rating: 4.5, isBestSeller: false, isAvailable: true, dailyQuota: 0, soldToday: 0, quotaResetDate: "" },
  { id: "6", name: "Pisang Goreng Keju", description: "Pisang kepok goreng renyah dengan taburan keju dan susu kental manis.", price: 25000, image: "https://images.unsplash.com/photo-1606502973842-f64bc2785fe5?auto=format&fit=crop&q=80&w=800", category: "Makanan Ringan", rating: 4.6, isBestSeller: false, isAvailable: true, dailyQuota: 0, soldToday: 0, quotaResetDate: "" },
  { id: "7", name: "Tahu Crispy", description: "Tahu pong goreng garing dengan sambal kecap pedas manis.", price: 20000, image: "https://images.unsplash.com/photo-1599307767316-776affbaa61a?auto=format&fit=crop&q=80&w=800", category: "Makanan Ringan", rating: 4.3, isBestSeller: false, isAvailable: true, dailyQuota: 0, soldToday: 0, quotaResetDate: "" },
  { id: "8", name: "Es Teh Manis", description: "Teh melati segar dengan es batu.", price: 15000, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800", category: "Minuman", rating: 4.8, isBestSeller: true, isAvailable: true, dailyQuota: 0, soldToday: 0, quotaResetDate: "" },
  { id: "9", name: "Jus Alpukat", description: "Jus alpukat kental dengan sirup cokelat.", price: 25000, image: "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&q=80&w=800", category: "Minuman", rating: 4.7, isBestSeller: false, isAvailable: true, dailyQuota: 0, soldToday: 0, quotaResetDate: "" },
  { id: "10", name: "Kopi Susu Gula Aren", description: "Kopi espresso dengan susu segar dan gula aren premium.", price: 28000, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800", category: "Minuman", rating: 4.9, isBestSeller: true, isAvailable: true, dailyQuota: 0, soldToday: 0, quotaResetDate: "" },
  { id: "11", name: "Paket Keluarga", description: "Paket komplit untuk 4 orang: 4 Nasi, 1 Ayam Bakar Utuh, 4 Es Teh, dan Sambal.", price: 180000, image: "https://images.unsplash.com/photo-1544025162-8360065a7dcb?auto=format&fit=crop&q=80&w=800", category: "Paket Hemat", rating: 4.9, isBestSeller: true, isAvailable: true, dailyQuota: 0, soldToday: 0, quotaResetDate: "" },
];

async function seedIfEmpty() {
  try {
    const [{ total }] = await db.select({ total: count() }).from(menuItemsTable);
    if (total === 0) {
      await db.insert(menuItemsTable).values(SEED_MENU);
      logger.info({ count: SEED_MENU.length }, "Seeded menu items into DB");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed menu");
  }
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  seedIfEmpty();
});
