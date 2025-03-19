import express from "express";
import { Conversation } from "../models/Conversation.js";

const router = express.Router();

// Create a new conversation
router.post("/", async (req, res) => {
  try {
    const newConversation = await Conversation.create(req.body);
    res.status(201).json(newConversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Get all conversations
router.get("/", async (req, res) => {
  try {
    const conversations = await Conversation.list();
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get a single conversation by ID
router.get("/:id", async (req, res) => {
  try {
    const conversation = await Conversation.get(req.params.id);
    if (conversation) {
      res.json(conversation);
    } else {
      res.status(404).json({ error: "Conversation not found" });
    }
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

// Update a conversation
router.put("/:id", async (req, res) => {
  try {
    await Conversation.update(req.params.id, req.body);
    res.json({ message: "Conversation updated" });
  } catch (error) {
    console.error("Error updating conversation:", error);
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

// Delete a conversation
router.delete("/:id", async (req, res) => {
  try {
    await Conversation.delete(req.params.id);
    res.json({ message: "Conversation deleted" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

export default router;