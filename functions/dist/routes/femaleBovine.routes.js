"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// eslint-disable-next-line new-cap
const router = express_1.Router();
const femaleBovineController = require("../controllers/femaleBovine.controller");
router.get("/:ranchId/female-bovines/:id", femaleBovineController.getAnimal);
router.get("/:ranchId/female-bovines", femaleBovineController.getAnimals);
router.post("/:ranchId/female-bovines", femaleBovineController.createFemaleBovine);
router.delete("/:ranchId/female-bovines/:id", femaleBovineController.deleteFemaleAnimal);
router.put("/:ranchId/female-bovines/:id", femaleBovineController.updateFemaleBovine);
router.put("/:ranchId/female-bovines", femaleBovineController.updateFemaleBovines);
router.put("/lactationCycle", femaleBovineController.incrementLactationCycle);
exports.default = router;
//# sourceMappingURL=femaleBovine.routes.js.map