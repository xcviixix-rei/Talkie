import { router, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { SafeAreaView, Button, StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';
import {
        StreamVideo,
        StreamVideoClient,
        Call,
        StreamCall,
        useStreamVideoClient,
        useCallStateHooks,
        CallingState,
        CallContent,
        } from '@stream-io/video-react-native-sdk';
        
const apiKey = 'mmhfdzb5evj2';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL0dlbmVyYWxfR3JpZXZvdXMiLCJ1c2VyX2lkIjoiR2VuZXJhbF9Hcmlldm91cyIsInZhbGlkaXR5X2luX3NlY29uZHMiOjYwNDgwMCwiaWF0IjoxNzQ3MDU5Mjc2LCJleHAiOjE3NDc2NjQwNzZ9.7W8HHOFLUlexCEXbPRzl93I8rzMPYc4kFByBAbVbo4Q';
const userId = 'General_Grievous';
let streamClient = null;

export default function callScreen() {
  const {
    callId,
    converName,
    converPic,
  } = useLocalSearchParams();
  const user = {
    id: userId,
    name: "manh2" || 'User',
    image: converPic,
  };
  const [call, setCall] = useState(null);
  const [client, setClient] = useState(null);
  const useClient = useStreamVideoClient();

  useEffect(() => {
    const _client = new StreamVideoClient({ apiKey, user, token });
    setClient(_client);
    return () => {
      _client.disconnectUser().catch(err => console.error("Failed to disconnect user:", err));
      setClient(null); // Reset client state
    };
  }, [apiKey, userId, token]);

  if (!client) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0084ff" />
        <Text style={styles.text}>Initializing...</Text>
      </SafeAreaView>
    );
  }

  return (
    <StreamVideo client={client}>
      <CallContentWrapper
          callId={callId}
          converName={converName}
          converPic={converPic}
      />
    </StreamVideo>
  );

  
};

function CallContentWrapper({ callId, converName, converPic }) {
  const [call, setCall] = useState(null);
  const client = useStreamVideoClient();
  const router = useRouter();

  useEffect(() => {
    // Guard clause: Ensure client and callId are available
    if (!client || !callId) {
        console.log("Client or Call ID not ready yet.");
        return;
    }

    console.log(`Attempting to join/create call with ID: ${callId}`);
    const _call = client.call("default", callId);

    _call.join({ create: true })
      .then(() => {
        console.log("Call joined/created successfully!");
        setCall(_call);
      })
      .catch(err => {
        console.error("Failed to join/create call:", err);
        // Handle error (e.g., show message, navigate back)
        // Maybe add a small delay before navigating back
        setTimeout(() => router.back(), 2000);
      });

    // Cleanup function
    return () => {
      console.log("Cleaning up call. Current state:", _call?.state.callingState);
      if (_call && _call.state.callingState !== CallingState.LEFT) {
        _call.leave().catch(err => console.error("Error leaving call on cleanup:", err));
      }
      setCall(null); // Reset call state on cleanup
    };
  }, [client, callId]);

  if (!call) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <Image source={{ uri: converPic }} style={styles.profileImage} />
          <Text style={styles.text}>Calling {converName}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <StreamVideo client={client}>
      <SafeAreaView style={styles.container}>
        <StreamCall call={call}>
          <View style={styles.container}>
            <CallContent
              onHangupCallHandler={() => router.back()}
            />
          </View>
        </StreamCall>
      </SafeAreaView>
    </StreamVideo>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  text: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileImage: {
    height: hp(9),
    width: hp(9),
    borderRadius: hp(4.5),
    justifyContent: 'center',
  },
});

