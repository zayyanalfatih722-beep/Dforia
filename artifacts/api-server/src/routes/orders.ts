import { Router } from "express";
import { db, ordersTable, insertOrderSchema, updateOrderSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/orders", async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    res.json(orders);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const parsed = insertOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }
    const [order] = await db.insert(ordersTable).values(parsed.data).returning();
    res.status(201).json(order);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.put("/orders/:id", async (req, res) => {
  try {
    const parsed = updateOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }
    const [order] = await db
      .update(ordersTable)
      .set(parsed.data)
      .where(eq(ordersTable.id, req.params.id))
      .returning();
    if (!order) { res.status(404).json({ error: "Not found" }); return; }
    res.json(order);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

router.delete("/orders/:id", async (req, res) => {
  try {
    await db.delete(ordersTable).where(eq(ordersTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

router.delete("/orders", async (req, res) => {
  try {
    await db.delete(ordersTable);
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete all orders" });
  }
});

export default router;
