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

const loadUsers = async () => {
  try {
    const response = await axios.get(
      `http://10.0.2.2:5000/api/users/${user.id}/conversations`
    );
    const mockUsers = response.data;
    setUsers(mockUsers);
  } catch (error) {
    console.error("Failed to load users:", error);
  } finally {
    setLoading(false);
  }
};
