import express from "express";
import { Theme } from "../models/Theme.js";

const router = express.Router();

// POST /themes - Create a new theme
router.post("/", async (req, res) => {
  try {
    const themeData = req.body;
    if (!themeData.theme_name) {
      return res.status(400).json({ error: "theme_name is required" });
    }
    const newTheme = await Theme.create(themeData);
    res.status(201).json(newTheme);
  } catch (error) {
    console.error("Error creating theme:", error);
    res.status(500).json({ error: "Failed to create theme" });
  }
});

// GET /themes - List all themes
router.get("/", async (req, res) => {
  try {
    const themes = await Theme.list();
    res.json(themes);
  } catch (error) {
    console.error("Error fetching themes:", error);
    res.status(500).json({ error: "Failed to fetch themes" });
  }
});

// GET /themes/:theme_name - Get a specific theme by theme_name
router.get("/:theme_name", async (req, res) => {
  try {
    const { theme_name } = req.params;
    const theme = await Theme.get(theme_name);
    if (!theme) {
      return res.status(404).json({ error: "Theme not found" });
    }
    res.json(theme);
  } catch (error) {
    console.error("Error fetching theme:", error);
    res.status(500).json({ error: "Failed to fetch theme" });
  }
});

// PUT /themes/:theme_name - Update a theme
router.put("/:theme_name", async (req, res) => {
  try {
    const { theme_name } = req.params;
    const updateData = req.body;
    // Check that the theme exists
    const theme = await Theme.get(theme_name);
    if (!theme) {
      return res.status(404).json({ error: "Theme not found" });
    }
    await Theme.update(theme_name, updateData);
    const updatedTheme = await Theme.get(theme_name);
    res.json(updatedTheme);
  } catch (error) {
    console.error("Error updating theme:", error);
    res.status(500).json({ error: "Failed to update theme" });
  }
});

// DELETE /themes/:theme_name - Delete a theme
router.delete("/:theme_name", async (req, res) => {
  try {
    const { theme_name } = req.params;
    await Theme.delete(theme_name);
    res.json({ message: `Theme ${theme_name} has been successfully deleted.` });
  } catch (error) {
    console.error("Error deleting theme:", error);
    res.status(500).json({ error: "Failed to delete theme" });
  }
});

export default router;