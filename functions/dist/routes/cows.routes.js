"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cowController = require("../controllers/cow.controller");
const router = express_1.Router();
router.get("/:ranchId/cows", cowController.getCows);
exports.default = router;
//# sourceMappingURL=cows.routes.js.map