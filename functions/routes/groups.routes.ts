import * as groupController from "../controllers/group.controller";
import router from "./cows.routes";

router.get("/:ranchId/groups/:id",
    groupController.getGroup);

router.get("/:ranchId/groups",
    groupController.getGroups);

router.delete("/:ranchId/groups/:id",
    groupController.deleteGroup);

router.post("/:ranchId/groups",
    groupController.checkUniqueGroupName,
    groupController.createGroup);

router.post("/groups/default", groupController.createDefaultGroup);

router.put("/:ranchId/groups/:id", groupController.updateGroup);

export default router;
