import express from "express";
import { getInformation, updateInformation } from "../controllers/user.js";

const router = express.Router();

router.get("/:userId", getInformation);
router.post("/:userId", updateInformation);

export default router;
