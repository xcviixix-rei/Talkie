import {sendMessage} from "./message";

export const createConversation = async (
    conversationName,
    conversationType,
    participants
) => {
    try {

        const conversationData = {
            type: conversationType,
            participants: participants,
            last_message: {
                text: "Welcome to " + conversationName,
                sender: participants[0].user_id,
                timestamp: new Date().toISOString(),
            },
            conver_theme: "default",
            created_at: new Date().toISOString(),
        };
        if (conversationName && conversationName.trim() !== "") {
            conversationData.conver_pic =
                "https://www.gravatar.com/avatar/?d=identicon";
            conversationData.name = conversationName;
        }

        const response = await fetch("http://10.0.2.2:5000/api/conversations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(conversationData),
        });

        const message = {
            conversation_id: response.json().id,
            text: "Welcome to " + conversationName,
            sender: participants[0].user_id,
            timestamp: new Date().toISOString(),
        }
        await sendMessage(message)


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
                    last_message: {sender, text, timestamp, attachments},
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

export const editTheme = async (conversationId, theme_name) => {
    try {
        const response = await fetch(
            `http://10.0.2.2:5000/api/conversations/${conversationId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({conver_theme: theme_name}),
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to edit theme: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Edit theme failed:", error);
        throw error;
    }
};

export const searchMessages = async (conversationId, uid, query) => {
    try {
        const response = await fetch(
            `http://10.0.2.2:5000/api/conversations/${conversationId}/messages/search/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({query: query, uid: uid}),
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

export const searchMedia = async (conversationId) => {
    try {
        const response = await fetch(
            `http://10.0.2.2:5000/api/conversations/${conversationId}/attachments`,
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

export const deleteConversation = async (conversationId) => {
  try {
    const response = await fetch(
      `http://10.0.2.2:5000/api/conversations/${conversationId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Delete conversation failed:", error);
    throw error;
  }
};