import {Router} from "express";
const router = Router();
import * as bullController from "../controllers/bull.controller";

router.post(
  "/:ranchId/bulls",
  bullController.checkUniqueInternalId,
  bullController.checkUniqueName,
  bullController.checkUniqueSiniigaId,
  bullController.createBull);

router.get("/:ranchId/bulls", bullController.getBulls);

router.get(
  "/:ranchId/bulls/:bullId", bullController.getBull);

router.put("/:ranchId/bulls/:bullId",
  bullController.checkUniqueInternalId,
  bullController.checkUniqueName,
  bullController.checkUniqueSiniigaId,
  bullController.updateBull);

router.delete(
  "/:ranchId/bulls/:bullId",
  bullController.checkBelongsRanch,
  bullController.deleteBull);

export default router;
