import { Router } from "express";
import { db, menuItemsTable, insertMenuItemSchema } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

const router = Router();

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

async function resetQuotaIfNewDay(items: typeof menuItemsTable.$inferSelect[]) {
  const today = getTodayDate();
  const staleIds = items
    .filter(i => i.quotaResetDate !== today && i.dailyQuota > 0)
    .map(i => i.id);

  if (staleIds.length === 0) return items;

  await db
    .update(menuItemsTable)
    .set({ soldToday: 0, quotaResetDate: today })
    .where(inArray(menuItemsTable.id, staleIds));

  return items.map(i =>
    staleIds.includes(i.id) ? { ...i, soldToday: 0, quotaResetDate: today } : i
  );
}

router.get("/menu", async (req, res) => {
  try {
    let items = await db.select().from(menuItemsTable).orderBy(menuItemsTable.createdAt);
    items = await resetQuotaIfNewDay(items);
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

router.post("/menu", async (req, res) => {
  try {
    const parsed = insertMenuItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }
    const data = {
      ...parsed.data,
      dailyQuota: parsed.data.dailyQuota ?? 0,
      soldToday: 0,
      quotaResetDate: getTodayDate(),
    };
    const [item] = await db.insert(menuItemsTable).values(data).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create menu item" });
  }
});

// POST /menu/sold — increment soldToday for ordered items, auto-close when quota full
router.post("/menu/sold", async (req, res) => {
  try {
    const bodySchema = z.object({
      items: z.array(z.object({ id: z.string(), quantity: z.number().int().positive() })),
    });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }

    const today = getTodayDate();
    const ids = parsed.data.items.map((i: { id: string }) => i.id);
    const dbItems = await db
      .select()
      .from(menuItemsTable)
      .where(inArray(menuItemsTable.id, ids));

    const updated = [];
    for (const ordered of parsed.data.items) {
      const item = dbItems.find(i => i.id === ordered.id);
      if (!item) continue;

      const soldToday = (item.quotaResetDate === today ? item.soldToday : 0) + ordered.quantity;
      const isFull = item.dailyQuota > 0 && soldToday >= item.dailyQuota;

      const [updatedItem] = await db
        .update(menuItemsTable)
        .set({
          soldToday,
          quotaResetDate: today,
          isAvailable: isFull ? false : item.isAvailable,
        })
        .where(eq(menuItemsTable.id, ordered.id))
        .returning();
      updated.push(updatedItem);
    }

    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to record sold items" });
  }
});

const partialMenuItemSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  image: z.string().optional(),
  category: z.string().optional(),
  rating: z.number().optional(),
  isBestSeller: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  dailyQuota: z.number().optional(),
  soldToday: z.number().optional(),
  quotaResetDate: z.string().optional(),
});

router.put("/menu/:id", async (req, res) => {
  try {
    const parsed = partialMenuItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }
    const [item] = await db
      .update(menuItemsTable)
      .set(parsed.data)
      .where(eq(menuItemsTable.id, req.params.id))
      .returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update menu item" });
  }
});

router.delete("/menu/:id", async (req, res) => {
  try {
    await db.delete(menuItemsTable).where(eq(menuItemsTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete menu item" });
  }
});

export default router;
