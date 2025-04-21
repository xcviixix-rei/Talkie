export const searchAll = async (searchQuery, currentUserId) => {
  try {
    if (!searchQuery.trim()) {
      return [];
    }
    const response = await fetch(
      `http://10.0.2.2:5000/api/search/${encodeURIComponent(searchQuery)}?currentUserId=${encodeURIComponent(currentUserId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Search request failed:", error);
    throw error;
  }
};

export const searchUsers = async (searchQuery, currentUserId) => {
  try {
    if (!searchQuery.trim()) {
      return [];
    }
    const response = await fetch(
        `http://10.0.2.2:5000/api/search/users/${encodeURIComponent(searchQuery)}?currentUserId=${encodeURIComponent(currentUserId)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
    );

    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Search request failed:", error);
    throw error;
  }
}