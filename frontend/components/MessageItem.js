import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

const MessageItem = ({ message, currentUser }) => {
  const isMyMessage = currentUser?.id === message?.sender;
  return (
    <View
      style={[
        styles.container,
        { justifyContent: isMyMessage ? "flex-end" : "flex-start" },
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.text}>{message?.text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 8,
    width: width * 0.98,
    alignSelf: "center",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  myMessage: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#E0E7FF",
    borderColor: "#A5B4FC",
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 16,
  },
});

export default MessageItem;
