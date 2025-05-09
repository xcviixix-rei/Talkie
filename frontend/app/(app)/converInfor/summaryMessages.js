// import React, { useState, useEffect } from "react";
// import {
//   Text,
//   View,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   FlatList,
// } from "react-native";
// import { useAuth } from "../../../context/authContext";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import { getMessages } from "../../../api/message";
// import { summariesMessage } from "../../../api/AI";
// /**
//  * SummaryMessages Component
//  *
//  * Displays conversation summaries fetched from API with user-selectable time intervals
//  * and shows filtered messages within the selected time interval
//  */
// const SummaryMessages = ({ style }) => {
//   const { user } = useAuth();
//   const router = useRouter();
//   const { rawItem, rawMockUsers, converName, converPic } =
//     useLocalSearchParams();

//   // Parse conversation data
//   const item = rawItem ? JSON.parse(rawItem) : null;
//   const mockUsers = rawMockUsers ? JSON.parse(rawMockUsers) : [];

//   // Available time interval options in minutes
//   const timeIntervalOptions = [15, 30, 60, 120, 360, 720, "All"];

//   const [summaries, setSummaries] = useState([]);
//   const [selectedInterval, setSelectedInterval] = useState(null); // Changed initial interval to null
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [allMessages, setAllMessages] = useState([]);
//   const [filteredMessages, setFilteredMessages] = useState([]);
//   const [content, setContent] = useState();
//   const [viewMode, setViewMode] = useState("summary"); // "summary" or "messages"

//   useEffect(() => {
//     if (item?.id) {
//       fetchSummaries(item.id, selectedInterval);
//       fetchMessages();
//     }
//   }, []); // Initial fetch

//   useEffect(() => {
//     if (item?.id) {
//       fetchSummaries(item.id, selectedInterval);
//       filterMessagesByTimeInterval(selectedInterval);
//     }
//   }, [selectedInterval]); // Re-fetch when interval changes

//   /**
//    * Fetches all messages for the conversation
//    */
//   const fetchMessages = async () => {
//     try {
//       const messages = await getMessages(item.id);
//       const visibleMessages = messages.filter(
//         (msg) => !msg.hidden_to || !msg.hidden_to.includes(user.id)
//       );
//       setAllMessages(visibleMessages);
//       filterMessagesByTimeInterval(selectedInterval);
//     } catch (err) {
//       console.error("Error fetching messages:", err);
//       // In case of API failure, use mock data for demonstration
//     }
//   };

//   /**
//    * Filters messages based on selected time interval
//    * @param {number|string} interval - Size of interval in minutes or 'All'
//    */
//   const filterMessagesByTimeInterval = async (interval) => {
//     if (!allMessages || allMessages.length === 0) {
//       setFilteredMessages([]);
//       return;
//     }

//     if (interval === "All") {
//       setFilteredMessages(allMessages);
//       return;
//     }

//     if (interval === null) {
//       setFilteredMessages([]);
//       return;
//     }

//     const currentTime = new Date();
//     const cutoffTime = new Date(currentTime.getTime() - interval * 60000); // Convert minutes to milliseconds

//     const filtered = allMessages.filter((message) => {
//       const messageTime = new Date(message.timestamp);
//       return messageTime >= cutoffTime;
//     });

//     // Sort by timestamp (newest first)
//     filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//     const tmpc = await summariesMessage(filtered);
//     setContent(tmpc);
//     // console.log(tmpc, content);
//     setFilteredMessages(filtered);
//   };
//   useEffect(() => {
//     if (content?.summary) {
//       console.log(content);
//       fetchSummaries(item.id, selectedInterval, content?.summary);
//     }
//   }, [content]);
//   /**
//    * Formats time interval for display
//    * @param {number|string} interval - Size of interval in minutes or 'All'
//    * @returns {string} Formatted time interval
//    */
//   const formatTimeInterval = (interval) => {
//     if (interval === "All") return "All";
//     if (interval === null) return "Select";

//     // Convert to hours if 60 minutes or more
//     if (interval >= 60) {
//       const hours = interval / 60;
//       return `${hours} ${hours === 1 ? "hr" : "hrs"}`;
//     }

//     // Return minutes format for less than 60
//     return `${interval} min`;
//   };

//   /**
//    * Formats message timestamp for display
//    * @param {string} timestamp - ISO timestamp
//    * @returns {string} Formatted time
//    */
//   const formatMessageTime = (timestamp) => {
//     const messageDate = new Date(timestamp);
//     const now = new Date();
//     const diffMs = now - messageDate;
//     const diffMins = Math.floor(diffMs / 60000);

