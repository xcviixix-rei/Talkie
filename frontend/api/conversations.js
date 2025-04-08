// Fetch all conversations for the current user
export const fetchUserConversations = async (userId) => {
  try {
    const response = await fetch(`http://10.0.2.2:5000/api/users/${userId}/conversations`,
        {
            method: 'GET',
        });
    return await response.json();
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

