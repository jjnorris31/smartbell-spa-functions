import {Router} from "express";
// eslint-disable-next-line new-cap
const router = Router();
import * as userController from "../controllers/user.controller";

router.post("/", userController.verifyToken, userController.createUser);
router.get("/", userController.verifyToken, userController.getUser);
router.post("/claims", userController.verifyToken, userController.setClaims);

export default router;
