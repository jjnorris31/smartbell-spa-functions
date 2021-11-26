"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const heifersController = require("../controllers/heifers.controller");
const router = express_1.Router();
router.get("/:ranchId/heifers", heifersController.getHeifers);
exports.default = router;
//# sourceMappingURL=heifers.routes.js.map