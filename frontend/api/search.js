export const searchAll = async (searchQuery, currentUserId, type = "user") => {
  try {
    if (!searchQuery.trim()) {
      return [];
    }
    const endpoint =
      type === "group"
        ? `http://10.0.2.2:5000/api/search/groups/${encodeURIComponent(searchQuery)}`
        : `http://10.0.2.2:5000/api/search/users/${encodeURIComponent(searchQuery)}`;

    const response = await fetch(
      `${endpoint}?currentUserId=${encodeURIComponent(currentUserId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }

    // Get the response text first to validate it
    const responseText = await response.text();
    
    // Try to parse the response text as JSON
    try {
      return responseText ? JSON.parse(responseText) : [];
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      console.log("Invalid response:", responseText);
      return []; // Return empty array instead of throwing error
    }
  } catch (error) {
    console.error("Search request failed:", error);
    // Don't throw the error, return empty array instead
    return [];
  }
};
