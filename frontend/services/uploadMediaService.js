import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system"; // for file access
import mime from "mime"; // helps detect MIME types

import {
    SUBABASE_URL, SUBABASE_KEY
} from "@env";

// Supabase client
const supabase = createClient(
  SUBABASE_URL,
  SUBABASE_KEY,
  {
    auth: {
      storage: AsyncStorage,
    },
  }
);

// Upload file (image or audio)
const uploadFile = async (uri, pathInBucket) => {
  const fileContent = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const contentType = mime.getType(uri) || "application/octet-stream";
  const fileBuffer = Buffer.from(fileContent, "base64");

  const { data, error } = await supabase.storage
    .from("talkie-files")
    .upload(pathInBucket, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error("Upload failed:", error);
  } else {
    console.log("Uploaded:", data);
  }
};

// Example usage
// Image/audio URI (from image picker or file picker)
const fileUri = "C:Talkie/frontend/assets/images/conech.jpg"; // or "file:///path/to/audio.mp3"
uploadFile(fileUri, "abc1234/photo.jpg");
