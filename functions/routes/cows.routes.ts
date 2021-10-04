import {Router} from "express";
import * as cowController from "../controllers/cow.controller";
const router = Router();

router.get("/:ranchId/cows",
  cowController.getCows)

export default router;