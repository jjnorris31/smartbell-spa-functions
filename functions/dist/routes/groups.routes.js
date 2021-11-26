"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const groupController = require("../controllers/group.controller");
const cows_routes_1 = require("./cows.routes");
cows_routes_1.default.get("/:ranchId/groups/:id", groupController.getGroup);
cows_routes_1.default.get("/:ranchId/groups", groupController.getGroups);
cows_routes_1.default.delete("/:ranchId/groups/:id", groupController.deleteGroup);
cows_routes_1.default.post("/:ranchId/groups", groupController.checkUniqueGroupName, groupController.createGroup);
cows_routes_1.default.post("/groups/default", groupController.createDefaultGroup);
cows_routes_1.default.put("/:ranchId/groups/:id", groupController.updateGroup);
exports.default = cows_routes_1.default;
//# sourceMappingURL=groups.routes.js.map