import {Router} from "express";
// eslint-disable-next-line new-cap
const router = Router();
import * as eventController from "../controllers/event.controller";

// router.post("/", bullController.createBull);
router.post("/heat", eventController.createHeatEvent);
router.post("/calving", eventController.createCalvingEvent);
router.post("/pregnant", eventController.createPregnantEvent);
router.get("/calving", eventController.getLastCalvingEvent);
// router.put("/:id", userController.verifyToken, ranchController.updateRanch);
// router.delete("/:id", userController.verifyToken,
// ranchController.deleteRanch);

export default router;
