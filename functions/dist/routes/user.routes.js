"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// eslint-disable-next-line new-cap
const router = express_1.Router();
const userController = require("../controllers/user.controller");
router.post("/", userController.verifyToken, userController.createUser);
router.get("/", userController.verifyToken, userController.getUser);
router.put("/", userController.verifyToken, userController.updateUser);
router.post("/claims", userController.verifyToken, userController.setClaims);
exports.default = router;
//# sourceMappingURL=user.routes.js.map