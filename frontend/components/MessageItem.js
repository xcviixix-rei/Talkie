import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";

const { width, height } = Dimensions.get("window");

const MessageItem = ({ message, currentUser }) => {
  const isMyMessage = currentUser?.id === message?.sender;
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  return (
    <View
      style={[
        styles.container,
        { alignItems: isMyMessage ? "flex-end" : "flex-start" },
      ]}
    >
      {/* Text Message */}
      {message?.text ? (
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Text
            style={[
              styles.text,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {message.text}
          </Text>
        </View>
      ) : null}

      {/* Attachments */}
      {Array.isArray(message.attachments) && message.attachments.length > 0 && (
        <View
          style={[
            styles.attachmentsContainer,
            { alignSelf: isMyMessage ? "flex-end" : "flex-start" },
          ]}
        >
          {message.attachments.length === 1 ? (
            // Single image - larger display
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                handleImagePress(
                  message.attachments[0].url || message.attachments[0].uri
                )
              }
            >
              <Image
                source={{
                  uri: message.attachments[0].url || message.attachments[0].uri,
                }}
                style={styles.singleAttachmentImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            // Multiple images - grid layout
            <View style={styles.multipleAttachmentsContainer}>
              {message.attachments.map((attachment, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  onPress={() =>
                    handleImagePress(attachment.url || attachment.uri)
                  }
                  style={styles.multipleImageWrapper}
                >
                  <Image
                    source={{ uri: attachment.url || attachment.uri }}
                    style={styles.multipleAttachmentImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Image Viewer Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.closeButton} onPress={closeImageViewer}>
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>

          <Image
            source={{ uri: selectedImage }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    marginBottom: 3,
    width: width * 0.98,
    alignSelf: "center",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 18,
    maxWidth: width * 0.75,
    marginBottom: 4,
  },
  myMessage: {
    backgroundColor: "#0084FF",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#F0F0F0",
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#FFFFFF",
  },
  otherMessageText: {
    color: "#000000",
  },
  attachmentsContainer: {
    maxWidth: width * 0.75,
    marginTop: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  singleAttachmentImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 12,
  },
  multipleAttachmentsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    borderRadius: 12,
    overflow: "hidden",
    width: width * 0.6,
  },
  multipleImageWrapper: {
    width: "49%",
    marginBottom: 4,
  },
  multipleAttachmentImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: width * 0.9,
    height: height * 0.7,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
});

export default MessageItem;
