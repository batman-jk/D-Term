import { Router, type IRouter } from "express";
import healthRouter from "./health";
import examsRouter from "./exams";
import questionsRouter from "./questions";
import submissionsRouter from "./submissions";
import resourcesRouter from "./resources";
import studentsRouter from "./students";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(examsRouter);
router.use(questionsRouter);
router.use(submissionsRouter);
router.use(resourcesRouter);
router.use(studentsRouter);
router.use(statsRouter);

export default router;
