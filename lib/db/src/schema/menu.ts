import { pgTable, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const menuItemsTable = pgTable("menu_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull(),
  image: text("image").notNull().default(""),
  category: text("category").notNull().default("Makanan Berat"),
  rating: real("rating").notNull().default(5.0),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  isAvailable: boolean("is_available").notNull().default(true),
  dailyQuota: integer("daily_quota").notNull().default(0),
  soldToday: integer("sold_today").notNull().default(0),
  quotaResetDate: text("quota_reset_date").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItemsTable).omit({ createdAt: true });
export const updateMenuItemSchema = insertMenuItemSchema.partial().omit({ id: true });

export type MenuItem = typeof menuItemsTable.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
