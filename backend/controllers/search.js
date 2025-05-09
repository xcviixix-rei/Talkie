import express from "express";
import {doc, getDoc, getDocs, query, where} from "firebase/firestore";
import {User} from "../models/User.js";
import {Conversation} from "../models/Conversation.js";

const router = express.Router();

// Query for conversations where current user is a participant
router.get("/conversations/:searchQuery", async (req, res) => {
    try {
        const {searchQuery} = req.params;
        const {currentUserId} = req.query;

        if (!searchQuery || searchQuery.trim() === '') {
            return res.status(400).json({error: "Search query is required"});
        }

        // Query for conversations where current user is a participant
        // Need to change the query since participants is an array of objects
        const conversationQueryRef = query(
            Conversation.collectionRef()
        );
        const querySnapshot = await getDocs(conversationQueryRef);

        const matches = [];
        const matchPromises = [];

        querySnapshot.forEach((docSnap) => {
            const conversationData = docSnap.data();

            // Check if current user is a participant
            const isParticipant = conversationData.participants &&
                conversationData.participants.some(p => p.user_id === currentUserId);

            if (!isParticipant) return;

            const promise = (async () => {
                // For group conversations, search by name
                if (conversationData.type === "group") {
                    if (conversationData.name &&
                        conversationData.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                        matches.push({
                            id: docSnap.id,
                            ...conversationData
                        });
                    }
                }
                // For direct conversations, search by other user's username
                else if (conversationData.type === "direct") {
                    // Find the other participant object
                    const otherParticipant = conversationData.participants.find(p => p.user_id !== currentUserId);

                    if (otherParticipant) {
                        // Get the other user's data
                        const userDocRef = doc(User.collectionRef(), otherParticipant.user_id);
                        const userDocSnap = await getDoc(userDocRef);
                        const userDoc = userDocSnap.exists() ? userDocSnap.data() : null;

                        if (userDoc && userDoc.username &&
                            userDoc.username.toLowerCase().includes(searchQuery.toLowerCase())) {
                            // Add conversation with other user's info
                            matches.push({
                                id: docSnap.id,
                                ...conversationData,
                                otherParticipant: {
                                    id: otherParticipant.user_id,
                                    username: userDoc.username,
                                    full_name: userDoc.full_name,
                                    profile_pic: userDoc.profile_pic,
                                    role: otherParticipant.role,
                                    alias: otherParticipant.alias
                                }
                            });
                        }
                    }
                }
            })();

            matchPromises.push(promise);
        });

        // Wait for all promises to resolve
        await Promise.all(matchPromises);

        res.json(matches);
    } catch (error) {
        console.error("Error searching for conversations:", error);
        res.status(500).json({error: "Failed to search for conversations"});
    }
});


// GET /api/users/:searchQuery
router.get("/users/:searchQuery", async (req, res) => {
    try {
        const {searchQuery} = req.params;
        const {currentUserId} = req.query;

        if (!searchQuery || searchQuery.trim() === '') {
            return res.status(400).json({error: "Search query is required"});
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
                    );

                    const convSnapshot = await getDocs(conversationQueryRef);
                    let existingConversation = null;

                    convSnapshot.forEach((convDoc) => {
                        const convData = convDoc.data();
                        // Check if both users are participants in this direct conversation
                        const hasCurrentUser = convData.participants.some(p => p.user_id === currentUserId);
                        const hasOtherUser = convData.participants.some(p => p.user_id === userId);

                        if (hasCurrentUser && hasOtherUser) {
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
        res.status(500).json({error: "Failed to search for users"});
    }
});

router.get("/groups/:searchQuery", async (req, res) => {
    try {
        const {searchQuery} = req.params;
        const {currentUserId} = req.query;

        if (!searchQuery || searchQuery.trim() === '') {
            return res.status(400).json({error: "Search query is required"});
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

            // Check if this user is in participants
            const isParticipant = groupData.participants &&
                groupData.participants.some(p => p.user_id === currentUserId);

            // Only include groups that match the search query and where user is a participant
            if (
                groupData.name &&
                groupData.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                isParticipant
            ) {
                matches.push({
                    id: docSnap.id, // This ensures we always have an ID
                    ...groupData
                });
            }
        });

        res.json(matches);
    } catch (error) {
        console.error("Error searching for groups:", error);
        res.status(500).json({error: "Failed to search for groups"});
    }
});

export default router;