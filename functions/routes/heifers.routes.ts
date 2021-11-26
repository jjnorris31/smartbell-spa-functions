import {Router} from "express";
import * as heifersController from "../controllers/heifers.controller";
const router = Router();

router.get("/:ranchId/heifers", heifersController.getHeifers);

export default router;
