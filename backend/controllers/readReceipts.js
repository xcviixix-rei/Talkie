import express from "express";
import { ReadReceipt } from "../models/ReadReceipt.js";

const router = express.Router();

// Create a new read receipt
router.post("/", async (req, res) => {
  try {
    const newReadReceipt = await ReadReceipt.create(req.body);
    res.status(201).json(newReadReceipt);
  } catch (error) {
    console.error("Error creating read receipt:", error);
    res.status(500).json({ error: "Failed to create read receipt" });
  }
});

// Get all read receipts
router.get("/", async (req, res) => {
  try {
    const readReceipts = await ReadReceipt.list();
    res.json(readReceipts);
  } catch (error) {
    console.error("Error fetching read receipts:", error);
    res.status(500).json({ error: "Failed to fetch read receipts" });
  }
});

// Get a single read receipt by ID
router.get("/:id", async (req, res) => {
  try {
    const readReceipt = await ReadReceipt.get(req.params.id);
    if (readReceipt) {
      res.json(readReceipt);
    } else {
      res.status(404).json({ error: "Read receipt not found" });
    }
  } catch (error) {
    console.error("Error fetching read receipt:", error);
    res.status(500).json({ error: "Failed to fetch read receipt" });
  }
});

// Update a read receipt
router.put("/:id", async (req, res) => {
  try {
    await ReadReceipt.update(req.params.id, req.body);
    res.json({ message: "Read receipt updated" });
  } catch (error) {
    console.error("Error updating read receipt:", error);
    res.status(500).json({ error: "Failed to update read receipt" });
  }
});

// Delete a read receipt
router.delete("/:id", async (req, res) => {
  try {
    await ReadReceipt.delete(req.params.id);
    res.json({ message: "Read receipt deleted" });
  } catch (error) {
    console.error("Error deleting read receipt:", error);
    res.status(500).json({ error: "Failed to delete read receipt" });
  }
});

export default router;
