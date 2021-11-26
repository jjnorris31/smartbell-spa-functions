"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const algoliaController = require("../controllers/algolia.controller.js");
router.post("/", algoliaController.indexData);
exports.default = router;
//# sourceMappingURL=algolia.routes.js.map