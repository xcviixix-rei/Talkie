import express from "express";
import { User } from "../models/User.js";
import { summarizeText } from "../services/aiService.js"; // Import your AI service functions
const router = express.Router();

// Example: AI summary service
router.post("/summarize", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Process each message: retain only sender and text,
    // converting sender (userID) to username via User.get.
    const processedMessages = await Promise.all(
      messages.map(async (msg) => {
        // Fetch the user details using the sender (userID)
        const user = await User.get(msg.sender);
        const username = user?.username || msg.sender;
        return { sender: username, text: msg.text };
      })
    );

    // res.json({ processedMessages });
    // return;

    // Call your AI summarization service with the processed messages.
    // For example, you may join the messages in some way or pass the array directly.
    const summary = await summarizeText(processedMessages); // Your summarization function

    res.json({ summary });
  } catch (error) {
    console.error("Error summarizing messages:", error);
    res.status(500).json({ error: "Failed to summarize messages" });
  }
});

// Example: AI translation service
router.post("/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
      return res
        .status(400)
        .json({ error: "Text and targetLanguage are required" });
    }
    // Call your AI translation service
    const translatedText = await translateText(text, targetLanguage); // your function here
    res.json({ translatedText });
  } catch (error) {
    console.error("Error translating text:", error);
    res.status(500).json({ error: "Failed to translate text" });
  }
});

// Example: AI message suggestion service
router.post("/suggest", async (req, res) => {
  try {
    const { conversationContext } = req.body;
    if (!conversationContext) {
      return res.status(400).json({ error: "Conversation context required" });
    }
    // Call your message suggestion service
    const suggestions = await suggestMessages(conversationContext); // your function here
    res.json({ suggestions });
  } catch (error) {
    console.error("Error suggesting messages:", error);
    res.status(500).json({ error: "Failed to suggest messages" });
  }
});

export default router;