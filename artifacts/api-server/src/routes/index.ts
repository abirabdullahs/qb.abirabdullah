import { Router, type IRouter } from "express";
import healthRouter from "./health";
import academicRouter from "./academic";
import admissionRouter from "./admission";
import questionsRouter from "./questions";
import questionSetsRouter from "./question-sets";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(academicRouter);
router.use(admissionRouter);
router.use(questionsRouter);
router.use(questionSetsRouter);
router.use(dashboardRouter);

export default router;
