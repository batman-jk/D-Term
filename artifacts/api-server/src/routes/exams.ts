import {
  CreateExamBody,
  DeleteExamParams,
  GenerateExamCodeParams,
  GetExamParams,
  JoinExamBody,
  ListExamsQueryParams,
  UpdateExamBody,
  UpdateExamParams,
} from "@workspace/api-zod";
import {
  examsTable,
  getDb,
  questionsTable,
  studentsTable,
  submissionsTable,
} from "@workspace/db";
import { count, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

router.get("/exams", async (req, res): Promise<void> => {
  const db = getDb();
  const query = ListExamsQueryParams.safeParse(req.query);
  const status = query.success ? query.data.status : undefined;

  const exams = await db.select().from(examsTable).orderBy(examsTable.createdAt);
  const filtered = status ? exams.filter((exam) => exam.status === status) : exams;

  const withCounts = await Promise.all(
    filtered.map(async (exam) => {
      const [questionCount] = await db
        .select({ count: count() })
        .from(questionsTable)
        .where(eq(questionsTable.examId, exam.id));
      const [submissionCount] = await db
        .select({ count: count() })
        .from(submissionsTable)
        .where(eq(submissionsTable.examId, exam.id));

      return {
        ...exam,
        questionCount: questionCount?.count ?? 0,
        submissionCount: submissionCount?.count ?? 0,
      };
    }),
  );

  res.json(withCounts);
});

router.post("/exams", async (req, res): Promise<void> => {
  const db = getDb();
  const parsed = CreateExamBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [exam] = await db.insert(examsTable).values(parsed.data).returning();
  res.status(201).json({ ...exam, questionCount: 0, submissionCount: 0 });
});

router.post("/exams/join", async (req, res): Promise<void> => {
  const db = getDb();
  const parsed = JoinExamBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { code, studentId } = parsed.data;
  const [exam] = await db
    .select()
    .from(examsTable)
    .where(eq(examsTable.secretCode, code));

  if (!exam) {
    res.status(404).json({ error: "Invalid exam code" });
    return;
  }

  if (exam.status !== "active") {
    res.status(403).json({ error: "Exam is not active" });
    return;
  }

  const [student] = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.id, studentId));

  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const questions = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.examId, exam.id))
    .orderBy(questionsTable.orderIndex);

  res.json({ ...exam, questions });
});

router.get("/exams/:id", async (req, res): Promise<void> => {
  const db = getDb();
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetExamParams.safeParse({ id: parseInt(raw, 10) });

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [exam] = await db
    .select()
    .from(examsTable)
    .where(eq(examsTable.id, params.data.id));

  if (!exam) {
    res.status(404).json({ error: "Exam not found" });
    return;
  }

  const [questionCount] = await db
    .select({ count: count() })
    .from(questionsTable)
    .where(eq(questionsTable.examId, exam.id));
  const [submissionCount] = await db
    .select({ count: count() })
    .from(submissionsTable)
    .where(eq(submissionsTable.examId, exam.id));

  res.json({
    ...exam,
    questionCount: questionCount?.count ?? 0,
    submissionCount: submissionCount?.count ?? 0,
  });
});

router.patch("/exams/:id", async (req, res): Promise<void> => {
  const db = getDb();
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateExamParams.safeParse({ id: parseInt(raw, 10) });

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateExamBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [exam] = await db
    .update(examsTable)
    .set(parsed.data)
    .where(eq(examsTable.id, params.data.id))
    .returning();

  if (!exam) {
    res.status(404).json({ error: "Exam not found" });
    return;
  }

  const [questionCount] = await db
    .select({ count: count() })
    .from(questionsTable)
    .where(eq(questionsTable.examId, exam.id));
  const [submissionCount] = await db
    .select({ count: count() })
    .from(submissionsTable)
    .where(eq(submissionsTable.examId, exam.id));

  res.json({
    ...exam,
    questionCount: questionCount?.count ?? 0,
    submissionCount: submissionCount?.count ?? 0,
  });
});

router.delete("/exams/:id", async (req, res): Promise<void> => {
  const db = getDb();
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteExamParams.safeParse({ id: parseInt(raw, 10) });

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(examsTable).where(eq(examsTable.id, params.data.id));
  res.status(200).json({ success: true });
});

router.post("/exams/:id/generate-code", async (req, res): Promise<void> => {
  const db = getDb();
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GenerateExamCodeParams.safeParse({ id: parseInt(raw, 10) });

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let exam: typeof examsTable.$inferSelect | null = null;
  let code = "";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    code = generateCode();

    const [existing] = await db
      .select({ id: examsTable.id })
      .from(examsTable)
      .where(eq(examsTable.secretCode, code));

    if (existing) {
      continue;
    }

    [exam] = await db
      .update(examsTable)
      .set({ secretCode: code })
      .where(eq(examsTable.id, params.data.id))
      .returning();
    break;
  }

  if (!exam) {
    res.status(404).json({ error: "Exam not found or code could not be generated" });
    return;
  }

  res.json({ code, examId: exam.id });
});

export default router;