//     if (diffMins < 1) return "Just now";
//     if (diffMins < 60) return `${diffMins}m ago`;

//     const diffHours = Math.floor(diffMins / 60);
//     if (diffHours < 24) return `${diffHours}h ago`;

//     // For older messages, show the date
//     return messageDate.toLocaleDateString();
//   };

//   /**
//    * Gets sender name from user ID
//    * @param {string} senderId - User ID
//    * @returns {string} User name or truncated ID
//    */
//   const getSenderName = (senderId) => {
//     const user = mockUsers.find((u) => u.id === senderId);
//     return user?.name || senderId.substring(0, 8) + "...";
//   };

//   /**
//    * Fetches summaries from the API
//    * @param {string} conversationId - ID of the conversation
//    * @param {number|string} interval - Size of each interval in minutes or 'All'
//    */
//   const fetchSummaries = async (conversationId, interval, content) => {
//     if (interval === null) {
//       setSummaries([]);
//       setIsLoading(false);
//       return;
//     }
//     setIsLoading(true);
//     setError(null);

//     try {
//       // Here you would call your API endpoint
//       // const response = await yourApiService.getSummaries(conversationId, interval);
//       // setSummaries(response.data);

//       // For demonstration, we'll simulate an API response
//       // Replace this with your actual API call
//       setTimeout(() => {
//         // Mock different summaries based on interval
//         let mockSummaries = [];

//         if (interval === "All") {
//           mockSummaries = [
//             {
//               id: "overall",
//               title: "Entire Conversation",
//               content: content,
//               messageCount: allMessages.length || item?.messageCount || 75,
//             },
//           ];
//         } else {
//           // Use the actual filtered messages count for the selected interval
//           mockSummaries.push({
//             id: `interval-${interval}`,
//             title: `${formatTimeInterval(interval)} Summary`,
//             content: content,
//           });
//         }
//         setIsLoading(false);
//         setSummaries(mockSummaries);
//       }, 1000);
//     } catch (err) {
//       setError("Failed to fetch summaries. Please try again.");
//       setIsLoading(false);
//       console.error("Error fetching summaries:", err);
//     }
//   };

//   /**
//    * Forces a refresh of the summaries and messages
//    */
//   const refreshData = () => {
//     if (item?.id) {
//       fetchMessages();
//     } else {
//       Alert.alert("Error", "Conversation data is missing");
//     }
//   };

//   /**
//    * Handle interval selection
//    * @param {number|string} interval - Selected time interval
//    */
//   const handleIntervalSelect = (interval) => {
//     setSelectedInterval(interval);
//   };

//   /**
//    * Share summary with others
//    * @param {Object} summary - The summary to share
//    */
//   const handleShareSummary = (summary) => {
//     Alert.alert(
//       "Share Summary",
//       "This would share the selected summary with others.",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Share",
//           onPress: () => console.log("Sharing summary:", summary.id),
//         },
//       ]
//     );
//   };

//   /**
//    * Toggle between summary and messages view
//    */
//   const toggleViewMode = () => {
//     setViewMode(viewMode === "summary" ? "messages" : "summary");
//   };

//   /**
//    * Renders an individual message
//    */
//   const renderMessage = ({ item }) => (
//     <View style={styles.messageItem}>
//       <View style={styles.messageHeader}>
//         <Text style={styles.messageSender}>{getSenderName(item.sender)}</Text>
//         <Text style={styles.messageTime}>
//           {formatMessageTime(item.timestamp)}
//         </Text>
//       </View>
//       <Text style={styles.messageText}>{item.text}</Text>
//     </View>
//   );

//   return (
//     <View style={[styles.container, style]}>
//       {/* Time interval selector */}
//       <View style={styles.intervalSelector}>
//         <Text style={styles.intervalLabel}>Time interval:</Text>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.intervalOptions}
//         >
//           {timeIntervalOptions.map((interval) => (
//             <TouchableOpacity
//               key={`interval-${interval}`}
//               style={[
//                 styles.intervalOption,
//                 selectedInterval === interval && styles.selectedIntervalOption,
//               ]}
//               onPress={() => handleIntervalSelect(interval)}
//             >
//               <Text
//                 style={[
//                   styles.intervalOptionText,
//                   selectedInterval === interval &&
//                     styles.selectedIntervalOptionText,
//                 ]}
//               >
//                 {formatTimeInterval(interval)}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>

