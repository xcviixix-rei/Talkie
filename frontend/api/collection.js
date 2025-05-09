// Create a collections API file in the frontend/api directory

// Get all collections for a specific user
export const getUserCollections = async (userId) => {
  try {
    const response = await fetch(
      `http://10.0.2.2:5000/api/collections/user/${userId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching collections:", error);
    throw error;
  }
};

// Get a specific collection by ID
export const getCollection = async (collectionId) => {
  try {
    const response = await fetch(
      `http://10.0.2.2:5000/api/collections/${collectionId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch collection: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching collection:", error);
    throw error;
  }
};

// Create a new collection
export const createCollection = async (collectionData) => {
  try {
    const response = await fetch(`http://10.0.2.2:5000/api/collections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(collectionData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create collection: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating collection:", error);
    throw error;
  }
};


// Get all conversations in a collection
export const getCollectionConversations = async (collectionId) => {
  try {
    const response = await fetch(
      `http://10.0.2.2:5000/api/collections/${collectionId}/conversations`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch collection conversations: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching collection conversations:", error);
    throw error;
  }
};

// Update a collection
export const updateCollection = async (collectionId, updateData) => {
  try {
    const response = await fetch(
      `http://10.0.2.2:5000/api/collections/${collectionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update collection: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating collection:", error);
    throw error;
  }
};

// Delete a collection
export const deleteCollection = async (collectionId) => {
  try {
    const response = await fetch(
      `http://10.0.2.2:5000/api/collections/${collectionId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete collection: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting collection:", error);
    throw error;
  }
};