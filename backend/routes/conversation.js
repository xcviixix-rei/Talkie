import express from "express";
import {
  createConversation,
  getUserConversations,
  deleteConversation,
  addUserToConversation,
  summaryMessage,
  removeUserFromConversation,
} from "../controllers/conversationController.js";

const router = express.Router();
router.post("/", createConversation);
router.get("/:userId", getUserConversations);
router.post("/:conversationId/addUser", addUserToConversation);
router.get("/:userId/:conversationId", summaryMessage);
router.delete(
  "/:conversationId/removeUser/:userId",
  removeUserFromConversation
);
router.delete("/:conversationId", deleteConversation);

export default router;
