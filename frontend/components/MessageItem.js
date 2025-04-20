import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
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
        { justifyContent: isMyMessage ? "flex-end" : "flex-start" },
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage,
          message?.attachments?.length > 0 &&
            styles.messageBubbleWithAttachments,
        ]}
      >
        {message?.text ? <Text style={styles.text}>{message.text}</Text> : null}

        {Array.isArray(message.attachments) &&
          message.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
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
                      uri:
                        message.attachments[0].url ||
                        message.attachments[0].uri,
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
      </View>

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
    flexDirection: "row",
    marginBottom: 8,
    width: width * 0.98,
    alignSelf: "center",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 18,
    maxWidth: width * 0.75,
  },
  messageBubbleWithAttachments: {
    padding: 8,
    paddingBottom: 8,
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
    marginBottom: 6,
    color: "#FFFFFF",
    lineHeight: 20,
  },
  attachmentsContainer: {
    overflow: "hidden",
  },
  singleAttachmentImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 12,
    marginTop: 4,
  },
  multipleAttachmentsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: 4,
  },
  multipleImageWrapper: {
    width: "48%",
    marginRight: "2%",
    marginBottom: "2%",
  },
  multipleAttachmentImage: {
    width: "100%",
    height: width * 0.3,
    borderRadius: 12,
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
