import express from "express";
import {
  createMessage,
  getMessages,
  updateMessage,
  deleteMessage,
} from "../controllers/chatMessage.js";

const router = express.Router();

router.post("/", createMessage);
router.get("/:chatRoomId", getMessages);
router.patch("/:messageId", updateMessage);
router.delete("/:messageId", deleteMessage);

export default router;
