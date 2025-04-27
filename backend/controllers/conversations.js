import express from "express";
import { query, where, getDocs } from "firebase/firestore";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";

const router = express.Router();

// Create a new conversation
router.post("/", async (req, res) => {
  try {
    const newConversation = await Conversation.create(req.body);
    res.status(201).json(newConversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Get all conversations
router.get("/", async (req, res) => {
  try {
    const conversations = await Conversation.list();
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get a single conversation by ID
router.get("/:id", async (req, res) => {
  try {
    const conversation = await Conversation.get(req.params.id);
    if (conversation) {
      res.json(conversation);
    } else {
      res.status(404).json({ error: "Conversation not found" });
    }
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

// Update a conversation
router.put("/:id", async (req, res) => {
  try {
    await Conversation.update(req.params.id, req.body);
    res.json({ message: "Conversation updated" });
  } catch (error) {
    console.error("Error updating conversation:", error);
    res.status(500).json({ error: "Failed to update conversation" });
  }
});


// Delete a conversation and its messages
router.delete("/:id", async (req, res) => {
  try {
    const conversationId = req.params.id;

    // Query for all messages in the conversation
    const messagesQuery = query(
      Message.collectionRef(),
      where("conversation_id", "==", conversationId)
    );
    const querySnapshot = await getDocs(messagesQuery);

    // Delete each message (assuming Message.delete(id) exists)
    const deletePromises = [];
    querySnapshot.forEach((docSnap) => {
      deletePromises.push(Message.delete(docSnap.id));
    });
    await Promise.all(deletePromises);

    // Now delete the conversation
    await Conversation.delete(conversationId);
    res.json({ message: "Conversation and its messages deleted" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});



// List all messages in a conversation
router.get("/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Query messages filtered by conversationId
    const messagesQuery = query(
      Message.collectionRef(),
      where("conversation_id", "==", conversationId)
    );
    const querySnapshot = await getDocs(messagesQuery);
    const messages = [];
    
    querySnapshot.forEach((docSnap) => {
      messages.push(new Message({ id: docSnap.id, ...docSnap.data() }));
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages for conversation:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});



// Get messages in a conversation that include specific content in their text
router.get("/:conversationId/messages/search", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { query: searchQuery } = req.query;
    if (!searchQuery) {
      return res.status(400).json({ error: "Search query required" });
    }

    // Query messages filtered by conversationId
    const messagesQuery = query(
      Message.collectionRef(),
      where("conversation_id", "==", conversationId)
    );
    const querySnapshot = await getDocs(messagesQuery);
    const messages = [];
    
    // Filter messages locally by checking if text includes the search query
    querySnapshot.forEach((docSnap) => {
      const messageData = docSnap.data();
      if (messageData.text && messageData.text.includes(searchQuery)) {
        messages.push(new Message({ id: docSnap.id, ...messageData }));
      }
    });

    res.json(messages);
  } catch (error) {
    console.error("Error searching messages in conversation:", error);
    res.status(500).json({ error: "Failed to search messages" });
  }
});



// Get a specific message inside a conversation
router.get("/:conversationId/messages/:messageId", async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const message = await Message.get(messageId);
    if (message && message.conversation_id === conversationId) {
      res.json(message);
    } else {
      res.status(404).json({ error: "Message not found in the conversation" });
    }
  } catch (error) {
    console.error("Error fetching message in conversation:", error);
    res.status(500).json({ error: "Failed to fetch message" });
  }
});

export default router;

// Get all messages in a conversation
router.get("/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify that the conversation exists
    const conversation = await Conversation.get(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Query messages filtered by conversationId
    const messagesQuery = query(
      Message.collectionRef(),
      where("conversation_id", "==", conversationId)
    );

    const querySnapshot = await getDocs(messagesQuery);
    const messages = [];

    querySnapshot.forEach((docSnap) => {
      messages.push(new Message({ id: docSnap.id, ...docSnap.data() }));
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages for conversation:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});