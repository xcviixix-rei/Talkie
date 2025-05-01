import express from "express";
import { query, where, getDocs } from "firebase/firestore";
import { User } from "../models/User.js";
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
    const queryUid = req.body.uid; // Optional user id query parameter
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
    let messages = [];
    querySnapshot.forEach((docSnap) => {
      messages.push(new Message({ id: docSnap.id, ...docSnap.data() }));
    });

    // If a query user id is provided, filter out messages hidden for that user
    if (queryUid) {
      messages = messages.filter(
        (msg) => !(msg.hidden_to && msg.hidden_to.includes(queryUid))
      );
    }

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages for conversation:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.get("/:conversationId/attachments", async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Verify the conversation exists
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
    
    // Define file extension arrays
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    const videoExts = ['mp4', 'avi', 'mov', 'mkv'];
    const audioExts = ['mp3', 'wav', 'ogg'];
    
    const images = [];
    const videos = [];
    const audios = [];
    const files = [];
    
    querySnapshot.forEach((docSnap) => {
      const messageData = docSnap.data();
      // Check if the message contains attachments
      if (messageData.attachments && Array.isArray(messageData.attachments)) {
        messageData.attachments.forEach((attachment) => {
          // Assume attachment object has a "url" or "filename" property
          const filename = attachment.url || attachment.filename;
          if (!filename) return;
          const ext = filename.split('.').pop().toLowerCase();
          if (imageExts.includes(ext)) {
            images.push(attachment);
          } else if (videoExts.includes(ext)) {
            videos.push(attachment);
          } else if (audioExts.includes(ext)) {
            audios.push(attachment);
          } else {
            files.push(attachment);
          }
        });
      }
    });
    
    res.json({ images, videos, audios, files });
  } catch (error) {
    console.error("Error fetching attachments for conversation:", error);
    res.status(500).json({ error: "Failed to fetch attachments" });
  }
});

// Get messages in a conversation that include specific content in their text
router.post("/:conversationId/messages/search", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { query: searchQuery, uid } = req.body; // uid is optional
    if (searchQuery === undefined) {
      return res.status(400).json({ error: "Search query required" });
    }

    // Query messages filtered by conversationId
    const messagesQuery = query(
      Message.collectionRef(),
      where("conversation_id", "==", conversationId)
    );
    const querySnapshot = await getDocs(messagesQuery);
    let messages = [];

    // Filter messages locally by checking if text includes the search query
    querySnapshot.forEach((docSnap) => {
      const messageData = docSnap.data();
      if (messageData.text && messageData.text.includes(searchQuery)) {
        messages.push(new Message({ id: docSnap.id, ...messageData }));
      }
    });


    // If uid is provided, filter out messages hidden for that user
    if (uid) {
      messages = messages.filter(
        (msg) => !(msg.hidden_to && msg.hidden_to.includes(uid))
      );
    }

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

router.get("/:conversationId/participants", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.get(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    const participants = conversation.participants || [];
    
    // For each participant, if it's simply a string, treat it as uid; otherwise use the object properties.
    const detailedParticipants = await Promise.all(
      participants.map(async (participant) => {
        let uid, alias, role;
        if (typeof participant === "string") {
          uid = participant;
          role = "Participant";
          const user = await User.get(uid);
          alias = user?.username || "";
          return {
            uid,
            username: user?.username || "",
            alias,
            role,
          };
        } else {
          uid = participant.user_id;
          const user = await User.get(uid);
          alias = participant.alias || user?.username || "";
          role = participant.role || "Participant";
          return {
            uid,
            username: user?.username || "",
            alias,
            role,
          };
        }
      })
    );


    res.json({ participants: detailedParticipants });
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

// Update a participant's alias in a conversation
router.put("/:conversationId/participants/:userId/alias", async (req, res) => {
  try {
    const { conversationId, userId } = req.params;
    const { alias } = req.body;
    if (!alias) {
      return res.status(400).json({ error: "Alias is required" });
    }
    
    // Fetch the conversation
    const conversation = await Conversation.get(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    
    // Modify the participant's alias
    let found = false;
    const updatedParticipants = conversation.participants.map((participant) => {
      if (typeof participant === "string") {
        // Participant is stored as uid
        if (participant === userId) {
          found = true;
          return { user_id: participant, alias, role: "Participant" };
        }
        return participant;
      } else {
        // Participant is an object
        if (participant.user_id === userId) {
          found = true;
          return { ...participant, alias };
        }
        return participant;
      }
    });
    
    if (!found) {
      return res.status(404).json({ error: "Participant not found in conversation" });
    }
    
    // Update conversation with the new participants array
    await Conversation.update(conversationId, { participants: updatedParticipants });
    
    res.json({ message: "Participant alias updated", participants: updatedParticipants });
  } catch (error) {
    console.error("Error updating participant alias:", error);
    res.status(500).json({ error: "Failed to update participant alias" });
  }
});
  
// Update a participant's role in a conversation
router.put("/:conversationId/participants/:userId/role", async (req, res) => {
  try {
    const { conversationId, userId } = req.params;
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }
  
    // Validate role values
    const validRoles = ["Admin", "Participant"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role. Valid roles are Admin or Participant." });
    }
  
    // Fetch the conversation
    const conversation = await Conversation.get(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
  
    // Modify the participant's role
    let found = false;
    const updatedParticipants = conversation.participants.map((participant) => {
      if (typeof participant === "string") {
        // Participant is stored as uid
        if (participant === userId) {
          found = true;
          // We default alias as empty string here.
          return { user_id: participant, alias: "", role };
        }
        return participant;
      } else {
        // Participant is an object
        if (participant.user_id === userId) {
          found = true;
          return { ...participant, role };
        }
        return participant;
      }
    });
  
    if (!found) {
      return res.status(404).json({ error: "Participant not found in conversation" });
    }
  
    // Update conversation with the new participants array
    await Conversation.update(conversationId, { participants: updatedParticipants });
  
    res.json({ message: "Participant role updated", participants: updatedParticipants });
  } catch (error) {
    console.error("Error updating participant role:", error);
    res.status(500).json({ error: "Failed to update participant role" });
  }
});











export default router;