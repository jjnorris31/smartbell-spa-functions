import {Router} from "express";
// eslint-disable-next-line new-cap
const router = Router();
import * as femaleBovineController
  from "../controllers/femaleBovine.controller";

router.get("/:ranchId/female-bovines/:id", femaleBovineController.getAnimal);

router.get("/:ranchId/female-bovines", femaleBovineController.getAnimals);


router.post("/:ranchId/female-bovines",
    femaleBovineController.createFemaleBovine);

router.delete("/:ranchId/female-bovines/:id",
    femaleBovineController.deleteFemaleAnimal);

router.put("/:ranchId/female-bovines/:id",
    femaleBovineController.updateFemaleBovine);

router.put("/:ranchId/female-bovines", femaleBovineController.updateFemaleBovines);


router.put("/lactationCycle", femaleBovineController.incrementLactationCycle);

export default router;
