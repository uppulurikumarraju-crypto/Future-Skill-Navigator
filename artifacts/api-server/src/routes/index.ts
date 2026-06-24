import { Router, type IRouter } from "express";
import healthRouter from "./health";
import skillsRouter from "./skills";
import rolesRouter from "./roles";
import profileRouter from "./profile";
import roadmapRouter from "./roadmap";
import assessmentRouter from "./assessment";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(skillsRouter);
router.use(rolesRouter);
router.use(profileRouter);
router.use(roadmapRouter);
router.use(assessmentRouter);
router.use(dashboardRouter);

export default router;
