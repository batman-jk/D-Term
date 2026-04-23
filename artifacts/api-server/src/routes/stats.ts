import { examsTable, getDb, studentsTable, submissionsTable } from "@workspace/db";
import { count, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/stats/overview", async (_req, res): Promise<void> => {
  const db = getDb();
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

  const scoredSubmissions = recentSubmissions.filter((submission) => submission.score !== null);
  const averageScore =
    scoredSubmissions.length > 0
      ? scoredSubmissions.reduce((sum, submission) => sum + (submission.score ?? 0), 0) /
        scoredSubmissions.length
      : 0;

  res.json({
    totalExams: exams.length,
    activeExams: exams.filter((exam) => exam.status === "active").length,
    totalStudents: studentCount?.count ?? 0,
    totalSubmissions: submissionCount?.count ?? 0,
    averageScore,
    recentSubmissions,
  });
});

router.get("/stats/student-performance", async (_req, res): Promise<void> => {
  const db = getDb();
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

      const scoredSubmissions = submissions.filter((submission) => submission.score !== null);
      const averageScore =
        scoredSubmissions.length > 0
          ? scoredSubmissions.reduce((sum, submission) => sum + (submission.score ?? 0), 0) /
            scoredSubmissions.length
          : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
        totalExamsTaken: submissions.length,
        averageScore,
        submissions,
      };
    }),
  );

  res.json(performance);
});

export default router;
