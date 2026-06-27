import { Router } from "express";
import { db, couponsTable, insertCouponSchema, updateCouponSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/coupons", async (req, res) => {
  try {
    const coupons = await db.select().from(couponsTable).orderBy(couponsTable.createdAt);
    res.json(coupons);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

router.post("/coupons", async (req, res) => {
  try {
    const parsed = insertCouponSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }
    const [coupon] = await db.insert(couponsTable).values(parsed.data).returning();
    res.status(201).json(coupon);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

router.put("/coupons/:id", async (req, res) => {
  try {
    const parsed = updateCouponSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }
    const [coupon] = await db
      .update(couponsTable)
      .set(parsed.data)
      .where(eq(couponsTable.id, req.params.id))
      .returning();
    if (!coupon) { res.status(404).json({ error: "Not found" }); return; }
    res.json(coupon);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

router.delete("/coupons/:id", async (req, res) => {
  try {
    await db.delete(couponsTable).where(eq(couponsTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

export default router;
