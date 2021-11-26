"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// eslint-disable-next-line new-cap
const router = express_1.Router();
const ranchController = require("../controllers/ranch.controller");
const userController = require("../controllers/user.controller");
router.post("/", userController.verifyToken, ranchController.createRanch);
router.get("/", userController.verifyToken, ranchController.getRanches);
router.get("/:id", userController.verifyToken, ranchController.getRanch);
router.put("/:id", userController.verifyToken, ranchController.updateRanch);
router.delete("/:id", userController.verifyToken, ranchController.deleteRanch);
exports.default = router;
//# sourceMappingURL=ranch.routes.js.map