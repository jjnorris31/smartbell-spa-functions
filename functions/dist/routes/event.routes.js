"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// eslint-disable-next-line new-cap
const router = express_1.Router();
const eventController = require("../controllers/event.controller");
// router.post("/", bullController.createBull);
router.post("/heat", eventController.checkAnimalExist, eventController.createHeatEvent);
router.post("/calving", eventController.checkAnimalExist, eventController.createCalvingEvent);
router.post("/pregnant", eventController.checkAnimalExist, eventController.createPregnantEvent);
router.get("/calving", eventController.getLastCalvingEvent);
router.get("/heat/lactationCycle", eventController.getHeatEventsByLactationCycle);
router.get("/pregnant/lactationCycle", eventController.getPregnantEventsByLactationCycle);
router.get("/heat/all", eventController.checkAnimalExist, eventController.getHeatEvents);
router.get("/pregnant/all", eventController.checkAnimalExist, eventController.getPregnantEvents);
router.get("/calving/all", eventController.checkAnimalExist, eventController.getCalvingEvents);
router.post("/heat/update", eventController.updateHeatStatus);
exports.default = router;
//# sourceMappingURL=event.routes.js.map