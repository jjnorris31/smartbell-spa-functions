import {Router} from "express";
// eslint-disable-next-line new-cap
const router = Router();
import * as femaleBovineController
  from "../controllers/femaleBovine.controller";

router.post("/", femaleBovineController.createFemaleBovine);
router.put("/lactationCycle", femaleBovineController.incrementLactationCycle);
router.get("/", femaleBovineController.getAnimal);
// router.get("/:id", userController.verifyToken, ranchController.getRanch);
// router.put("/:id", userController.verifyToken, ranchController.updateRanch);
// router.delete("/:id", userController.verifyToken,
// ranchController.deleteRanch);

export default router;
