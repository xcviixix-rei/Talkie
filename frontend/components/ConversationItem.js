import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { fetchUserData } from "../api/user";

export default function ConversationItem({
  item,
  router,
  noBorder,
  currentUser,
}) {
  const [lastMessage, setLastMessage] = useState(undefined);
  const [mockUsers, setMockUsers] = useState([]);
  const [formattedTime, setFormattedTime] = useState("");

  const openConversation = () => {
    console.log("item" + JSON.stringify(item));
    console.log("mockUsers" + JSON.stringify(mockUsers));
    router.push({
      pathname: "/conversation",
      params: {
        rawItem: JSON.stringify(item),
        rawMockUsers: JSON.stringify(mockUsers),
      },
    });
  };

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

  // Function to determine if an attachment is an image or voice by examining its URL or file extension
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

  const getMessagePreview = (message, usersData) => {
    if (!message) return "";

    const senderName =
      message.sender === currentUser.id
        ? "You"
        : usersData.find((user) => user?.id === message.sender)?.full_name ||
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

  useFocusEffect(
    useCallback(() => {
      const fetchAndSetData = async () => {
        try {
          // We need to use the actual user data here, not rely on the state which may not be updated yet
          const usersData = await Promise.all(
            item.participants.map(async (participantId) => {
              return fetchUserData(participantId);
            })
          );

          // Update state with the fetched data
          setMockUsers(usersData);
          // Set last message text using the freshly fetched user data
          const previewText = getMessagePreview(item?.last_message, usersData);
          setLastMessage(previewText);

          // Set formatted time
          if (item?.last_message?.timestamp) {
            setFormattedTime(formatMessageTime(item.last_message.timestamp));
          }
        } catch (err) {
          console.log("Error setting data:", err);
        }
      };

      fetchAndSetData();

      // Set up timer to refresh the time display every minute
      const timeInterval = setInterval(() => {
        if (item?.last_message?.timestamp) {
          setFormattedTime(formatMessageTime(item.last_message.timestamp));
        }
      }, 60000); // Update every minute

      return () => clearInterval(timeInterval);
    }, [item?.last_message])
  );

  return (
    <TouchableOpacity
      onPress={openConversation}
      style={[styles.container, noBorder && styles.noBorder]}
    >
      <Image
        source={
          mockUsers?.find((u) => u?.profile_pic)
            ? { uri: mockUsers.find((u) => u?.profile_pic).profile_pic }
            : require("../assets/images/icon.png")
        }
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <View style={styles.row}>
          <Text style={styles.nameText}>
            {mockUsers
              .filter((user) => user.id !== currentUser.id)
              .map((user) => user.full_name)
              .join(", ")}
          </Text>
          <Text style={styles.timeText}>{formattedTime}</Text>
        </View>
        <Text style={styles.messageText} numberOfLines={1} ellipsizeMode="tail">
          {lastMessage}
        </Text>
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
  image: {
    height: hp(6),
    width: hp(6),
    borderRadius: 9999, // Fully rounded image
  },
  textContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameText: {
    fontSize: hp(2),
    fontWeight: "600",
    color: "#333",
  },
  timeText: {
    fontSize: hp(1.8),
    color: "#777",
  },
  messageText: {
    fontSize: hp(2),
    color: "#333",
  },
});
