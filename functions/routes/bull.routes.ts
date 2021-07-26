import {Router} from "express";
// eslint-disable-next-line new-cap
const router = Router();
import * as bullController from "../controllers/bull.controller";

router.post("/", bullController.createBull);
router.get("/all", bullController.getAllBulls);
router.get("/", bullController.getBull);
router.put("/", bullController.checkDuplicatedBull, bullController.updateBull);
// router.get("/:id", userController.verifyToken, ranchController.getRanch);
// router.put("/:id", userController.verifyToken, ranchController.updateRanch);
// router.delete("/:id", userController.verifyToken,
// ranchController.deleteRanch);

export default router;
