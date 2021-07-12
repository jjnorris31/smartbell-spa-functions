import {Router} from "express";
// eslint-disable-next-line new-cap
const router = Router();
import * as eventController from "../controllers/event.controller";

// router.post("/", bullController.createBull);
router.post("/heat", eventController.checkAnimalExist, eventController.createHeatEvent);
router.post("/calving", eventController.checkAnimalExist, eventController.createCalvingEvent);
router.post("/pregnant", eventController.checkAnimalExist, eventController.createPregnantEvent);
router.get("/calving", eventController.getLastCalvingEvent);
router.get("/heat/lactationCycle",
    eventController.getHeatEventsByLactationCycle);
router.get("/pregnant/lactationCycle",
    eventController.getPregnantEventsByLactationCycle);

router.get("/heat/all", eventController.checkAnimalExist, eventController.getHeatEvents);
router.get("/pregnant/all", eventController.checkAnimalExist, eventController.getPregnantEvents);
router.get("/calving/all", eventController.checkAnimalExist, eventController.getCalvingEvents);

export default router;
