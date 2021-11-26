import {Router} from "express";
// eslint-disable-next-line new-cap
const router = Router();
import * as dashboardController
  from "../controllers/dashboard.controller";

router.get("/:ranchId/dashboard", dashboardController.getDistribution);

export default router;
