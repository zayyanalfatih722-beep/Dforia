import { Router } from "express";
import { db, bannersTable, insertBannerSchema, updateBannerSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/banners", async (req, res) => {
  try {
    const banners = await db.select().from(bannersTable).orderBy(bannersTable.sortOrder);
    res.json(banners);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
});

router.post("/banners", async (req, res) => {
  try {
    const parsed = insertBannerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }
    const [banner] = await db.insert(bannersTable).values(parsed.data).returning();
    res.status(201).json(banner);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create banner" });
  }
});

router.put("/banners/:id", async (req, res) => {
  try {
    const parsed = updateBannerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }
    const [banner] = await db
      .update(bannersTable)
      .set(parsed.data)
      .where(eq(bannersTable.id, req.params.id))
      .returning();
    if (!banner) { res.status(404).json({ error: "Not found" }); return; }
    res.json(banner);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update banner" });
  }
});

router.delete("/banners/:id", async (req, res) => {
  try {
    await db.delete(bannersTable).where(eq(bannersTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete banner" });
  }
});

export default router;
