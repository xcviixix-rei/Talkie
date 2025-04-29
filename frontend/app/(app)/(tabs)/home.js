import ConversationList from "../../../components/ConversationList";
import HomeHeader from "../../../components/HomeHeader";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/authContext";
import axios from "axios";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
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

  useFocusEffect(
    useCallback(() => {
      loadUsers();
      const timeInterval = setInterval(loadUsers, 60000);
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <HomeHeader />

      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E90FF" />
          </View>
        ) : (
          <ConversationList users={users} currentUser={user} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
