export const createConversation = async (participants) => {
  try {
    const conversationData = {
      type: "direct",
      participants: participants,
      created_at: new Date().toISOString(),
    };

    const response = await fetch("http://10.0.2.2:5000/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conversationData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Create conversation failed:", error);
    throw error;
  }
};
export const fetchConversation = async (conversationId) => {
  try {
    const response = await fetch(
      `http://10.0.2.2:5000/api/conversations/${conversationId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch conversation failed:", error);
    throw error;
  }
};

export const changeLastMessages = async (
  conversationId,
  sender,
  text,
  timestamp
) => {
  try {
    const response = await fetch(
      `http://10.0.2.2:5000/api/conversations/${conversationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          last_message: { sender, text, timestamp },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Send message failed:", error);
    throw error;
  }
};
