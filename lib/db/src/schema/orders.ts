import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey(),
  items: jsonb("items").notNull(),
  customerName: text("customer_name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  address: text("address").notNull(),
  notes: text("notes").notNull().default(""),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("Menunggu"),
  totalPrice: integer("total_price").notNull(),
  subtotal: integer("subtotal").notNull(),
  discount: integer("discount").notNull().default(0),
  couponCode: text("coupon_code"),
  buktiTransfer: text("bukti_transfer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ createdAt: true });
export const updateOrderSchema = z.object({
  status: z.string().optional(),
  buktiTransfer: z.string().optional(),
});

export type Order = typeof ordersTable.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
