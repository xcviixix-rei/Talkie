import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import React, { useEffect, useCallback, useRef, useState } from "react";
import { useLocalSearchParams, useFocusEffect, useRouter } from "expo-router";
import ConversationHeader from "../../components/ConversationHeader";
import MessageList from "../../components/MessageList";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import MediaService from "../../services/mediaService";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/authContext";
import { fetchUserData } from "../../api/user";
import { fetchConversation } from "../../api/conversation";
import { sendMessage } from "../../api/message";
import { changeLastMessages } from "../../api/conversation";
import uploadMediaService from "../../services/uploadMediaService";
import locationService from "../../services/locationService";
import { fetchTheme } from "../../api/theme";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

export default function Conversation() {
  const { rawItem, rawMockUsers, converName, converPic } =
    useLocalSearchParams();
  const [item, setItem] = useState(JSON.parse(rawItem));
  const mockUsers = JSON.parse(rawMockUsers);
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [showMediaButtons, setShowMediaButtons] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingInfo, setRecordingInfo] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [theme, setTheme] = useState("default");
  const textRef = useRef("");
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const audioControlsRef = useRef(null);
  const [attachments, setAttachments] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const tmp = await fetchConversation(item.id);
        const tmptheme = await fetchTheme();
        setTheme(tmptheme.find((t) => t.theme_name === tmp?.conver_theme));
        setItem(tmp);
      };


      fetchData();

      const messagesRef = collection(db, "messages");
      const messagesQuery = query(
        messagesRef,
        where("conversation_id", "==", item.id),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          // Get all messages from the snapshot
          const allMessages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Filter out messages that should be hidden from the current user
          const filteredMessages = allMessages.filter(
            (message) =>
              !message.hidden_to || !message.hidden_to.includes(user.id)
          );

          // Update state with filtered messages
          setMessages(filteredMessages);

          // Still use all messages for the last message tracking
          if (filteredMessages.length > 0) {
            const lastMessage = filteredMessages[filteredMessages.length - 1];
            changeLastMessages(
              item.id,
              lastMessage.sender,
              lastMessage.text,
              lastMessage.timestamp,
              lastMessage.attachments
            );
          } else changeLastMessages(item.id);
        },
        (error) => {
          console.error("Error listening to messages:", error);
        }
      );

      // Clean up the listener when component unmounts
      return () => {
        unsubscribe();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        MediaService.cleanup();
      };
    }, [])
  );

  const handleSendMessage = async () => {
    let message = textRef.current.trim();
    if (!message && !attachments) return; // Don't send empty messages with no attachments

    if (inputRef) {
      inputRef?.current?.clear();
      textRef.current = "";
    }

    if (inputRef) {
      inputRef?.current?.clear();
      textRef.current = "";
    }
    let attachmentData = null;

    // Upload attachment if exists
    if (attachments) {
      // If it's a single attachment (object), convert it to an array for consistent processing
      const attachmentsArray = Array.isArray(attachments)
        ? attachments
        : [attachments];

      // Upload all attachments in parallel
      const uploadResults = await Promise.all(
        attachmentsArray.map(async (attachment) => {
          const path = `${user.id}/images/${attachment.name}`;
          try {
            const uploadResult = await uploadMediaService.uploadFile(
              attachment.uri,
              path,
              attachment.type
            );

            if (uploadResult.success) {
              return {
                url: uploadResult.publicUrl,
                success: true,
              };
            } else {
              console.error("Failed to upload attachment:", uploadResult.error);
              return {
                error: uploadResult.error,
                success: false,
              };
            }
          } catch (error) {
            console.error("Error uploading attachment:", error);
            return {
              error: error.message,
              success: false,
            };
          }
        })
      );

      // Separate successful and failed uploads
      const successfulUploads = uploadResults.filter(
        (result) => result.success
      );
      const failedUploads = uploadResults.filter((result) => !result.success);

      if (successfulUploads.length > 0) {
        attachmentData = successfulUploads.map((result) => ({
          url: result.url,
        }));
      }

      if (failedUploads.length > 0) {
        console.error("Failed to upload some attachments:", failedUploads);
        // Consider showing an error message to the user for failed uploads
      }
    }

    // Send the message with attachment data
    await sendMessage({
      conversation_id: item.id,
      sender: user.id,
      text: message,
      attachments: attachmentData ? attachmentData : [], // Store as an array for multiple attachments later
      timestamp: new Date().toISOString(),
      seen_by: [user.id],
    });

    // Clear the attachment after sending
    setAttachments(null);
  };

  const toggleMediaButtons = () => {
    setShowMediaButtons(!showMediaButtons);
  };

  const handleImagePicker = async () => {
    const image = await MediaService.handleImagePicker();
    setAttachments(image);
  };

  const handleCamera = async () => {
    const photo = await MediaService.handleCamera();
    if (photo) {
      setAttachments(photo);
      console.log(photo);
    }
  };

  const handleLocation = async () => {
    // try {
    //   // Show loading indicator or similar
    //   // Get current location
    //   const location = await locationService.getCurrentLocation();
    //   if (!location) {
    //     Alert.alert("Error", "Unable to get your location");
    //     return;
    //   }
    //   // Format location text for message
    //   const locationText = `📍 Location: ${location.latitude.toFixed(
    //     6
    //   )}, ${location.longitude.toFixed(6)}`;
    //   // Send as a message
    //   await sendMessage({
    //     conversation_id: item.id,
    //     sender: user.id,
    //     text: locationText,
    //     attachments: [],
    //     timestamp: new Date().toISOString(),
    //     seen_by: [user.id],
    //   });
    //   // Optionally: save location to be sent to server
    //   try {
    //     await locationService.sendLocationToServer(
    //       location,
    //       "YOUR_SERVER_ENDPOINT_HERE" // Replace with your actual endpoint
    //     );
    //   } catch (serverError) {
    //     console.error("Error sending location to server:", serverError);
    //     // Don't alert here as the message was already sent
    //   }
    // } catch (error) {
    //   console.error("Error handling location:", error);
    //   Alert.alert("Error", "Failed to share your location");
    // }
  };

  // Start recording when the mic button is pressed
  const handleMicPress = async () => {
    try {
      // Initialize audio controls if needed
      if (!audioControlsRef.current) {
        const controls = await MediaService.handleMic();
        if (!controls) return;
        audioControlsRef.current = controls;
      }

      // Start recording
      const started = await audioControlsRef.current.startRecording();
      if (started) {
        setIsRecording(true);
        setRecordingDuration(0);

        // Start timer to track recording duration
        timerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  // Stop recording when the mic button is released
  const handleMicRelease = async () => {
    if (!isRecording) return;

    try {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop recording
      const recordingResult = await audioControlsRef.current.stopRecording();
      setIsRecording(false);

      if (recordingResult && recordingDuration >= 1) {
        setRecordingInfo(recordingResult);
        // Auto-play the recording
        playRecording(recordingResult.uri);
      } else {
        // Recording was too short, discard it
        setRecordingInfo(null);
        Alert.alert("Info", "Recording was too short");
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      setIsRecording(false);
      Alert.alert("Error", "Failed to stop recording");
    }
  };

  // Play recorded audio
  const playRecording = async (uri) => {
    if (!audioControlsRef.current) return;

    try {
      setIsPlayingAudio(true);
      await audioControlsRef.current.playRecording(uri);

      // Reset playing state after the audio finishes
      // In a production app, you would listen for the audio completion event
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, recordingDuration * 1000 + 500); // Add a small buffer
    } catch (error) {
      console.error("Error playing recording:", error);
      setIsPlayingAudio(false);
    }
  };

  // Send recorded audio message
  const sendAudioMessage = async () => {
    if (!recordingInfo) return;

    // Here you would upload the audio file and send it as a message
    Alert.alert("Success", "Audio message would be sent here");

    // Reset after sending
    setRecordingInfo(null);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <ConversationHeader
        item={item}
        theme={theme}
        mockUsers={mockUsers}
        converName={item?.name ? item.name : converName}
        converPic={item?.name ? item?.conver_pic : converPic}
        router={router}
        currentUser={user}
      />
      <ImageBackground source={{ uri: theme?.url || "1"}} style={styles.main}>
        <View style={styles.messageList}>
          <MessageList messages={messages} currentUser={user} theme={theme} isGroupChat={item.type === 'group'} pars={item.participants} usersInfo={mockUsers} />
        </View>
        <View style={styles.inputContainer}>
          {showMediaButtons && (
            <View style={styles.mediaButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.mediaButton,
                  { backgroundColor: theme?.ui_color },
                ]}
                onPress={handleImagePicker}
              >
                <Ionicons name="image" size={hp(2.7)} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.mediaButton,
                  { backgroundColor: theme?.ui_color },
                ]}
                onPress={handleCamera}
              >
                <Ionicons name="camera" size={hp(2.7)} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.mediaButton,
                  { backgroundColor: theme?.ui_color },
                ]}
                onPress={handleLocation}
              >
                <Ionicons name="location" size={hp(2.7)} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  [styles.mediaButton, { backgroundColor: theme?.ui_color }],
                  isRecording && styles.recordingButton,
                ]}
                onPressIn={handleMicPress}
                onPressOut={handleMicRelease}
              >
                <Ionicons name="mic" size={hp(2.7)} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* Recording UI */}
          {isRecording && (
            <View style={styles.recordingContainer}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>
                  Recording... {formatTime(recordingDuration)}
                </Text>
              </View>
              <Text style={styles.recordingHint}>Release to stop</Text>
            </View>
          )}

          {/* Playback UI */}
          {recordingInfo && !isRecording && (
            <View style={styles.playbackContainer}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => playRecording(recordingInfo.uri)}
                disabled={isPlayingAudio}
              >
                <Ionicons
                  name={isPlayingAudio ? "pause" : "play"}
                  size={hp(2.5)}
                  color="white"
                />
              </TouchableOpacity>
              <View style={styles.audioProgressContainer}>
                <View
                  style={[
                    styles.audioProgress,
                    { width: isPlayingAudio ? "100%" : "0%" },
                  ]}
                />
              </View>
              <TouchableOpacity
                style={styles.sendAudioButton}
                onPress={sendAudioMessage}
              >
                <Ionicons name="send" size={hp(2.2)} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* Input Box */}
          {!recordingInfo && (
            <View style={styles.inputWrapper}>
              <TouchableOpacity
                onPress={toggleMediaButtons}
                style={[styles.plusButton, { backgroundColor: theme.ui_color }]}
              >
                <Ionicons name="add" size={hp(2.2)} color="white" />
              </TouchableOpacity>
              <View style={styles.inputBox}>
                <TextInput
                  ref={inputRef}
                  onChangeText={(value) => (textRef.current = value)}
                  placeholder="Type message ..."
                  style={styles.textInput}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { backgroundColor: theme.ui_color },
                  ]}
                  onPress={handleSendMessage}
                >
                  <Ionicons name="send" size={hp(2.2)} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  statusBar: {
    backgroundColor: "white",
  },
  main: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    overflow: "visible",
  },
  messageList: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: hp(1.0),
    paddingTop: hp(0.5),
  },
  inputWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: wp(3),
  },
  plusButton: {
    backgroundColor: "#0084ff",
    padding: hp(1),
    borderRadius: 50,
    marginRight: wp(2),
  },
  inputBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    height: hp(6.1),
    borderColor: "#d1d5db",
    padding: hp(1),
    borderRadius: 50,
    flex: 1,
  },
  textInput: {
    flex: 1,
    fontSize: hp(2),
    marginRight: wp(2),
  },
  sendButton: {
    backgroundColor: "#0084ff",
    padding: hp(1),
    borderRadius: 50,
  },
  mediaButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginHorizontal: wp(3),
    marginBottom: hp(1),
  },
  mediaButton: {
    backgroundColor: "#0084ff",
    padding: hp(1.2),
    borderRadius: 50,
    marginHorizontal: wp(1),
  },
  recordingButton: {
    backgroundColor: "#FF3B30", // Red color when recording
  },
  recordingContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: wp(3),
    marginBottom: hp(1),
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    marginBottom: hp(0.5),
  },
  recordingDot: {
    width: hp(1.2),
    height: hp(1.2),
    borderRadius: hp(0.6),
    backgroundColor: "#FF3B30",
    marginRight: wp(2),
  },
  recordingText: {
    fontSize: hp(1.8),
    color: "#333",
  },
  recordingHint: {
    fontSize: hp(1.4),
    color: "#666",
  },
  playbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: wp(3),
    marginBottom: hp(1),
    backgroundColor: "white",
    borderRadius: 25,
    padding: hp(1.2),
  },
  playButton: {
    backgroundColor: "#0084ff",
    width: hp(5),
    height: hp(5),
    borderRadius: hp(2.5),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2),
  },
  audioProgressContainer: {
    flex: 1,
    height: hp(1),
    backgroundColor: "#e5e7eb",
    borderRadius: hp(0.5),
    overflow: "hidden",
  },
  audioProgress: {
    height: "100%",
    backgroundColor: "#0084ff",
    borderRadius: hp(0.5),
    width: "0%",
    // This transitions from 0% to 100% during playback
    transition: "width 0.3s linear",
  },
  sendAudioButton: {
    backgroundColor: "#0084ff",
    width: hp(5),
    height: hp(5),
    borderRadius: hp(2.5),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp(2),
  },
});
