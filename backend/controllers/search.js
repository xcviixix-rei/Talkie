import express from "express";
import {getDocs, query, where} from "firebase/firestore";
import {User} from "../models/User.js";
import {Conversation} from "../models/Conversation.js";

const router = express.Router();
// Get user matches by username with conversations

// GET /api/users/:searchQuery
router.get("/users/:searchQuery", async (req , res) => {
    try {
        const { searchQuery } = req.params;
        const { currentUserId } = req.query;

        if (!searchQuery || searchQuery.trim() === '') {
        return res.status(400).json({ error: "Search query is required" });
        }

        // Get matching users
        const userQueryRef = query(User.collectionRef());
        const querySnapshot = await getDocs(userQueryRef);

        const matches = [];
        querySnapshot.forEach((docSnap) => {
        const userData = docSnap.data();
        if (
            userData.username &&
            userData.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
            docSnap.id !== currentUserId // Exclude current user
        ) {
            // Add to matches array
            matches.push({
            id: docSnap.id,
            ...userData
            });
        }
        });

        res.json(matches);
    } catch (error) {
        console.error("Error searching for users:", error);
        res.status(500).json({ error: "Failed to search for users" });
    }
});

router.get("/groups/:searchQuery", async (req, res) => {
  try {
    const { searchQuery } = req.params;
    const { currentUserId } = req.query;

    if (!searchQuery || searchQuery.trim() === '') {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Get matching group conversations
    const conversationQueryRef = query(
      Conversation.collectionRef(),
      where("type", "==", "group") // Only get group conversations
    );
    const querySnapshot = await getDocs(conversationQueryRef);

    const matches = [];
    querySnapshot.forEach((docSnap) => {
      const groupData = docSnap.data();

      // Only include groups with names that match the search query
      if (
        groupData.name &&
        groupData.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        matches.push({
          id: docSnap.id,
          ...groupData
        });
      }
    });

    res.json(matches);
  } catch (error) {
    console.error("Error searching for groups:", error);
    res.status(500).json({ error: "Failed to search for groups" });
  }
});

export default router;