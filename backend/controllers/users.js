import express from "express";
import { query, getDocs, where } from "firebase/firestore";
import { User } from "../models/User.js";
import { Conversation } from "../models/Conversation.js";
import { StreamClient } from "getstream";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config();
const GETSTREAM_API_KEY = process.env.GETSTREAM_API_KEY;
const GETSTREAM_SECRET = process.env.GETSTREAM_SECRET;

const router = express.Router();
const client = new StreamClient(GETSTREAM_API_KEY, GETSTREAM_SECRET);

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

router.get("/check-username", async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        error: "Username query parameter is required"
      });
    }

    const userQuery = query(
        User.collectionRef(),
        where("username", "==", username.trim())
    );

    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      // Username is available
      return res.json({
        available: true,
        message: "Username is available"
      });
    } else {
      // Username is taken
      return res.json({
        available: false,
        message: "Username is already taken"
      });
    }
  } catch (error) {
    console.error("Error checking username availability:", error);
    res.status(500).json({
      error: "Failed to check username availability"
    });
  }
});

router.post("/get-token", async (req, res) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid; // Firebase UID as the GetStream.io user ID
    const streamToken = client.createUserToken(userId);
    res.json({ token: streamToken });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Invalid token" });
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

// Search for a user by username
router.get("/search", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: "Username query parameter is required" });
    }
    // Create a query to find user with the provided username
    const userQuery = query(
      User.collectionRef(),

    );
    const querySnapshot = await getDocs(userQuery);
    const users = [];
    querySnapshot.forEach((docSnap) => {
      const userData = docSnap.data();
      if (
        userData.username &&
        userData.username.toLowerCase().includes(username.toLowerCase())
      ) {
        users.push(new User({ id: docSnap.id, ...userData }));
      }
    });
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(users);
  } catch (error) {
    console.error("Error searching user by username:", error);
    res.status(500).json({ error: "Failed to search user" });
  }
});


router.get("/:id/conversations", async (req, res) => {
  try {
    const { id } = req.params;

    // Verify that the user exists.
    const user = await User.get(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get all conversations.
    let conversations = await Conversation.list();

    // Filter conversations so that only those where user is a participant and
    // the conversation is not hidden from the user are returned.
    conversations = conversations.filter((conversation) => {
      const { participants = [], hidden_to = [] } = conversation;

      // Check if the user is a participant.
      const isParticipant = participants.some((participant) => {
        if (typeof participant === "string") {
          return participant === id;
        } else if (participant && participant.user_id) {
          return participant.user_id === id;
        }
        return false;
      });

      // Exclude conversations which are hidden for the user.
      const isHidden = hidden_to.includes(id);
      return isParticipant && !isHidden;
    });

    // Sort conversations by last_message_time in descending order (newest first)
    conversations.sort((a, b) => {
      const timeA = a.last_message.timestamp ? new Date(a.last_message.timestamp).getTime() : 0;
      const timeB = b.last_message.timestamp ? new Date(b.last_message.timestamp).getTime() : 0;
      return timeB - timeA; // Descending order (newest on top)
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

// Check if username is available


export default router;
