"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const bullController = require("../controllers/bull.controller");
router.post("/:ranchId/bulls", bullController.checkUniqueInternalId, bullController.checkUniqueName, bullController.checkUniqueSiniigaId, bullController.createBull);
router.get("/:ranchId/bulls", bullController.getBulls);
router.get("/:ranchId/bulls/:bullId", bullController.getBull);
router.put("/:ranchId/bulls/:bullId", bullController.checkUniqueInternalId, bullController.checkUniqueName, bullController.checkUniqueSiniigaId, bullController.updateBull);
router.delete("/:ranchId/bulls/:bullId", bullController.checkBelongsRanch, bullController.deleteBull);
exports.default = router;
//# sourceMappingURL=bulls.routes.js.map