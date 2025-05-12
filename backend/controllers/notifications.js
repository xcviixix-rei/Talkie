import express from "express";
import { query, getDocs, where } from "firebase/firestore";
import { Notification } from "../models/Notification.js";

const router = express.Router();

// Create a new notification
router.post("/", async (req, res) => {
  try {
    const newNotification = await Notification.create(req.body);
    res.status(201).json(newNotification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// For Firebase push notifications FCM
router.post('/register-device', async (req, res) => {
    const { userId, deviceToken, platform } = req.body; // platform could be 'firebase'

    if (!userId || !deviceToken || !platform) {
        return res.status(400).send('userId, deviceToken, and platform are required.');
    }

    try {
        // For Video, push config is usually done on GetStream dashboard
        // But adding the device to the user is good practice
        await serverClient.addDevice(deviceToken, platform === 'firebase' ? 'firebase' : 'apn', userId);
        console.log(`Device ${deviceToken} registered for user ${userId}`);
        res.status(200).send('Device registered successfully.');
    } catch (error) {
        console.error('Error registering device:', error);
        res.status(500).send('Failed to register device.');
    }
});

// Get all notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.list();
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Get a single notification by ID
router.get("/:id", async (req, res) => {
  try {
    const notification = await Notification.get(req.params.id);
    if (notification) {
      res.json(notification);
    } else {
      res.status(404).json({ error: "Notification not found" });
    }
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({ error: "Failed to fetch notification" });
  }
});

// Update a notification
router.put("/:id", async (req, res) => {
  try {
    await Notification.update(req.params.id, req.body);
    res.json({ message: "Notification updated" });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// Delete a notification
router.delete("/:id", async (req, res) => {
  try {
    await Notification.delete(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

export default router;
