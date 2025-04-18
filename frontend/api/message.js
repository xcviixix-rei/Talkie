import auth from '../config/firebaseConfig';

// Get all messages in a conversation
export const getMessages = async (conversationId) => {
  try {
    const response = await fetch(
      `http://10.0.2.2:5000/api/conversations/${conversationId}/messages`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Send a new message
export const sendMessage = async (message) => {
  try {
    const response = await fetch(`http://10.0.2.2:5000/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Update a message
export const updateMessage = async (messageId, updates) => {
  try {
    const response = await fetch(
      `http://10.0.2.2:5000/api/messages/${messageId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update message: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating message:", error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    const response = await fetch(
      `http://10.0.2.2:5000/api/messages/${messageId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete message: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

// Search for messages in a conversation
export const searchMessages = async (conversationId, searchQuery) => {
  try {
    const response = await fetch(
      `http://10.0.2.2:5000/api/conversations/${conversationId}/messages/search?query=${encodeURIComponent(
        searchQuery
      )}`
    );

    if (!response.ok) {
      throw new Error(`Failed to search messages: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching messages:", error);
    throw error;
  }
};

// Mark message as seen by current user
export const markMessageAsSeen = async (messageId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const userId = currentUser.uid;

    const message = await getMessageById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Add current user to seen_by if not already there
    if (!message.seen_by.includes(userId)) {
      const updatedSeenBy = [...message.seen_by, userId];
      await updateMessage(messageId, { seen_by: updatedSeenBy });
    }

    return true;
  } catch (error) {
    console.error("Error marking message as seen:", error);
    throw error;
  }
};

// Get a single message by ID
export const getMessageById = async (messageId) => {
  try {
    const response = await fetch(
      `http://10.0.2.2:5000/api/messages/${messageId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to get message: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting message by ID:", error);
    throw error;
  }
};
