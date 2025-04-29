import * as FileSystem from "expo-file-system";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";
import * as mime from "mime";
import mediaService from "./mediaService"; // Import your existing mediaService

// Initialize Supabase client
// Note: In production, use environment variables or a secure config
const SUPABASE_URL = "https://dhqgxvhppcexbmemrsmh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRocWd4dmhwcGNleGJtZW1yc21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDgxNzYyMiwiZXhwIjoyMDYwMzkzNjIyfQ.keEdGF2j2f0hWnKtGKKHdifbnK_0RdNpfNwlrftp0tc";
const STORAGE_BUCKET = "talkie-files";

class UploadService {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        storage: AsyncStorage,
      },
    });
    this.isAndroid = Platform.OS === "android";
  }

  /**
   * Upload a file to Supabase storage
   * @param {string} uri - Local URI of the file
   * @param {string} path - Path in the bucket to store the file
   * @param {string} contentType - Content type of the file
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(uri, path, contentType = null) {
    try {
      // Verify the file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      // Determine content type if not provided
      const fileType =
        contentType || mime.getType(uri) || "application/octet-stream";

      let result;

      // Instead of using Buffer, use blob or direct file upload approaches
      if (fileInfo.size < 1024 * 1024) {
        // For smaller files, read the file and upload directly
        // Use FileSystem's uploadAsync directly with the file URI
        const { data, error } = await this.supabase.storage
          .from(STORAGE_BUCKET)
          .upload(
            path,
            {
              uri: uri,
              type: fileType,
              name: path.split("/").pop(),
            },
            {
              contentType: fileType,
              upsert: true,
            }
          );

        if (error) throw error;
        result = { data, error: null };
      } else {
        // For larger files, use chunks via Expo FileSystem's uploadAsync
        // Create a presigned URL for upload
        const { data: uploadData, error: urlError } =
          await this.supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUploadUrl(path);

        if (urlError) throw urlError;

        // Use Expo's uploadAsync with the signed URL
        const uploadResult = await FileSystem.uploadAsync(
          uploadData.signedURL,
          uri,
          {
            httpMethod: "PUT",
            headers: {
              "Content-Type": fileType,
            },
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          }
        );

        if (uploadResult.status >= 200 && uploadResult.status < 300) {
          result = { data: { path }, error: null };
        } else {
          throw new Error(`Upload failed with status ${uploadResult.status}`);
        }
      }

      if (result.error) {
        throw result.error;
      }

      // Generate and return public URL
      const {
        data: { publicUrl },
      } = this.supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

      return {
        success: true,
        path: result.data.path,
        publicUrl,
      };
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Upload Failed",
        "Could not upload the file. Please try again."
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Take a photo with camera and upload it
   * @param {string} userId - User ID for path construction
   * @returns {Promise<Object>} Upload result
   */
  async captureAndUploadImage(userId) {
    try {
      const image = await mediaService.handleCamera();
      if (!image) return { success: false, error: "No image captured" };

      const path = `${userId}/images/${image.name}`;
      return await this.uploadFile(image.uri, path, image.type);
    } catch (error) {
      console.error("Capture and upload error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Pick an image from library and upload it
   * @param {string} userId - User ID for path construction
   * @returns {Promise<Object>} Upload result
   */
  async pickAndUploadImage(userId) {
    try {
      const image = await mediaService.handleImagePicker();
      if (!image) return { success: false, error: "No image selected" };

      const path = `${userId}/images/${image.name}`;
      return await this.uploadFile(image.uri, path, image.type);
    } catch (error) {
      console.error("Pick and upload error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Record audio and upload it (Android only)
   * @param {string} userId - User ID for path construction
   * @returns {Promise<Object>} Object with recording controls and upload function
   */
  async recordAndUploadAudio(userId) {
    if (!this.isAndroid) {
      Alert.alert(
        "Not Available",
        "Audio recording is only available on Android devices"
      );
      return { success: false, error: "Not available on this platform" };
    }

    try {
      const recorder = await mediaService.handleMic();
      if (!recorder)
        return { success: false, error: "Could not initialize recorder" };

      // Return enhanced recorder with upload capability
      return {
        ...recorder,
        uploadRecording: async () => {
          const recording = await recorder.stopRecording();
          if (!recording)
            return { success: false, error: "No recording to upload" };

          const path = `${userId}/audio/${recording.name}`;
          return await this.uploadFile(recording.uri, path, recording.type);
        },
      };
    } catch (error) {
      console.error("Record and upload error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get a presigned download URL for a file (with expiration)
   * @param {string} path - Path to the file in the bucket
   * @param {number} expiresIn - Seconds until the URL expires (default 60)
   * @returns {Promise<string|null>} Presigned URL or null on error
   */
  async getFileDownloadUrl(path, expiresIn = 60) {
    try {
      const { data, error } = await this.supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error("Error generating download URL:", error);
      return null;
    }
  }

  /**
   * Delete a file from storage
   * @param {string} path - Path to the file in the bucket
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(path) {
    try {
      const { error } = await this.supabase.storage
        .from(STORAGE_BUCKET)
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      Alert.alert(
        "Delete Failed",
        "Could not delete the file. Please try again."
      );
      return false;
    }
  }

  /**
   * List files in a directory
   * @param {string} path - Directory path in the bucket
   * @returns {Promise<Array|null>} List of files or null on error
   */
  async listFiles(path) {
    try {
      const { data, error } = await this.supabase.storage
        .from(STORAGE_BUCKET)
        .list(path);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error listing files:", error);
      return null;
    }
  }
}

export default new UploadService();
