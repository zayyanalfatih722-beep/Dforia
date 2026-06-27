import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const couponsTable = pgTable("coupons", {
  id: text("id").primaryKey(),
  code: text("code").unique().notNull(),
  type: text("type").notNull().default("percent"),
  value: integer("value").notNull(),
  minOrder: integer("min_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCouponSchema = createInsertSchema(couponsTable).omit({ createdAt: true });
export const updateCouponSchema = insertCouponSchema.partial().omit({ id: true });

export type Coupon = typeof couponsTable.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
