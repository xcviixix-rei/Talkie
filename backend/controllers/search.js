import express from "express";
import {getDocs, query, where} from "firebase/firestore";
import {User} from "../models/User.js";
import {Conversation} from "../models/Conversation.js";

const router = express.Router();
// Get user matches by username with conversations

// GET /api/users/:searchQuery
// GET /api/users/:searchQuery
router.get("/users/:searchQuery", async (req, res) => {
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
        const matchPromises = [];

        querySnapshot.forEach((docSnap) => {
            const userData = docSnap.data();
            if (
                userData.username &&
                userData.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
                docSnap.id !== currentUserId // Exclude current user
            ) {
                // Create a promise to check for existing conversation with this user
                const promise = (async () => {
                    const userId = docSnap.id;

                    // Query for direct conversation between current user and this user
                    const conversationQueryRef = query(
                        Conversation.collectionRef(),
                        where("type", "==", "direct"),
                        where("participants", "array-contains", currentUserId)
                    );

                    const convSnapshot = await getDocs(conversationQueryRef);
                    let existingConversation = null;

                    convSnapshot.forEach((convDoc) => {
                        const convData = convDoc.data();
                        // Check if this user is in participants
                        if (convData.participants.includes(userId)) {
                            existingConversation = {
                                id: convDoc.id,
                                ...convData
                            };
                        }
                    });

                    // Add user to matches with conversation data if available
                    matches.push({
                        id: userId,
                        username: userData.username,
                        created_at: userData.created_at,
                        status: userData.status,
                        full_name: userData.full_name,
                        profile_pic: userData.profile_pic,
                        conversation: existingConversation
                    });
                })();

                matchPromises.push(promise);
            }
        });

        // Wait for all promises to resolve
        await Promise.all(matchPromises);

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