export const fetchTheme = async () => {
  try {
    const response = await fetch(`http://10.0.2.2:5000/api/themes/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get theme");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting theme error:", error);
    throw error;
  }
};
