import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

async function getSettings() {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.id, 1));
  if (!row) {
    const [created] = await db.insert(settingsTable).values({ id: 1 }).returning();
    return created;
  }
  return row;
}

// POST /auth/login — validate admin credentials against DB
router.post("/auth/login", async (req, res) => {
  try {
    const parsed = z.object({ username: z.string(), password: z.string() }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Username dan password diperlukan" });
      return;
    }
    const settings = await getSettings();
    if (
      parsed.data.username === settings.adminUsername &&
      parsed.data.password === settings.adminPasswordHash
    ) {
      res.json({ ok: true });
    } else {
      res.status(401).json({ error: "Username atau password salah" });
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Login gagal" });
  }
});

// POST /auth/update-credentials — update admin username/password
router.post("/auth/update-credentials", async (req, res) => {
  try {
    const parsed = z
      .object({
        currentPassword: z.string(),
        newUsername: z.string().min(1),
        newPassword: z.string().optional(),
      })
      .safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }
    const settings = await getSettings();
    if (parsed.data.currentPassword !== settings.adminPasswordHash) {
      res.status(401).json({ error: "Password saat ini salah" });
      return;
    }
    const [updated] = await db
      .update(settingsTable)
      .set({
        adminUsername: parsed.data.newUsername,
        ...(parsed.data.newPassword ? { adminPasswordHash: parsed.data.newPassword } : {}),
      })
      .where(eq(settingsTable.id, 1))
      .returning();
    res.json({ ok: true, username: updated.adminUsername });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Gagal memperbarui akun" });
  }
});

export default router;
