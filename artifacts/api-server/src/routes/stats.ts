import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, examsTable, studentsTable, submissionsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats/overview", async (_req, res): Promise<void> => {
  const exams = await db.select().from(examsTable);
  const [studentCount] = await db.select({ count: count() }).from(studentsTable);
  const [submissionCount] = await db.select({ count: count() }).from(submissionsTable);

  const recentSubmissions = await db
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
    .orderBy(submissionsTable.submittedAt)
    .limit(5);

  const scoredSubs = recentSubmissions.filter((s) => s.score !== null);
  const avgScore = scoredSubs.length > 0
    ? scoredSubs.reduce((sum, s) => sum + (s.score ?? 0), 0) / scoredSubs.length
    : 0;

  res.json({
    totalExams: exams.length,
    activeExams: exams.filter((e) => e.status === "active").length,
    totalStudents: studentCount?.count ?? 0,
    totalSubmissions: submissionCount?.count ?? 0,
    averageScore: avgScore,
    recentSubmissions,
  });
});

router.get("/stats/student-performance", async (_req, res): Promise<void> => {
  const students = await db.select().from(studentsTable);

  const performance = await Promise.all(
    students.map(async (student) => {
      const submissions = await db
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
        .where(eq(submissionsTable.studentId, student.id))
        .orderBy(submissionsTable.submittedAt);

      const scoredSubs = submissions.filter((s) => s.score !== null);
      const avgScore = scoredSubs.length > 0
        ? scoredSubs.reduce((sum, s) => sum + (s.score ?? 0), 0) / scoredSubs.length
        : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
        totalExamsTaken: submissions.length,
        averageScore: avgScore,
        submissions,
      };
    }),
  );

  res.json(performance);
});

export default router;
