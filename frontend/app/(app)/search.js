import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/authContext";
import { searchAll } from "../../api/search";
import { createConversation } from "../../api/conversation";
import Loading from "../../components/Loading";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [userResults, setUserResults] = useState([]);
  const [groupResults, setGroupResults] = useState([]);
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'groups'
  const { user } = useAuth();

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setUserResults([]);
      setGroupResults([]);
      return;
    }

    setLoading(true);

    const timer = setTimeout(() => {
      const searchUsersAndGroups = async () => {
        try {
          if (searchQuery.trim() === "") {
            setUserResults([]);
            setGroupResults([]);
            setLoading(false);
            return;
          }

          // Search for users
          const matchingUsers = await searchAll(searchQuery, user.id, "user");
          const formattedUserResults = matchingUsers.map((u) => ({
            username: u.username,
            profile_pic: u.profile_pic,
            userId: u.id,
            full_name: u.full_name,
            status: u.status,
            created_at: u.created_at,
            conversation: u.conversation,
            type: "user",
          }));
          setUserResults(formattedUserResults);

          // Search for group conversations
          const matchingGroups = await searchAll(searchQuery, user.id, "group");
          const formattedGroupResults = matchingGroups.map((g) => ({
            name: g.name,
            id: g.id,
            lastMessage: g.lastMessage,
            participants: g.participants,
            conver_pic: g.conver_pic,
            type: "group",
          }));
          setGroupResults(formattedGroupResults);
        } catch (error) {
          console.error("Error searching:", error);
        } finally {
          setLoading(false);
        }
      };

      searchUsersAndGroups();
    }, 700);

    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  const handleUserSelect = async (item) => {
    try {
      if (item.conversation) {
        // Navigate to existing conversation
        // Format mockUsers to match ConversationItem structure
        const mockUsers = [
          user,
          {
            id: item.userId,
            username: item.username,
            full_name: item.username,
            profile_pic: item.profile_pic,
            status: item.status,
            created_at: item.created_at,
          },
        ];

        router.push({
          pathname: "/conversation",
          params: {
            rawItem: JSON.stringify(item.conversation),
            rawMockUsers: JSON.stringify(mockUsers),
            converName: item.username,
            converPic: item.profile_pic,
          },
        });
      } else {
        // Show loading indicator
        setLoading(true);

        // Create new conversation
        const participants = [
          {
            alias: "",
            role: "Admin",
            user_id: user.id,
          },
          {
            alias: "",
            role: "Admin",
            user_id: item.userId,
          }
        ];
        const newConversation = await createConversation(
          "",
          "direct",
          participants
        );

        // Add necessary user data to mock users array
        const mockUsers = [
          user,
          {
            id: item.userId,
            username: item.username,
            full_name: item.username,
            profile_pic: item.profile_pic,
            status: item.status,
            created_at: item.created_at,
          },
        ];

        // Navigate to the conversation screen with consistent parameters
        router.push({
          pathname: "/conversation",
          params: {
            rawItem: JSON.stringify(newConversation),
            rawMockUsers: JSON.stringify(mockUsers),
            converName: item.username,
            converPic: item.profile_pic,
          },
        });
      }
    } catch (error) {
      console.error("Error handling user selection:", error);
      Alert.alert("Error", "Could not open conversation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = async (item) => {
    try {
      setLoading(true);

      // Get the participants for the group
      const participants = item.participants || [];

      // Initialize the mockUsers array
      let mockUsers = [];

      // For each participant ID in the group, fetch their complete user information
      // or use what's available if they're already complete objects
      for (const participant of participants) {
        try {
          const userId =
            typeof participant === "object" ? participant.user_id : participant;

          const userResponse = await fetch(
            `http://10.0.2.2:5000/api/users/${userId}`
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            mockUsers.push({
              id: userData.id,
              username: userData.username,
              full_name: userData.full_name || userData.username,
              profile_pic: userData.profile_pic,
            });
          }
        } catch (err) {
          console.error(
            `Failed to fetch user info for ID: ${participant}`,
            err
          );
        }
      }

      // Add current user if not already in participants
      if (!mockUsers.some((p) => p.id === user.id)) {
        mockUsers.push({
          id: user.id,
          username: user.username,
          full_name: user.full_name || user.username,
          profile_pic: user.profile_pic,
        });
      }

      // Navigate to the conversation screen with group data
      router.push({
        pathname: "/conversation",
        params: {
          rawItem: JSON.stringify(item),
          rawMockUsers: JSON.stringify(mockUsers),
          converName: item.name,
          conver_pic: item.conver_pic,
        },
      });
    } catch (error) {
      console.error("Error handling group selection:", error);
      Alert.alert(
        "Error",
        "Could not open group conversation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleUserSelect(item)}
    >
      <Image source={{ uri: item.profile_pic }} style={styles.avatar} />
      <View style={styles.resultDetails}>
        <Text style={styles.resultName}>{item.username}</Text>
        <Text style={styles.resultType}>User</Text>
      </View>
    </TouchableOpacity>
  );

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleGroupSelect(item)}
    >
      <Image source={{ uri: item.conver_pic}} style={styles.avatar} />
      <View style={styles.resultDetails}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultType}>Group</Text>
        <Text numberOfLines={1} style={styles.lastMessage}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "users" && styles.activeTabButton,
        ]}
        onPress={() => setActiveTab("users")}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "users" && styles.activeTabText,
          ]}
        >
          Users
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "groups" && styles.activeTabButton,
        ]}
        onPress={() => setActiveTab("groups")}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "groups" && styles.activeTabText,
          ]}
        >
          Groups
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Loading size={100} />
        </View>
      );
    }

    if (activeTab === "users") {
      return (
        <FlatList
          data={userResults}
          renderItem={renderUserItem}
          keyExtractor={(item) => `user-${item.userId}`}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            searchQuery.trim() !== "" && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No users found</Text>
              </View>
            )
          }
        />
      );
    } else {
      return (
        <FlatList
          data={groupResults}
          renderItem={renderGroupItem}
          keyExtractor={(item) => `group-${item.id}`}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            searchQuery.trim() !== "" && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No groups found</Text>
              </View>
            )
          }
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users and group conversations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            clearButtonMode="while-editing"
          />
        </View>

        {renderTabButtons()}
        {renderContent()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1E90FF",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  activeTabButton: {
    backgroundColor: "#1E90FF",
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E90FF",
  },
  activeTabText: {
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultsList: {
    paddingHorizontal: 16,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e6f2ff",
    justifyContent: "center",
    alignItems: "center",
  },
  resultDetails: {
    marginLeft: 12,
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
  },
  resultType: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 8,
    marginLeft: 16,
  },
});
