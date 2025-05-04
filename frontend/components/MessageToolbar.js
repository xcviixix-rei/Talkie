import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Alert,
  ToastAndroid,
  TouchableWithoutFeedback,
} from "react-native";

import { Copy, Reply, Trash } from "lucide-react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";
import { deleteMessage } from "../api/message";
import TranslatedMessage from "./TranlatedMessage";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP,
} from "react-native-responsive-screen";

export default function MessageToolbar({ message, onDismiss, user }) {
  // Animation for the toolbar appearing
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const [onTranslate, setOnTranslate] = useState(false);
  const handleCopy = () => {
    try {
      Clipboard.setStringAsync(message.text || "");
      ToastAndroid.show("Copied to clipboard", ToastAndroid.SHORT);
      onDismiss();
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  // Handle reply to message
  const handleReply = () => {
    // Implement reply functionality
    // This would typically involve passing the message ID to a parent component
    onDismiss();
  };

  // Handle delete message
  const handleDelete = () => {
    onDismiss();
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this message?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMessage(message.id, user.id, message.sender);
          },
        },
      ]
    );
  };

  // Handle share message
  const handleTranslate = () => {
    setOnTranslate(true);
  };

  return onTranslate ? (
    <TranslatedMessage
      text={message.text || message.content || ""}
      from="en"
      to="vi"
    />
  ) : (
    <Animated.View
      style={[
        styles.toolbarContainer,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleCopy}>
          <Copy size={20} color="#333" />
          <Text style={styles.buttonText}>Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={handleReply}>
          <Reply size={20} color="#333" />
          <Text style={styles.buttonText}>Reply</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={handleTranslate}
        >
          <Icon name="translate" size={20} color="#333" />
          <Text style={styles.buttonText}>Transtale</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={handleDelete}>
          <Trash size={20} color="#E53935" />
          <Text style={[styles.buttonText, { color: "#E53935" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toolbarContainer: {
    position: "absolute",
    bottom: hp(-19),
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  toolbar: {
    width: widthPercentageToDP(100),
    //    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    alignItems: "center",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  toolbarButton: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  buttonText: {
    marginTop: 4,
    fontSize: 12,
    color: "#333",
  },
  closeButton: {
    marginLeft: 12,
    alignSelf: "center",
  },
});
