import express from "express";
import { query, getDocs, where } from "firebase/firestore";
import { Message } from "../models/Message.js";

const router = express.Router();

// Create a new message
router.post("/", async (req, res) => {
  try {
    const newMessage = await Message.create(req.body);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Failed to create message" });
  }
});

// Get all messages
router.get("/", async (req, res) => {
  try {
    const messages = await Message.list();
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Get a single message by ID
router.get("/:id", async (req, res) => {
  try {
    const message = await Message.get(req.params.id);
    if (message) {
      res.json(message);
    } else {
      res.status(404).json({ error: "Message not found" });
    }
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({ error: "Failed to fetch message" });
  }
});

// Update a message
router.put("/:id", async (req, res) => {
  try {
    await Message.update(req.params.id, req.body);
    res.json({ message: "Message updated" });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ error: "Failed to update message" });
  }
});

// Delete a message
router.delete("/:id", async (req, res) => {
  try {
    await Message.delete(req.params.id);
    res.json({ message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

export default router;