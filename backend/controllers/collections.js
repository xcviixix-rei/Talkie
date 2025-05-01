import express from "express";
import { CollectionModel } from "../models/Collection.js";

const router = express.Router();

// POST /collections/ - Create a new collection
router.post("/", async (req, res) => {
  try {
    const { user_id, name, icon, conversations, created_at } = req.body;
    if (!user_id || !name || !icon) {
      return res
        .status(400)
        .json({ error: "user_id, name, and icon are required." });
    }
    const collection = await CollectionModel.create({
      user_id,
      name,
      icon,
      conversations,
      created_at,
    });
    res.status(201).json(collection);
  } catch (error) {
    console.error("Error creating collection:", error);
    res.status(500).json({ error: "Failed to create collection" });
  }
});

// GET /collections/user/:user_id - Retrieve all collections for a user
router.get("/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const collections = await CollectionModel.listByUser(user_id);
    res.json(collections);
  } catch (error) {
    console.error("Error fetching collections for user:", error);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
});

// GET /collections/:id - Get a specific collection by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await CollectionModel.get(id);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.json(collection);
  } catch (error) {
    console.error("Error fetching collection:", error);
    res.status(500).json({ error: "Failed to fetch collection" });
  }
});

// PUT /collections/:id - Update a collection
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check that a collection exists
    const collection = await CollectionModel.get(id);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    await CollectionModel.update(id, updateData);

    // Get the updated collection
    const updatedCollection = await CollectionModel.get(id);
    res.json(updatedCollection);
  } catch (error) {
    console.error("Error updating collection:", error);
    res.status(500).json({ error: "Failed to update collection" });
  }
});

// DELETE /collections/:id - Delete a collection
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await CollectionModel.delete(id);
    res.json({
      message: `Collection with ID ${id} has been successfully deleted.`,
    });
  } catch (error) {
    console.error("Error deleting collection:", error);
    res.status(500).json({ error: "Failed to delete collection" });
  }
});

export default router;