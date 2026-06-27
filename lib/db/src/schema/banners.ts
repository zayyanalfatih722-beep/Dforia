import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bannersTable = pgTable("banners", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  image: text("image").notNull().default(""),
  bgColor: text("bg_color").notNull().default("from-primary/80 to-primary"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBannerSchema = createInsertSchema(bannersTable).omit({ createdAt: true });
export const updateBannerSchema = insertBannerSchema.partial().omit({ id: true });

export type Banner = typeof bannersTable.$inferSelect;
export type InsertBanner = z.infer<typeof insertBannerSchema>;