//       {/* View mode toggle */}
//       <View style={styles.viewModeToggle}>
//         <TouchableOpacity
//           style={[
//             styles.viewModeButton,
//             viewMode === "summary" && styles.activeViewMode,
//           ]}
//           onPress={() => setViewMode("summary")}
//         >
//           <MaterialIcons
//             name="summarize"
//             size={18}
//             color={viewMode === "summary" ? "#1E90FF" : "#666"}
//           />
//           <Text
//             style={[
//               styles.viewModeText,
//               viewMode === "summary" && styles.activeViewModeText,
//             ]}
//           >
//             Summary
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.viewModeButton,
//             viewMode === "messages" && styles.activeViewMode,
//           ]}
//           onPress={() => setViewMode("messages")}
//         >
//           <MaterialIcons
//             name="message"
//             size={18}
//             color={viewMode === "messages" ? "#1E90FF" : "#666"}
//           />
//           <Text
//             style={[
//               styles.viewModeText,
//               viewMode === "messages" && styles.activeViewModeText,
//             ]}
//           >
//             Messages ({filteredMessages.length})
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Error state */}
//       {error && (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity onPress={refreshData}>
//             <Text style={styles.refreshText}>Tap to retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Loading state */}
//       {isLoading && viewMode === "summary" ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#1E90FF" />
//           <Text style={styles.loadingText}>Generating summaries...</Text>
//         </View>
//       ) : viewMode === "summary" ? (
//         // Summaries display
//         <ScrollView style={styles.summariesContainer}>
//           {summaries.length > 0 ? (
//             summaries.map((summary) => (
//               <View key={summary.id} style={styles.summaryBlock}>
//                 <View style={styles.summaryHeader}>
//                   <Text style={styles.intervalTitle}>{summary.title}</Text>
//                   <TouchableOpacity
//                     style={styles.shareButton}
//                     onPress={() => handleShareSummary(summary)}
//                   >
//                     <Ionicons name="share-outline" size={20} color="#1E90FF" />
//                   </TouchableOpacity>
//                 </View>
//                 <Text style={styles.summaryText}>{summary.content}</Text>
//               </View>
//             ))
//           ) : (
//             <View style={styles.emptyContainer}>
//               <MaterialIcons
//                 name="chat-bubble-outline"
//                 size={64}
//                 color="#cccccc"
//               />
//               <Text style={styles.noSummaryText}>
//                 {selectedInterval === null
//                   ? "Please select a time interval to generate summary."
//                   : "No summaries available for this conversation."}
//               </Text>
//             </View>
//           )}
//         </ScrollView>
//       ) : (
//         // Messages display
//         <View style={styles.messagesContainer}>
//           {filteredMessages.length > 0 ? (
//             <FlatList
//               data={filteredMessages}
//               renderItem={renderMessage}
//               keyExtractor={(item) => item.id}
//               contentContainerStyle={styles.messagesList}
//             />
//           ) : (
//             <View style={styles.emptyContainer}>
//               <MaterialIcons name="forum" size={64} color="#cccccc" />
//               <Text style={styles.noMessagesText}>
//                 {selectedInterval === null
//                   ? "Please select a time interval to view messages."
//                   : "No messages in the selected time interval."}
//               </Text>
//               {selectedInterval !== null && (
//                 <TouchableOpacity
//                   style={styles.refreshButton}
//                   onPress={refreshData}
//                 >
//                   <Text style={styles.refreshButtonText}>Refresh Messages</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e5e5",
//     backgroundColor: "#fff",
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   infoButton: {
//     padding: 8,
//   },
//   intervalSelector: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e5e5",
//     backgroundColor: "#f8f9fa",
//   },
//   intervalLabel: {
//     fontSize: 14,
//     marginRight: 10,
//     color: "#555",
//     fontWeight: "500",
//   },
//   intervalOptions: {
//     flexGrow: 0,
//   },
//   intervalOption: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     backgroundColor: "#eaeaea",
//     borderRadius: 20,
//     marginRight: 8,
//   },
//   selectedIntervalOption: {
//     backgroundColor: "#1E90FF",
//   },
//   intervalOptionText: {
//     fontSize: 13,
//     color: "#333",
//   },
//   selectedIntervalOptionText: {
//     color: "#fff",
//     fontWeight: "500",
//   },
//   viewModeToggle: {
//     flexDirection: "row",
//     padding: 8,
//     justifyContent: "center",
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e5e5",
//   },
//   viewModeButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     marginHorizontal: 8,
//     borderRadius: 8,
//   },
//   activeViewMode: {
//     backgroundColor: "#f0f8ff",
//   },
//   viewModeText: {
//     marginLeft: 6,
//     fontSize: 14,
//     color: "#666",
//   },
//   activeViewModeText: {
//     color: "#1E90FF",
//     fontWeight: "500",
//   },
//   errorContainer: {
//     margin: 16,
//     padding: 15,
//     backgroundColor: "#ffebe6",
//     borderRadius: 8,
//   },
//   errorText: {
//     color: "#d73a49",
//     fontSize: 14,
//     marginBottom: 5,
//   },
//   refreshText: {
//     color: "#1E90FF",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 14,
//     color: "#666",
//   },
//   summariesContainer: {
//     flex: 1,
//     padding: 16,
//   },
//   summaryBlock: {
//     backgroundColor: "#fff",
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 16,
//     borderLeftWidth: 3,
//     borderLeftColor: "#1E90FF",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   summaryHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   intervalTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//     flex: 1,
//   },
//   shareButton: {
//     padding: 4,
//   },
//   messageCount: {
//     fontSize: 12,
//     color: "#666",
//     marginBottom: 10,
//   },
//   summaryText: {
//     fontSize: 14,
//     lineHeight: 20,
//     color: "#333",
//   },
//   messagesContainer: {
//     flex: 1,
//   },
//   messagesList: {
//     padding: 16,
//   },
//   messageItem: {
//     backgroundColor: "#f8f9fa",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 10,
//     borderLeftWidth: 2,
//     borderLeftColor: "#1E90FF",
//   },
//   messageHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 6,
//   },
//   messageSender: {
//     fontWeight: "600",
//     fontSize: 14,
//     color: "#333",
//   },
//   messageTime: {
//     fontSize: 12,
//     color: "#666",
//   },
//   messageText: {
//     fontSize: 14,
//     color: "#333",
//   },
//   emptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 40,
//     marginTop: 60,
//   },
//   noSummaryText: {
//     textAlign: "center",
//     fontSize: 16,
//     color: "#666",
//     marginTop: 16,
//     marginBottom: 24,
//   },
//   noMessagesText: {
//     textAlign: "center",
//     fontSize: 16,
//     color: "#666",
//     marginTop: 16,
//     marginBottom: 24,
//   },
//   refreshButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     backgroundColor: "#1E90FF",
//     borderRadius: 24,
//   },
//   refreshButtonText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "500",
//   },
// });

// export default SummaryMessages;
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { useAuth } from "../../../context/authContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getMessages } from "../../../api/message";
import { summariesMessage } from "../../../api/AI";

/**
 * SummaryMessages Component
 *
 * Displays conversation summaries fetched from API with user-selectable time intervals
 * and shows filtered messages within the selected time interval
 */
const SummaryMessages = ({ style }) => {
  const { user } = useAuth();
  const router = useRouter();
  const { rawItem, rawMockUsers, converName, converPic } =
    useLocalSearchParams();

  // Parse conversation data
  const item = rawItem ? JSON.parse(rawItem) : null;
  const mockUsers = rawMockUsers ? JSON.parse(rawMockUsers) : [];

  // Available time interval options in minutes
  const timeIntervalOptions = [15, 30, 60, 120, 360, 720, "All"];

  const [summaries, setSummaries] = useState([]);
  const [selectedInterval, setSelectedInterval] = useState(null); // Start with null selected interval
  const [isLoading, setIsLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [viewMode, setViewMode] = useState("summary"); // "summary" or "messages"

  // Initial load of messages only
  useEffect(() => {
    if (item?.id) {
      fetchMessages();
    }
  }, []);

  // Handle interval changes
  useEffect(() => {
    if (item?.id && selectedInterval !== null) {
      filterMessagesByTimeInterval(selectedInterval);
    } else {
      // Clear filtered messages and summaries when no interval is selected
      setFilteredMessages([]);
      setSummaries([]);
    }
  }, [selectedInterval, allMessages]);

  /**
   * Fetches all messages for the conversation
   */
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const messages = await getMessages(item.id);
      const visibleMessages = messages.filter(
        (msg) => !msg.hidden_to || !msg.hidden_to.includes(user.id)
      );

      // Sort by timestamp (newest first)
      visibleMessages.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setAllMessages(visibleMessages);
      setIsLoading(false);
      return visibleMessages;
    } catch (err) {
      console.error("Error fetching messages:", err);
      setIsLoading(false);
      setError("Failed to fetch messages. Please try again.");
      return [];
    }
  };

  /**
   * Filters messages based on selected time interval and generates a summary
   * @param {number|string} interval - Size of interval in minutes or 'All'
   */
  const filterMessagesByTimeInterval = async (interval) => {
    if (!allMessages || allMessages.length === 0) {
      setFilteredMessages([]);
      setSummaries([]);
      return;
    }

    let filtered = [];

    if (interval === "All") {
      filtered = [...allMessages];
    } else {
      const currentTime = new Date();
      const cutoffTime = new Date(currentTime.getTime() - interval * 60000); // Convert minutes to milliseconds

      filtered = allMessages.filter((message) => {
        const messageTime = new Date(message.timestamp);
        return messageTime >= cutoffTime;
      });
    }

    setFilteredMessages(filtered);

    // Generate summary if we have messages
    if (filtered.length > 0) {
      setSummaryLoading(true);
      // Create a placeholder summary while generating
      setSummaries([
        {
          id: interval === "All" ? "overall" : `interval-${interval}`,
          title:
            interval === "All"
              ? "Entire Conversation"
              : `${formatTimeInterval(interval)} Summary`,
          content: "Generating summary...",
          messageCount: filtered.length,
          isPlaceholder: true,
        },
      ]);

      try {
        const summaryContent = await summariesMessage(filtered);
        if (summaryContent?.summary) {
          updateSummaryContent(interval, summaryContent.summary);
        }
      } catch (err) {
        console.error("Error generating summary:", err);
        // Keep the placeholder but update the content to show error
        setSummaries([
          {
            id: interval === "All" ? "overall" : `interval-${interval}`,
            title:
              interval === "All"
                ? "Entire Conversation"
                : `${formatTimeInterval(interval)} Summary`,
            content: "Could not generate summary. Please try again.",
            messageCount: filtered.length,
            isPlaceholder: false,
          },
        ]);
      } finally {
        setSummaryLoading(false);
      }
    } else {
      // No messages in the time interval
      setSummaries([
        {
          id: interval === "All" ? "overall" : `interval-${interval}`,
          title:
            interval === "All"
              ? "Entire Conversation"
              : `${formatTimeInterval(interval)} Summary`,
          content: "No messages found in this time interval.",
          messageCount: 0,
          isPlaceholder: false,
        },
      ]);
    }
  };

  /**
   * Updates the summaries state with the new summary content
   * @param {number|string} interval - Size of interval in minutes or 'All'
   * @param {string} content - The summary content
   */
  const updateSummaryContent = (interval, content) => {
    let title =
      interval === "All"
        ? "Entire Conversation"
        : `${formatTimeInterval(interval)} Summary`;

    const newSummary = {
      id: interval === "All" ? "overall" : `interval-${interval}`,
      title: title,
      content: content,
      messageCount: filteredMessages.length,
    };

    setSummaries([newSummary]);
  };

  /**
   * Formats time interval for display
   * @param {number|string} interval - Size of interval in minutes or 'All'
   * @returns {string} Formatted time interval
   */
  const formatTimeInterval = (interval) => {
    if (interval === "All") return "All";
    if (interval === null) return "Select";

    // Convert to hours if 60 minutes or more
    if (interval >= 60) {
      const hours = interval / 60;
      return `${hours} ${hours === 1 ? "hr" : "hrs"}`;
    }

    // Return minutes format for less than 60
    return `${interval} min`;
  };

  /**
   * Formats message timestamp for display
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted time
   */
  const formatMessageTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    // For older messages, show the date
    return messageDate.toLocaleDateString();
  };

  /**
   * Gets sender name from user ID
   * @param {string} senderId - User ID
   * @returns {string} User name or truncated ID
   */
  const getSenderName = (senderId) => {
    const user = mockUsers.find((u) => u.id === senderId);
    return user?.full_name || senderId.substring(0, 8) + "...";
  };

  /**
   * Fetches summaries from the API
   * @param {string} conversationId - ID of the conversation
   * @param {number|string} interval - Size of each interval in minutes or 'All'
   */
  const fetchSummaries = async (conversationId, interval) => {
    if (interval === null) {
      setSummaries([]);
      return;
    }

    setSummaryLoading(true);
    setError(null);

    try {
      // Create a placeholder summary while waiting
      setSummaries([
        {
          id: interval === "All" ? "overall" : `interval-${interval}`,
          title:
            interval === "All"
              ? "Entire Conversation"
              : `${formatTimeInterval(interval)} Summary`,
          content: "Generating summary...",
          messageCount: filteredMessages.length || 0,
          isPlaceholder: true,
        },
      ]);

      // In a real implementation, you would call your API here
      // For now, we'll let filterMessagesByTimeInterval handle the summary generation
    } catch (err) {
      setError("Failed to fetch summaries. Please try again.");
      console.error("Error fetching summaries:", err);
    }
  };

  /**
   * Forces a refresh of the summaries and messages
   */
  const refreshData = () => {
    if (item?.id) {
      // Reset summaries to show loading state
      if (selectedInterval !== null) {
        setSummaryLoading(true);
        setSummaries([]);
      }

      fetchMessages().then((messages) => {
        if (selectedInterval !== null && messages.length > 0) {
          filterMessagesByTimeInterval(selectedInterval);
        }
      });
    } else {
      Alert.alert("Error", "Conversation data is missing");
    }
  };

  /**
   * Handle interval selection
   * @param {number|string} interval - Selected time interval
   */
  const handleIntervalSelect = (interval) => {
    setSelectedInterval(interval);
  };

  /**
   * Share summary with others
   * @param {Object} summary - The summary to share
   */
  const handleShareSummary = (summary) => {
    Alert.alert(
      "Share Summary",
      "This would share the selected summary with others.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Share",
          onPress: () => console.log("Sharing summary:", summary.id),
        },
      ]
    );
  };

  /**
   * Toggle between summary and messages view
   */
  const toggleViewMode = () => {
    setViewMode(viewMode === "summary" ? "messages" : "summary");
  };

  /**
   * Renders an individual message
   */
  const renderMessage = ({ item }) => (
    <View style={styles.messageItem}>
      <View style={styles.messageHeader}>
        <Text style={styles.messageSender}>{getSenderName(item.sender)}</Text>
        <Text style={styles.messageTime}>
          {formatMessageTime(item.timestamp)}
        </Text>
      </View>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Time interval selector */}
      <View style={styles.intervalSelector}>
        <Text style={styles.intervalLabel}>Time interval:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.intervalOptions}
        >
          {timeIntervalOptions.map((interval) => (
            <TouchableOpacity
              key={`interval-${interval}`}
              style={[
                styles.intervalOption,
                selectedInterval === interval && styles.selectedIntervalOption,
              ]}
              onPress={() => handleIntervalSelect(interval)}
            >
              <Text
                style={[
                  styles.intervalOptionText,
                  selectedInterval === interval &&
                    styles.selectedIntervalOptionText,
                ]}
              >
                {formatTimeInterval(interval)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* View mode toggle */}
      <View style={styles.viewModeToggle}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === "summary" && styles.activeViewMode,
          ]}
          onPress={() => setViewMode("summary")}
        >
          <MaterialIcons
            name="summarize"
            size={18}
            color={viewMode === "summary" ? "#1E90FF" : "#666"}
          />
          <Text
            style={[
              styles.viewModeText,
              viewMode === "summary" && styles.activeViewModeText,
            ]}
          >
            Summary
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === "messages" && styles.activeViewMode,
          ]}
          onPress={() => setViewMode("messages")}
        >
          <MaterialIcons
            name="message"
            size={18}
            color={viewMode === "messages" ? "#1E90FF" : "#666"}
          />
          <Text
            style={[
              styles.viewModeText,
              viewMode === "messages" && styles.activeViewModeText,
            ]}
          >
            Messages ({filteredMessages.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error state */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refreshData}>
            <Text style={styles.refreshText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main content area */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E90FF" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : viewMode === "summary" ? (
        // Summaries display
        <ScrollView style={styles.summariesContainer}>
          {selectedInterval === null ? (
            // No interval selected yet
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="chat-bubble-outline"
                size={64}
                color="#cccccc"
              />
              <Text style={styles.noSummaryText}>
                Please select a time interval above to generate a summary.
              </Text>
            </View>
          ) : allMessages.length === 0 ? (
            // No messages in the conversation
            <View style={styles.emptyContainer}>
              <MaterialIcons name="forum" size={64} color="#cccccc" />
              <Text style={styles.noSummaryText}>
                No messages found in this conversation.
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={refreshData}
              >
                <Text style={styles.refreshButtonText}>Refresh Messages</Text>
              </TouchableOpacity>
            </View>
          ) : summaryLoading && summaries.length === 0 ? (
            // Loading state with no existing summary
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1E90FF" />
              <Text style={styles.loadingText}>Generating summary...</Text>
            </View>
          ) : summaries.length > 0 ? (
            // Display summaries
            <>
              {summaries.map((summary) => (
                <View key={summary.id} style={styles.summaryBlock}>
                  <View style={styles.summaryHeader}>
                    <Text style={styles.intervalTitle}>{summary.title}</Text>
                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={() => handleShareSummary(summary)}
                    >
                      <Ionicons
                        name="share-outline"
                        size={20}
                        color="#1E90FF"
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.summaryText}>
                    {summary.isPlaceholder && summaryLoading
                      ? "Generating summary..."
                      : summary.content}
                  </Text>
                </View>
              ))}
            </>
          ) : (
            // Fallback for no summaries but interval selected
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="chat-bubble-outline"
                size={64}
                color="#cccccc"
              />
              <Text style={styles.noSummaryText}>
                No summary available. Please try another time interval.
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        // Messages display
        <View style={styles.messagesContainer}>
          {selectedInterval === null ? (
            // No interval selected yet
            <View style={styles.emptyContainer}>
              <MaterialIcons name="forum" size={64} color="#cccccc" />
              <Text style={styles.noMessagesText}>
                Please select a time interval above to view messages.
              </Text>
            </View>
          ) : allMessages.length === 0 ? (
            // No messages in the conversation
            <View style={styles.emptyContainer}>
              <MaterialIcons name="forum" size={64} color="#cccccc" />
              <Text style={styles.noMessagesText}>
                No messages found in this conversation.
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={refreshData}
              >
                <Text style={styles.refreshButtonText}>Refresh Messages</Text>
              </TouchableOpacity>
            </View>
          ) : filteredMessages.length > 0 ? (
            // Messages found in the selected interval
            <FlatList
              data={filteredMessages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
            />
          ) : (
            // No messages in the selected interval
            <View style={styles.emptyContainer}>
              <MaterialIcons name="forum" size={64} color="#cccccc" />
              <Text style={styles.noMessagesText}>
                No messages in the selected time interval.
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={refreshData}
              >
                <Text style={styles.refreshButtonText}>Refresh Messages</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  infoButton: {
    padding: 8,
  },
  intervalSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    backgroundColor: "#f8f9fa",
  },
  intervalLabel: {
    fontSize: 14,
    marginRight: 10,
    color: "#555",
    fontWeight: "500",
  },
  intervalOptions: {
    flexGrow: 0,
  },
  intervalOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#eaeaea",
    borderRadius: 20,
    marginRight: 8,
  },
  selectedIntervalOption: {
    backgroundColor: "#1E90FF",
  },
  intervalOptionText: {
    fontSize: 13,
    color: "#333",
  },
  selectedIntervalOptionText: {
    color: "#fff",
    fontWeight: "500",
  },
  viewModeToggle: {
    flexDirection: "row",
    padding: 8,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  viewModeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  activeViewMode: {
    backgroundColor: "#f0f8ff",
  },
  viewModeText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
  },
  activeViewModeText: {
    color: "#1E90FF",
    fontWeight: "500",
  },
  errorContainer: {
    margin: 16,
    padding: 15,
    backgroundColor: "#ffebe6",
    borderRadius: 8,
  },
  errorText: {
    color: "#d73a49",
    fontSize: 14,
    marginBottom: 5,
  },
  refreshText: {
    color: "#1E90FF",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  summaryLoadingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    marginBottom: 10,
  },
  summaryLoadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#1E90FF",
  },
  summariesContainer: {
    flex: 1,
    padding: 16,
  },
  summaryBlock: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#1E90FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  intervalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  shareButton: {
    padding: 4,
  },
  messageCount: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageItem: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#1E90FF",
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  messageSender: {
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
  },
  messageTime: {
    fontSize: 12,
    color: "#666",
  },
  messageText: {
    fontSize: 14,
    color: "#333",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 60,
  },
  noSummaryText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  noMessagesText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  refreshButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#1E90FF",
    borderRadius: 24,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default SummaryMessages;
