import ConversationList from "../../../components/ConversationList";
import HomeHeader from "../../../components/HomeHeader";
import { useCallback, useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/authContext";
import axios from "axios";
import { messageNotificationService } from "../../../config/firebaseConfig";

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
      const data = response.data;
      // Sort conversations by last_message timestamp (newest first)
      const mockUsers = [...data].sort((a, b) => {
        const timeA = a.last_message?.timestamp || a.created_at;
        const timeB = b.last_message?.timestamp || b.created_at;
        return new Date(timeB) - new Date(timeA);
      });

      setUsers(mockUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // When user auth state changes
    if (user?.id) {
      // Then set up conversation listeners
      const unsubscribe = messageNotificationService.setupConversationsListener(user.id);

      return () => {
        if (unsubscribe) unsubscribe();
        messageNotificationService.unsubscribeAllListeners();
      };
    }
  }, [user?.id]);


  useFocusEffect(
    useCallback(() => {
      loadUsers();
      const timeInterval = setInterval(loadUsers, 60000);

      return () => clearInterval(timeInterval);
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
