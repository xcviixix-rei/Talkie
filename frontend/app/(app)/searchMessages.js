import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { searchMessages } from "../../api/conversation";

const MessageItem = ({ item, mockUsers }) => {
  // Find the user by ID to get their full name
  const sender = mockUsers.find((user) => user.id === item.sender);
  const senderName = sender ? sender.full_name : "Unknown User";

  // Format the timestamp to a more readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    // Check if valid date
    if (isNaN(date.getTime())) return timestamp;

    // Get today and yesterday dates for comparison
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if the message is from today or yesterday
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    // Format time as HH:MM AM/PM
    const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };
    const timeString = date.toLocaleTimeString(undefined, timeOptions);

    if (isToday) {
      return `Today at ${timeString}`;
    } else if (isYesterday) {
      return `Yesterday at ${timeString}`;
    } else {
      // Format as MM/DD/YYYY at HH:MM AM/PM for older messages
      const dateOptions = { month: "numeric", day: "numeric", year: "numeric" };
      const dateString = date.toLocaleDateString(undefined, dateOptions);
      return `${dateString} at ${timeString}`;
    }
  };

  return (
    <View style={styles.messageItem}>
      <View style={styles.messageBubble}>
        <Text style={styles.senderText}>{senderName}</Text>
        <Text style={styles.messageContent}>{item.text}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
    </View>
  );
};

export default function SearchMessages() {
  const {
    rawItem,
    rawMockUsers,
    converName: initialConverName,
    converPic: initialConverPic,
  } = useLocalSearchParams();
  const item = JSON.parse(rawItem);
  const mockUsers = JSON.parse(rawMockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      setFilteredMessages([]);
    } else {
      const results = await searchMessages(item.id, searchQuery.toLowerCase());
      setFilteredMessages(results);
      setHasSearched(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredMessages([]);
    setHasSearched(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            onBlur={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          activeOpacity={0.7}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {hasSearched && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsHeader}>
            {filteredMessages.length === 0
              ? "No results found"
              : `${filteredMessages.length} result${
                  filteredMessages.length !== 1 ? "s" : ""
                } found`}
          </Text>
          <FlatList
            data={filteredMessages}
            renderItem={({ item }) => (
              <MessageItem item={item} mockUsers={mockUsers} />
            )}
            keyExtractor={(item) => item.id}
            style={styles.resultsList}
            contentContainerStyle={styles.resultsListContent}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  searchHeader: {
    padding: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    flex: 1,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  searchButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    padding: 10,
    fontSize: 14,
    color: "#666",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  resultsList: {
    flex: 1,
  },
  resultsListContent: {
    paddingVertical: 5,
  },
  messageItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  messageBubble: {
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  senderText: {
    fontWeight: "bold",
    marginBottom: 3,
  },
  messageContent: {
    fontSize: 15,
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    alignSelf: "flex-end",
  },
});
