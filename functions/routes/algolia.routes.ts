import {Router} from "express";
const router = Router();
import * as algoliaController from "../controllers/algolia.controller.js";

router.post(
    "/",
    algoliaController.indexData);

export default router;
