export const createConversation = async (
  conversationName,
  conversationType,
  participants
) => {
  try {
    const conversationData = {
      type: conversationType,
      participants: participants,
      created_at: new Date().toISOString(),
    };
    if (conversationName && conversationName.trim() !== "") {
      conversationData.name = conversationName;
    }

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
  timestamp,
  attachments
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
          last_message: { sender, text, timestamp, attachments },
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

export const editConversation = async (
  conversationId,
  converPic,
  converName
) => {
  try {
    const body = {};
    if (converName) {
      body.name = converName;
    }
    if (converPic) {
      body.conver_pic = converPic;
    }
    const response = await fetch(
      `http://10.0.2.2:5000/api/conversations/${conversationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to edit conversation: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Edit conversation failed:", error);
    throw error;
  }
};
