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

router.get("/:searchQuery", async (req, res) => {
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

    // If there's a current user ID, find conversations between users
    if (currentUserId) {
      // Get all conversations that the current user is part of
      const conversationsQuery = query(
        Conversation.collectionRef(),
        where("participants", "array-contains", currentUserId)
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);

      // Create a map of userId -> conversation
      const userConversations = {};
      conversationsSnapshot.forEach((docSnap) => {
        const conversationData = docSnap.data();

        // Find the other participant
        conversationData.participants.forEach(participantId => {
          if (participantId !== currentUserId) {
            userConversations[participantId] = {
              id: docSnap.id,
              ...conversationData
            };
          }
        });
      });

      // Add conversation data to each match
      for (let i = 0; i < matches.length; i++) {
        matches[i].conversation = userConversations[matches[i].id] || null;

      }
    }

    res.json(matches);
  } catch (error) {
    console.error("Error searching for users:", error);
    res.status(500).json({ error: "Failed to search for users" });
  }
});
export default router;