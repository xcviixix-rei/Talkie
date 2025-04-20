import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  StreamCall,
  useStreamVideoClient,
  CallContent
} from "@stream-io/video-react-native-sdk";
import { useNavigation } from '@react-navigation/native';

export const CallScreen = ({ callId, type, calleeUsername }) => {
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);
  const client = useStreamVideoClient();
  const navigation = useNavigation();

  useEffect(() => {
    if (client) {
      const call = client.call("default", callId);
      call.join({ create: true })
        .then(() => setCall(call))
        .catch((err) => {
          console.error("Failed to join call:", err);
          setError("Failed to join call. Please try again.");
        });
    }
  }, [client, callId]);

  const handleHangup = () => {
    navigation.goBack();
  };

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!call) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Joining call...</Text>
      </View>
    );
  }

  const callTypeText = type === "video" ? "Video" : "Voice";
  const headerText = `${callTypeText} Call with ${calleeUsername}`;

  return (
    <StreamCall call={call}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{headerText}</Text>
        </View>
        <CallContent onHangupCallHandler={handleHangup} />
      </View>
    </StreamCall>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#005fff",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});