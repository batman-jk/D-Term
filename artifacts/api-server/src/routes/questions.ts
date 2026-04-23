import {
  CreateQuestionBody,
  DeleteQuestionParams,
  ListQuestionsQueryParams,
} from "@workspace/api-zod";
import { getDb, questionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/questions", async (req, res): Promise<void> => {
  const db = getDb();
  const parsed = ListQuestionsQueryParams.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const questions = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.examId, parsed.data.examId))
    .orderBy(questionsTable.orderIndex);

  res.json(questions);
});

router.post("/questions", async (req, res): Promise<void> => {
  const db = getDb();
  const parsed = CreateQuestionBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [question] = await db.insert(questionsTable).values(parsed.data).returning();
  res.status(201).json(question);
});

router.delete("/questions/:id", async (req, res): Promise<void> => {
  const db = getDb();
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteQuestionParams.safeParse({ id: parseInt(raw, 10) });

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(questionsTable).where(eq(questionsTable.id, params.data.id));
  res.status(200).json({ success: true });
});

export default router;
