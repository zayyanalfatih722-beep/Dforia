import { pgTable, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  storeName: text("store_name").notNull().default("D'Foria Kitchen"),
  whatsappNumber: text("whatsapp_number").notNull().default("6282255994981"),
  bankName: text("bank_name").notNull().default("BRI"),
  accountNumber: text("account_number").notNull().default("1234567890123"),
  logoUrl: text("logo_url").notNull().default(""),
  bannerUrl: text("banner_url").notNull().default(""),
  address: text("address").notNull().default(""),
  openTime: text("open_time").notNull().default("08:00"),
  closeTime: text("close_time").notNull().default("22:00"),
  adminUsername: text("admin_username").notNull().default("dforia_admin"),
  adminPasswordHash: text("admin_password_hash").notNull().default("admin123"),
});

export const updateSettingsSchema = createInsertSchema(settingsTable).partial().omit({ id: true });

export type Settings = typeof settingsTable.$inferSelect;
export type UpdateSettings = z.infer<typeof updateSettingsSchema>;
