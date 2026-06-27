import { Router } from "express";
import { db, settingsTable, updateSettingsSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

async function ensureSettings() {
  const [existing] = await db.select().from(settingsTable).where(eq(settingsTable.id, 1));
  if (!existing) {
    const [created] = await db.insert(settingsTable).values({ id: 1 }).returning();
    return created;
  }
  return existing;
}

router.get("/settings", async (req, res) => {
  try {
    const s = await ensureSettings();
    res.json(s);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/settings", async (req, res) => {
  try {
    const parsed = updateSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }
    await ensureSettings();
    const [s] = await db
      .update(settingsTable)
      .set(parsed.data)
      .where(eq(settingsTable.id, 1))
      .returning();
    res.json(s);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
