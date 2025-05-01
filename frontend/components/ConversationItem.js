import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { fetchUserData } from "../api/user";

// Function to check if user is active (within last 5 minutes)
export const checkActiveStatus = (statusTimestamp) => {
  if (!statusTimestamp) return false;

  const statusDate = new Date(statusTimestamp);
  const now = new Date();
  const diffMs = now - statusDate;
  const diffMinutes = Math.floor(diffMs / 60000); // Convert ms to minutes

  // Consider active if within last 5 minutes
  return diffMinutes < 5;
};

// Find the most recently active user who is not the current user
export const getLastActiveUser = (users, currentUser) => {
  if (!users || users.length === 0) return null;

  // Get all non-current users
  const otherUsers = users.filter((user) => user.id !== currentUser.id);

  // Sort by most recent status timestamp
  const sortedOtherUsers = [...otherUsers].sort((a, b) => {
    const statusA = a.status ? new Date(a.status).getTime() : 0;
    const statusB = b.status ? new Date(b.status).getTime() : 0;
    return statusB - statusA; // Most recent first
  });

  // Get the most recently active user
  return sortedOtherUsers.length > 0 ? sortedOtherUsers[0] : null;
};

// Format active status time for display
export const formatActiveTime = (statusTimestamp) => {
  if (!statusTimestamp) return "Offline";

  const statusDate = new Date(statusTimestamp);
  const now = new Date();
  const diffMs = now - statusDate;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Active now
  if (diffMinutes < 5) {
    return "Active now";
  }

  // Minutes ago
  if (diffHours < 1) {
    return `Active ${diffMinutes}m ago`;
  }

  // Hours ago
  if (diffDays < 1) {
    return `Active ${diffHours}h ago`;
  }

  // Days ago
  if (diffDays < 7) {
    return `Active ${diffDays}d ago`;
  }

  return "Offline";
};

