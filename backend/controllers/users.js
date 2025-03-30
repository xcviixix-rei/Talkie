import express from "express";
import { query, getDocs, where } from "firebase/firestore";
import { User } from "../models/User.js";
import { Conversation } from "../models/Conversation.js";


const router = express.Router();

// Create a new user
router.post("/", async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.list();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get conversations for a specific user
router.get("/:id/conversations", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.get(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userConversationsQuery = query(
      Conversation.collectionRef(),
      where("participants", "array-contains", { user_id: id, username: user.username })
    );
    const querySnapshot = await getDocs(userConversationsQuery);
    const conversations = [];
    querySnapshot.forEach((docSnap) => {
      conversations.push(new Conversation({ id: docSnap.id, ...docSnap.data() }));
    });
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations for user:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get a single user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.get(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Update a user
router.put("/:id", async (req, res) => {
  try {
    await User.update(req.params.id, req.body);
    res.json({ message: "User updated" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete a user
router.delete("/:id", async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
