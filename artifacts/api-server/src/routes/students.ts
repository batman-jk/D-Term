import { CreateStudentBody, ListStudentsResponse } from "@workspace/api-zod";
import { getDb, studentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/students", async (_req, res): Promise<void> => {
  const db = getDb();
  const students = await db.select().from(studentsTable).orderBy(studentsTable.createdAt);
  res.json(ListStudentsResponse.parse(students));
});

router.post("/students", async (req, res): Promise<void> => {
  const db = getDb();
  const parsed = CreateStudentBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.rollNumber, parsed.data.rollNumber));

  if (existing.length > 0) {
    res.json(existing[0]);
    return;
  }

  const [student] = await db.insert(studentsTable).values(parsed.data).returning();
  res.status(201).json(student);
});

export default router;