export default function ConversationItem({
  item,
  router,
  noBorder,
  currentUser,
}) {
  const [lastMessage, setLastMessage] = useState("");
  const [mockUsers, setMockUsers] = useState([]);
  const [formattedTime, setFormattedTime] = useState("");
  const [converName, setConverName] = useState("");
  const [converPic, setConverPic] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState("");

  // Format time like Messenger (now, minutes, hours, yesterday, date)
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Just now - less than 1 minute
    if (diffMinutes < 1) {
      return "Now";
    }

    // Minutes ago - less than 1 hour
    if (diffHours < 1) {
      return `${diffMinutes}m`;
    }

    // Hours ago - less than 24 hours
    if (diffDays < 1) {
      return `${diffHours}h`;
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (messageDate.setHours(0, 0, 0, 0) === yesterday.setHours(0, 0, 0, 0)) {
      return "Yesterday";
    }

    // This week - less than 7 days
    if (diffDays < 7) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[messageDate.getDay()];
    }

    // More than a week ago
    return `${messageDate.getDate()}/${messageDate.getMonth() + 1}/${messageDate
      .getFullYear()
      .toString()
      .slice(2)}`;
  };

  // Function to determine if an attachment is an image or voice
  const getAttachmentType = (attachment) => {
    if (!attachment || (!attachment.url && !attachment.uri)) return "unknown";

    const url = attachment.url || attachment.uri;

    // Check for voice/audio file extensions or formats
    if (
      url.match(/\.(mp3|wav|ogg|m4a|aac)$/i) ||
      url.includes("voice") ||
      url.includes("audio") ||
      attachment.type === "voice" ||
      attachment.type === "audio"
    ) {
      return "voice";
    }

    // Check for image file extensions or formats
    if (
      url.match(/\.(jpg|jpeg|png|gif|bmp|webp|heic)$/i) ||
      url.includes("image") ||
      attachment.type === "image" ||
      attachment.type === "photo"
    ) {
      return "image";
    }

    return "file"; // Default to generic file
  };

  const getMessagePreview = (message, users) => {
    if (!message) return "";

    const senderName =
      message.sender === currentUser.id
        ? "You"
        : users.find((user) => user?.id === message.sender)?.full_name ||
          "Unknown";

    // Check for voice message
    if (message?.voice_message) {
      return `${senderName}: Voice message`;
    }

    // Check for image attachments
    if (message.attachments && message.attachments.length > 0) {
      // Group attachments by type
      const attachmentTypes = message.attachments.map(getAttachmentType);

      const imageCount = attachmentTypes.filter(
        (type) => type === "image"
      ).length;
      const voiceCount = attachmentTypes.filter(
        (type) => type === "voice"
      ).length;
      const fileCount = attachmentTypes.filter(
        (type) => type === "file"
      ).length;

      // Prioritize voice messages
      if (voiceCount > 0) {
        return `${senderName}: sent a voice message`;
      }

      // Then check for images
      if (imageCount > 0) {
        return `${senderName}: sent ${
          imageCount > 1 ? `${imageCount} photos` : "a photo"
        }`;
      }

      // Generic files as fallback
      if (fileCount > 0) {
        return `${senderName}: sent ${
          fileCount > 1 ? `${fileCount} files` : "a file"
        }`;
      }
    }

    // Regular text message
    return `${senderName}: ${message.text || ""}`;
  };

  const openConversation = () => {
    router.push({
      pathname: "/conversation",
      params: {
        rawItem: JSON.stringify(item),
        rawMockUsers: JSON.stringify(mockUsers),
        converName,
        converPic,
      },
    });
  };

  // Update all display states based on the fetched user data
  const updateDisplayStates = (users) => {
    if (!users || users.length === 0) return;

    try {
      // Get the other users in the conversation
      const otherUsers = users.filter((user) => user.id !== currentUser.id);

      // Set conversation name - use conversation name if defined, otherwise join names of other users
      setConverName(
        item?.name
          ? item.name
          : otherUsers.map((user) => user.full_name).join(", ")
      );

      // Set conversation picture - use conversation pic if defined, otherwise first other user's profile pic
      const profilePic = otherUsers.find((u) => u?.profile_pic)?.profile_pic;
      setConverPic(
        item?.conver_pic
          ? item.conver_pic
          : profilePic || "https://www.gravatar.com/avatar/?d=identicon"
      );

      // Check and set active status based on most recently active user
      const mostRecentUser = getLastActiveUser(users, currentUser);
      if (mostRecentUser?.status) {
        setIsActive(checkActiveStatus(mostRecentUser.status));
        setLastActiveTime(formatActiveTime(mostRecentUser.status));
      }

      // Set last message preview
      if (item?.last_message) {
        setLastMessage(getMessagePreview(item.last_message, users));
        setFormattedTime(formatMessageTime(item.last_message.timestamp));
      }
    } catch (err) {
      console.error("Error updating display states:", err);
    }
  };

  // Refresh time displays
  const refreshTimeDisplays = () => {
    if (item?.last_message) {
      setLastMessage(getMessagePreview(item.last_message, mockUsers));
      setFormattedTime(formatMessageTime(item.last_message.timestamp));
    }

    // Refresh active status based on the stored mock users
    const latestActiveUser = getLastActiveUser(mockUsers, currentUser);
    if (latestActiveUser?.status) {
      setIsActive(checkActiveStatus(latestActiveUser.status));
      setLastActiveTime(formatActiveTime(latestActiveUser.status));
    }
  };

  // Set up data fetching when the component gains focus
  useFocusEffect(
    useCallback(() => {
      const fetchAndSetData = async () => {
        try {
          // Fetch user data for all participants
          const usersData = await Promise.all(
            item.participants.map(async (participant) => {
              return fetchUserData(participant?.id || participant);
            })
          );

          // Only update state if component is still mounted
          setMockUsers(usersData);
          updateDisplayStates(usersData);
        } catch (err) {
          console.error("Error fetching conversation data:", err);
        }
      };

      fetchAndSetData();

      // Set up timer to refresh time displays every minute
      const timeInterval = setInterval(refreshTimeDisplays, 60000);

      // Cleanup function
      return () => {
        clearInterval(timeInterval);
      };
    }, [item.last_message.text]) // Only re-run when conversation ID or last message ID changes
  );

  // Also refresh when the component mounts/updates
  useEffect(() => {
    if (mockUsers.length > 0) {
      refreshTimeDisplays();
    }
  }, [mockUsers]);

  return (
    <TouchableOpacity
      onPress={openConversation}
      style={[styles.container, noBorder && styles.noBorder]}
      testID="conversation-item"
    >
      <View style={styles.imageContainer}>
        <Image
          source={
            converPic && converPic.trim() !== ""
              ? { uri: converPic }
              : { uri: "https://www.gravatar.com/avatar/?d=identicon" }
          }
          style={styles.image}
          onError={() =>
            setConverPic("https://www.gravatar.com/avatar/?d=identicon")
          }
        />
        {isActive && <View style={styles.activeIndicator} />}
      </View>
      <View style={styles.textContainer}>
        <View style={styles.row}>
          <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
            {converName}
          </Text>
          <Text style={styles.timeText}>{formattedTime}</Text>
        </View>
        <View style={styles.row}>
          <Text
            style={styles.messageText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {lastMessage}
          </Text>
          {
            <Text style={styles.activeTimeText} numberOfLines={1}>
              {lastActiveTime}
            </Text>
          }
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
  noBorder: {
    borderBottomWidth: 0, // Removes border when applied
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    height: hp(6),
    width: hp(6),
    borderRadius: 9999, // Fully rounded image
  },
  activeIndicator: {
    position: "absolute",
    right: 0,
    bottom: 0,
    height: hp(2),
    width: hp(2),
    backgroundColor: "#4CAF50", // Green color for active status
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  textContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameText: {
    fontSize: hp(2),
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: hp(1.8),
    color: "#777",
  },
  messageText: {
    fontSize: hp(2),
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  activeTimeText: {
    fontSize: hp(1.6),
    color: "#777",
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
});
