import {Router} from "express";
// eslint-disable-next-line new-cap
const router = Router();
import * as ranchController from "../controllers/ranch.controller";
import * as userController from "../controllers/user.controller";

router.post("/", userController.verifyToken, ranchController.createRanch);
router.get("/", userController.verifyToken, ranchController.getRanches);
router.get("/:id", userController.verifyToken, ranchController.getRanch);
router.put("/:id", userController.verifyToken, ranchController.updateRanch);
router.delete("/:id", userController.verifyToken, ranchController.deleteRanch);

export default router;
