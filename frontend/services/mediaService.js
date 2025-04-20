import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { Alert, Platform } from "react-native";

// Configuration for image picking and camera
const imagePickerOptions = {
  allowsEditing: false,
  allowsMultipleSelection: true,
  aspect: [4, 3],
  quality: 0.8,
};

// Create platform-specific recording options
const createRecordingOptions = () => {
  // For Android-only use case
  const androidOptions = {
    extension: ".m4a",
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  };

  // To satisfy the API requirement, we'll include a minimal iOS config
  // even though it won't be used on Android devices
  return {
    android: androidOptions,
    ios: {
      extension: ".m4a",
      outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
      audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
  };
};

class MediaService {
  constructor() {
    this.recording = null;
    this.sound = null;
    this.recordingUri = null;
    this.isAndroid = Platform.OS === "android";
    // Skip this class entirely on iOS if it's Android-only
    if (!this.isAndroid) {
      console.warn("MediaService is configured for Android only");
    }
  }

  /**
   * Request media library permission specifically
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async requestMediaLibraryPermission() {
    try {
      const libraryPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!libraryPermission.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant media library permission to select images.",
          [{ text: "OK" }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting media library permission:", error);
      return false;
    }
  }

  /**
   * Request camera permission specifically
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async requestCameraPermission() {
    try {
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant camera permission to take photos.",
          [{ text: "OK" }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      return false;
    }
  }

  /**
   * Request microphone permission specifically
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async requestAudioPermission() {
    if (!this.isAndroid) {
      console.warn("Audio recording is configured for Android only");
      return false;
    }

    try {
      const audioPermission = await Audio.requestPermissionsAsync();

      if (!audioPermission.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant microphone permission to record audio.",
          [{ text: "OK" }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting audio permission:", error);
      return false;
    }
  }

  /**
   * Handle picking images from the device gallery
   * @returns {Promise<Object|null>} Selected image or null if canceled/error
   */
  async handleImagePicker() {
    try {
      // Request permission only when needed
      const permissionGranted = await this.requestMediaLibraryPermission();
      if (!permissionGranted) {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        ...imagePickerOptions,
        allowsMultipleSelection: true, // Enable multiple selection
        base64: false,
      });

      if (result.canceled) {
        return null;
      }

      // Process all selected assets instead of just the first one
      const processedImages = await Promise.all(
        result.assets.map(async (asset) => {
          const fileName = asset.uri.split("/").pop();
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);

          return {
            uri: asset.uri,
            name: fileName,
            type: `image/${fileName.split(".").pop()}`,
            size: fileInfo.size,
            width: asset.width,
            height: asset.height,
          };
        })
      );

      return processedImages; // This will return an array of image objects
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to select images. Please try again.");
      return null;
    }
  }

  /**
   * Handle capturing images with the device camera
   * @returns {Promise<Object|null>} Captured image or null if canceled/error
   */
  async handleCamera() {
    try {
      // Request permission only when needed
      const permissionGranted = await this.requestCameraPermission();
      if (!permissionGranted) {
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        ...imagePickerOptions,
        base64: false,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      const fileName = `camera_${Date.now()}.${asset.uri.split(".").pop()}`;
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);

      return {
        uri: asset.uri,
        name: fileName,
        type: `image/${fileName.split(".").pop()}`,
        size: fileInfo.size,
        width: asset.width,
        height: asset.height,
      };
    } catch (error) {
      console.error("Error using camera:", error);
      Alert.alert("Error", "Failed to capture image. Please try again.");
      return null;
    }
  }

  /**
   * Start recording audio
   * @returns {Promise<boolean>} Success status
   */
  async startRecording() {
    if (!this.isAndroid) {
      console.warn("Audio recording is configured for Android only");
      return false;
    }
    try {
      const permissionGranted = await this.requestAudioPermission();
      if (!permissionGranted) {
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, // Since we're Android-only
        playsInSilentModeIOS: false, // Since we're Android-only
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      if (this.recording) {
        //
        // console.log(this.recording);
        await this.stopRecording();
      }
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(createRecordingOptions());
      await recording.startAsync();
      this.recording = recording;

      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
      return false;
    }
  }

  /**
   * Stop recording audio
   * @returns {Promise<Object|null>} Recording information or null if error
   */
  async stopRecording() {
    if (!this.isAndroid) {
      return null;
    }

    try {
      if (!this.recording) {
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recordingUri = uri;

      const fileInfo = await FileSystem.getInfoAsync(uri);
      const fileName = `audio_${Date.now()}.m4a`;

      const result = {
        uri: uri,
        name: fileName,
        type: "audio/m4a",
        size: fileInfo.size,
        duration: this.recording._finalDurationMillis,
      };

      this.recording = null;
      return result;
    } catch (error) {
      console.error("Error stopping recording:", error);
      Alert.alert("Error", "Failed to stop recording. Please try again.");
      return null;
    }
  }

  /**
   * Play recorded audio
   * @param {string} uri - URI of the audio to play
   * @returns {Promise<boolean>} Success status
   */
  async playRecording(uri = null) {
    try {
      const audioUri = uri || this.recordingUri;
      if (!audioUri) {
        return false;
      }

      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      this.sound = sound;

      // Listen for completion
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          this.sound.unloadAsync();
        }
      });

      return true;
    } catch (error) {
      console.error("Error playing recording:", error);
      Alert.alert("Error", "Failed to play recording. Please try again.");
      return false;
    }
  }

  /**
   * Main handler for microphone/audio recording
   * @returns {Promise<Object>} Object with methods to control recording
   */
  async handleMic() {
    if (!this.isAndroid) {
      Alert.alert(
        "Not Available",
        "Audio recording is only available on Android devices"
      );
      return null;
    }

    // Request permission only when needed
    const permissionGranted = await this.requestAudioPermission();
    if (!permissionGranted) {
      return null;
    }

    // Return controls to manage the recording from the UI
    return {
      startRecording: this.startRecording.bind(this),
      stopRecording: this.stopRecording.bind(this),
      playRecording: this.playRecording.bind(this),
    };
  }

  /**
   * Handle location sharing - Just a placeholder, implement as needed
   */
  async handleLocation() {
    // Placeholder for location handling
    Alert.alert(
      "Location Sharing",
      "Location sharing functionality would be implemented here.",
      [{ text: "OK" }]
    );
    return null;
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch (error) {
        console.error("Error cleaning up recording:", error);
      }
      this.recording = null;
    }

    if (this.sound) {
      try {
        await this.sound.unloadAsync();
      } catch (error) {
        console.error("Error cleaning up sound:", error);
      }
      this.sound = null;
    }
  }
}

export default new MediaService();
