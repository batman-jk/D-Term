import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, submissionsTable, studentsTable, examsTable } from "@workspace/db";
import {
  CreateSubmissionBody,
  UpdateSubmissionScoreParams,
  UpdateSubmissionScoreBody,
  ListSubmissionsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/submissions", async (req, res): Promise<void> => {
  const parsed = ListSubmissionsQueryParams.safeParse(req.query);
  const examId = parsed.success ? parsed.data.examId : undefined;

  const rows = await db
    .select({
      id: submissionsTable.id,
      examId: submissionsTable.examId,
      studentId: submissionsTable.studentId,
      answers: submissionsTable.answers,
      score: submissionsTable.score,
      submittedAt: submissionsTable.submittedAt,
      studentName: studentsTable.name,
      examTitle: examsTable.title,
    })
    .from(submissionsTable)
    .leftJoin(studentsTable, eq(submissionsTable.studentId, studentsTable.id))
    .leftJoin(examsTable, eq(submissionsTable.examId, examsTable.id))
    .orderBy(submissionsTable.submittedAt);

  const filtered = examId ? rows.filter((r) => r.examId === examId) : rows;
  res.json(filtered);
});

router.post("/submissions", async (req, res): Promise<void> => {
  const parsed = CreateSubmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { examId, studentId, answers } = parsed.data;

  const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, examId));
  if (!exam) {
    res.status(404).json({ error: "Exam not found" });
    return;
  }

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const [submission] = await db
    .insert(submissionsTable)
    .values({ examId, studentId, answers })
    .returning();

  res.status(201).json({
    ...submission,
    studentName: student.name,
    examTitle: exam.title,
  });
});

router.patch("/submissions/:id/score", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateSubmissionScoreParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSubmissionScoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [submission] = await db
    .update(submissionsTable)
    .set({ score: parsed.data.score })
    .where(eq(submissionsTable.id, params.data.id))
    .returning();

  if (!submission) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, submission.studentId));
  const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, submission.examId));

  res.json({
    ...submission,
    studentName: student?.name ?? "Unknown",
    examTitle: exam?.title ?? "Unknown",
  });
});

export default router;
