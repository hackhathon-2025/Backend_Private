import { Router } from "express";
import { createGroup, getPublicGroups } from "../controllers/groupController.js";

const router = Router();

router.post("/", createGroup);
router.get("/", getPublicGroups);

export default router;
