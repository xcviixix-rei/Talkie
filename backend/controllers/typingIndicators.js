import express from "express";
import { TypingIndicator } from "../models/TypingIndicator.js";

const router = express.Router();

// Create a new typing indicator
router.post("/", async (req, res) => {
  try {
    const newTypingIndicator = await TypingIndicator.create(req.body);
    res.status(201).json(newTypingIndicator);
  } catch (error) {
    console.error("Error creating typing indicator:", error);
    res.status(500).json({ error: "Failed to create typing indicator" });
  }
});

// Get all typing indicators
router.get("/", async (req, res) => {
  try {
    const typingIndicators = await TypingIndicator.list();
    res.json(typingIndicators);
  } catch (error) {
    console.error("Error fetching typing indicators:", error);
    res.status(500).json({ error: "Failed to fetch typing indicators" });
  }
});

// Get a single typing indicator by ID
router.get("/:id", async (req, res) => {
  try {
    const typingIndicator = await TypingIndicator.get(req.params.id);
    if (typingIndicator) {
      res.json(typingIndicator);
    } else {
      res.status(404).json({ error: "Typing indicator not found" });
    }
  } catch (error) {
    console.error("Error fetching typing indicator:", error);
    res.status(500).json({ error: "Failed to fetch typing indicator" });
  }
});

// Update a typing indicator
router.put("/:id", async (req, res) => {
  try {
    await TypingIndicator.update(req.params.id, req.body);
    res.json({ message: "Typing indicator updated" });
  } catch (error) {
    console.error("Error updating typing indicator:", error);
    res.status(500).json({ error: "Failed to update typing indicator" });
  }
});

// Delete a typing indicator
router.delete("/:id", async (req, res) => {
  try {
    await TypingIndicator.delete(req.params.id);
    res.json({ message: "Typing indicator deleted" });
  } catch (error) {
    console.error("Error deleting typing indicator:", error);
    res.status(500).json({ error: "Failed to delete typing indicator" });
  }
});

export default router;
