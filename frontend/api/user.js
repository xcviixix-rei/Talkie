export const fetchUserData = async (userID) => {
  try {
    const response = await fetch(`http://10.0.2.2:5000/api/users/${userID}`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Fetch user data failed:", error);
    return {};
  }
};
