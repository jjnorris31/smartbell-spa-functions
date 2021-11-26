"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// eslint-disable-next-line new-cap
const router = express_1.Router();
const dashboardController = require("../controllers/dashboard.controller");
router.get("/:ranchId/dashboard", dashboardController.getDistribution);
exports.default = router;
//# sourceMappingURL=dasboard.routes.js.map