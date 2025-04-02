import express from "express";
import { query, getDocs, where } from "firebase/firestore";
import { Call } from "../models/Call.js";

const router = express.Router();

// Create a new call
router.post("/", async (req, res) => {
  try {
    const newCall = await Call.create(req.body);
    res.status(201).json(newCall);
  } catch (error) {
    console.error("Error creating call:", error);
    res.status(500).json({ error: "Failed to create call" });
  }
});

// Get all calls
router.get("/", async (req, res) => {
  try {
    const calls = await Call.list();
    res.json(calls);
  } catch (error) {
    console.error("Error fetching calls:", error);
    res.status(500).json({ error: "Failed to fetch calls" });
  }
});

// Get a single call by ID
router.get("/:id", async (req, res) => {
  try {
    const call = await Call.get(req.params.id);
    if (call) {
      res.json(call);
    } else {
      res.status(404).json({ error: "Call not found" });
    }
  } catch (error) {
    console.error("Error fetching call:", error);
    res.status(500).json({ error: "Failed to fetch call" });
  }
});

// Update a call
router.put("/:id", async (req, res) => {
  try {
    await Call.update(req.params.id, req.body);
    res.json({ message: "Call updated" });
  } catch (error) {
    console.error("Error updating call:", error);
    res.status(500).json({ error: "Failed to update call" });
  }
});

// Delete a call
router.delete("/:id", async (req, res) => {
  try {
    await Call.delete(req.params.id);
    res.json({ message: "Call deleted" });
  } catch (error) {
    console.error("Error deleting call:", error);
    res.status(500).json({ error: "Failed to delete call" });
  }
});

export default router;
