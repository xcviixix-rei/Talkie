import express from "express";
import {getDocs, query} from "firebase/firestore";
import {User} from "../models/User.js";


const router = express.Router();

// Get user matches by username
router.get("/:searchQuery", async (req, res) => {
    try {
        const {searchQuery} = req.params;

        if (!searchQuery || searchQuery.trim() === '') {
            return res.status(400).json({error: "Search query is required"});
        }


        const userQueryRef = query(User.collectionRef());
        const querySnapshot = await getDocs(userQueryRef);

        const matches = [];
        querySnapshot.forEach((docSnap) => {
            const userData = docSnap.data();
            if (
                userData.username &&
                userData.username.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
                matches.push({
                    id: docSnap.id,
                    ...userData
                });
            }
        });

        res.json(matches);
    } catch (error) {
        console.error("Error searching for users:", error);
        res.status(500).json({error: "Failed to search for users"});
    }
});

export default router;