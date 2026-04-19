import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, resourcesTable } from "@workspace/db";
import {
  CreateResourceBody,
  DeleteResourceParams,
  ListResourcesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/resources", async (req, res): Promise<void> => {
  const parsed = ListResourcesQueryParams.safeParse(req.query);
  const examId = parsed.success ? parsed.data.examId : undefined;

  const resources = await db
    .select()
    .from(resourcesTable)
    .orderBy(resourcesTable.createdAt);

  const filtered = examId ? resources.filter((r) => r.examId === examId) : resources;
  res.json(filtered);
});

router.post("/resources", async (req, res): Promise<void> => {
  const parsed = CreateResourceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [resource] = await db.insert(resourcesTable).values(parsed.data).returning();
  res.status(201).json(resource);
});

router.delete("/resources/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteResourceParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(resourcesTable).where(eq(resourcesTable.id, params.data.id));
  res.status(200).json({ success: true });
});

export default router;
