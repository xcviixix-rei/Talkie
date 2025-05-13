import { router, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'; // Import icons
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView, StyleSheet, Text, View, Image, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
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

  const defaultAvatar = require('../../assets/images/image.png');

  if (!call) {
    return (
      <SafeAreaView style={styles.safeArea}>
      {/* Make status bar content light on the dark background */}
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Top Section: Profile Info */}
        <View style={styles.profileSection}>
          <Image
            source={converPic ? { uri: converPic } : defaultAvatar}
            style={styles.profileImage}
            resizeMode="cover" // Ensure image covers the area
          />
          <Text style={styles.calleeName}>{converName || 'Unknown Contact'}</Text>
          <Text style={styles.callStatus}>Calling...</Text>
        </View>

        {/* Bottom Section: Controls */}
        <View style={styles.controlsSection}>
          <View style={styles.controlsRow}>
          </View>

          {/* End Call Button */}
          <TouchableOpacity
            style={[styles.controlButton, styles.endCallButton]}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="phone-hangup" size={hp(5)} color="white" />
             {/* Optional: Text label for end call */}
             {/* <Text style={styles.controlLabel}>End</Text> */}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    );
  }

  return (
    <StreamVideo client={client}>
      <SafeAreaView style={styles.bigContainer}>
        <StreamCall call={call}>
          <View style={styles.bigContainer}>
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
  bigContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#2c3e50', // Dark background common in call screens
  },
  container: {
    flex: 1,
    justifyContent: 'space-between', // Pushes controls to bottom
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(8), // Adjust padding as needed
  },
  profileSection: {
    alignItems: 'center',
    marginTop: hp(5), // Space from top
  },
  profileImage: {
    width: hp(15), // Larger image
    height: hp(15),
    borderRadius: hp(7.5), // Make it circular
    marginBottom: hp(3),
    backgroundColor: '#bdc3c7', // Placeholder background color
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)', // Optional border
  },
  calleeName: {
    fontSize: hp(3.5),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: hp(1),
    textAlign: 'center',
  },
  callStatus: {
    fontSize: hp(2.2),
    color: '#bdc3c7', // Lighter color for status
    textAlign: 'center',
  },
  controlsSection: {
    width: '100%',
    alignItems: 'center', // Center the end call button horizontally
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Space out mute/speaker
    width: '80%', // Don't take full width for the row
    marginBottom: hp(8), // Space above the end call button
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent background
    width: hp(9), // Circular buttons
    height: hp(9),
    borderRadius: hp(4.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
   controlLabel: {
    color: 'white',
    fontSize: hp(1.5),
    marginTop: hp(0.5), // Space between icon and label
  },
  endCallButton: {
    backgroundColor: '#e74c3c', // Red color for ending call
     width: hp(10), // Slightly larger maybe
    height: hp(10),
    borderRadius: hp(5),
  },
});

