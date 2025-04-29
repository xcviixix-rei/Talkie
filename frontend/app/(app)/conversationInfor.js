import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useAuth } from "../../context/authContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  editConversation,
  blockUser,
  muteConversation,
} from "../../api/conversation";
import { useNavigation } from "@react-navigation/native";
import mediaService from "../../services/mediaService";
import uploadMediaService from "../../services/uploadMediaService";
import * as ImagePicker from "expo-image-picker";

export default function ConversationInfo() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    rawItem,
    rawMockUsers,
    converName: initialConverName,
    converPic: initialConverPic,
  } = useLocalSearchParams();
  const item = JSON.parse(rawItem);
  const mockUsers = JSON.parse(rawMockUsers);
  const [isMuted, setIsMuted] = useState(item?.isMuted || false);
  const [isBlocked, setIsBlocked] = useState(item?.isBlocked || false);
  const [mediaCount, setMediaCount] = useState({
    photos: 0,
    videos: 0,
    files: 0,
  });

  // Editable states
  const [converName, setConverName] = useState(initialConverName || "User");
  const [converPic, setConverPic] = useState(initialConverPic || null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(initialConverName || "User");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock function to get media counts
    const getMediaCounts = () => {
      // In a real app, this would fetch from your backend
      setMediaCount({
        photos: Math.floor(Math.random() * 50),
        videos: Math.floor(Math.random() * 20),
        files: Math.floor(Math.random() * 15),
      });
    };

    getMediaCounts();
  }, []);

  const handleMuteToggle = async () => {
    try {
      await muteConversation(item.id, !isMuted);
      setIsMuted(!isMuted);
      Alert.alert(
        !isMuted ? "Conversation Muted" : "Conversation Unmuted",
        !isMuted
          ? "You won't receive notifications for this conversation"
          : "You will now receive notifications for this conversation"
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update mute settings");
    }
  };

  const handleEditProfilePic = async () => {
    const image = await mediaService.handleSingleImagePicker();
    const path = `${user.id}/images/${image.name}`;
    try {
      const uploadResult = await uploadMediaService.uploadFile(
        image.uri,
        path,
        image.type
      );

      if (uploadResult.success) {
        setConverPic(uploadResult.publicUrl);
        editConversation(item.id, uploadResult.publicUrl, converName);
      } else {
        console.error("Failed to upload image:", uploadResult.error);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleBlockUser = async () => {
    if (!isBlocked) {
      Alert.alert(
        "Block User",
        "Are you sure you want to block this user? You won't receive messages from them anymore.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Block",
            style: "destructive",
            onPress: async () => {
              try {
                await blockUser(item.id, true);
                setIsBlocked(true);
                Alert.alert(
                  "User Blocked",
                  "You won't receive messages from this user anymore"
                );
              } catch (error) {
                Alert.alert("Error", "Failed to block user");
              }
            },
          },
        ]
      );
    } else {
      try {
        await blockUser(item.id, false);
        setIsBlocked(false);
        Alert.alert(
          "User Unblocked",
          "You will now receive messages from this user"
        );
      } catch (error) {
        Alert.alert("Error", "Failed to unblock user");
      }
    }
  };

  const handleDeleteConversation = () => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this conversation? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Handle deletion logic here
            router.back();
          },
        },
      ]
    );
  };

  const handleEditNameStart = () => {
    setTempName(converName);
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    if (tempName.trim() === "") {
      Alert.alert("Error", "Conversation name cannot be empty");
      return;
    }

    // router.back(), setIsLoading(true);

    try {
      editConversation(item.id, null, tempName);
      setConverName(tempName);
      setIsEditingName(false);
      Alert.alert("Success", "Conversation name updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update conversation name");
    } finally {
      setIsLoading(false);
    }
  };

  const timestamp = "2025-04-28T02:28:48.798Z";
  const date = new Date(timestamp);

  const dateOnly = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleNameCancel = () => {
    setIsEditingName(false);
    setTempName(converName);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={handleEditProfilePic}
          disabled={isLoading}
        >
          {converPic ? (
            <Image source={{ uri: converPic }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.profilePlaceholder]}>
              <Text style={styles.profilePlaceholderText}>
                {converName?.charAt(0) || "U"}
              </Text>
            </View>
          )}
          <View style={styles.editImageOverlay}>
            <Feather name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        {isEditingName ? (
          <View style={styles.editNameContainer}>
            <TextInput
              style={styles.nameInput}
              value={tempName}
              onChangeText={setTempName}
              autoFocus
              selectTextOnFocus
              maxLength={50}
            />
            <View style={styles.editNameButtons}>
              <TouchableOpacity
                style={styles.editNameButton}
                onPress={handleNameCancel}
                disabled={isLoading}
              >
                <Ionicons name="close" size={24} color="#ff3b30" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editNameButton}
                onPress={handleNameSave}
                disabled={isLoading}
              >
                <Ionicons name="checkmark" size={24} color="#1E90FF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{converName}</Text>
            <TouchableOpacity onPress={handleEditNameStart}>
              <Feather
                name="edit-2"
                size={18}
                color="#666"
                style={styles.editNameIcon}
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call-outline" size={24} color="#1E90FF" />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="videocam-outline" size={24} color="#1E90FF" />
            <Text style={styles.actionText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="search-outline" size={24} color="#1E90FF" />
            <Text style={styles.actionText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Media</Text>
        <View style={styles.mediaGrid}>
          <TouchableOpacity style={styles.mediaItem}>
            <Ionicons name="image-outline" size={28} color="#1E90FF" />
            <Text style={styles.mediaCount}>{mediaCount.photos}</Text>
            <Text style={styles.mediaLabel}>Photos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mediaItem}>
            <Ionicons name="videocam-outline" size={28} color="#1E90FF" />
            <Text style={styles.mediaCount}>{mediaCount.videos}</Text>
            <Text style={styles.mediaLabel}>Videos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mediaItem}>
            <Ionicons name="document-outline" size={28} color="#1E90FF" />
            <Text style={styles.mediaCount}>{mediaCount.files}</Text>
            <Text style={styles.mediaLabel}>Files</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shared Content</Text>
        <View style={styles.sharedContent}>
          <Text style={styles.emptyStateText}>No shared content yet</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Support</Text>

        <View style={styles.settingsItem}>
          <View style={styles.settingIconContainer}>
            <Ionicons name="notifications-outline" size={24} color="#666" />
          </View>
          <Text style={styles.settingsItemText}>Mute Notifications</Text>
          <Switch
            value={isMuted}
            onValueChange={handleMuteToggle}
            trackColor={{ false: "#e5e5e5", true: "#1E90FF" }}
            thumbColor={isMuted ? "#fff" : "#fff"}
            style={styles.settingsSwitch}
          />
        </View>

        <TouchableOpacity style={styles.settingsItem} onPress={handleBlockUser}>
          <View style={styles.settingIconContainer}>
            <Ionicons
              name={isBlocked ? "lock-closed-outline" : "lock-open-outline"}
              size={24}
              color={isBlocked ? "#ff3b30" : "#666"}
            />
          </View>
          <Text
            style={[styles.settingsItemText, isBlocked && styles.blockedText]}
          >
            {isBlocked ? "Unblock User" : "Block User"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsItem}>
          <View style={styles.settingIconContainer}>
            <MaterialIcons name="report-problem" size={24} color="#666" />
          </View>
          <Text style={styles.settingsItemText}>Report Conversation</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.dangerButton}
        onPress={handleDeleteConversation}
      >
        <Text style={styles.dangerButtonText}>Delete Conversation</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Conversation started on {dateOnly}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePlaceholder: {
    backgroundColor: "#1E90FF",
    justifyContent: "center",
    alignItems: "center",
  },
  profilePlaceholderText: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold",
  },
  editImageOverlay: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#1E90FF",
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  editNameIcon: {
    marginLeft: 8,
  },
  editNameContainer: {
    width: "80%",
    marginBottom: 16,
  },
  nameInput: {
    fontSize: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#1E90FF",
    paddingVertical: 8,
    textAlign: "center",
  },
  editNameButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  editNameButton: {
    padding: 8,
    marginHorizontal: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
  },
  actionButton: {
    alignItems: "center",
    padding: 8,
  },
  actionText: {
    marginTop: 4,
    color: "#1E90FF",
    fontSize: 12,
  },
  section: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  mediaGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  mediaItem: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    width: "28%",
  },
  mediaCount: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    color: "#333",
  },
  mediaLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  sharedContent: {
    padding: 24,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#999",
    fontSize: 16,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingIconContainer: {
    width: 40,
    alignItems: "center",
  },
  settingsItemText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
    color: "#333",
  },
  settingsSwitch: {
    marginLeft: 8,
  },
  blockedText: {
    color: "#ff3b30",
  },
  dangerButton: {
    margin: 24,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ff3b30",
  },
  dangerButtonText: {
    color: "#ff3b30",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    padding: 24,
    alignItems: "center",
  },
  footerText: {
    color: "#999",
    fontSize: 14,
  },
});
