import React, { useEffect } from "react";
import { Stack, Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import inCallManager from "react-native-incall-manager";
import { ActivityIndicator, View, Text, Platform, PermissionsAndroid } from "react-native";
import { useAuth } from "../../context/authContext";
import { notificationListener } from "../../services/pushNotificationService";
import { setCurrentCall, clearCurrentCall, getStreamClient } from "../../services/streamService";
import { StreamVideo } from "@stream-io/video-react-native-sdk";

const requestAndroidPermissions = async () => {
   if (Platform.OS !== 'android') return;
    try {
        const grants = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
    } catch (err) { 
      console.warn(err); 
    }
};

export default function AppLayout() {
  const { streamClient, isAuthenticated, user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

useEffect(() => {
    if (isAuthenticated && Platform.OS === 'android') {
      requestAndroidPermissions();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (streamClient && user.id && isAuthenticated) {
      const handleIncomingCall = (event) => {
        console.log("--- handleIncomingCall ---");
        console.log("Received event object:", JSON.stringify(event, null, 2));

        const { call } = event;
        
        console.log("Received call object from event:", JSON.stringify(call, null, 2));
        console.log("Call ID from event:", call.id);
        console.log("Call state from event:", call.state);
        if (!call.state) {
          console.error(`handleIncomingCall: call.state is undefined for call ID ${call.id}. Full call object:`, call);
          return;
        }

        const isMember = call.state.members.find(m => m.user_id === user.id);
        const isRinging = call.state.callingState === "RINGING";

        console.log(`handleIncomingCall: Processing call ${call.id}. IsMember: ${!!isMember}, IsRinging: ${isRinging}, UserID: ${user.id}`);
        console.log("handleIncomingCall: Members in call.state:", call.state.members);

        if (isMember && isRinging) {
          setCurrentCall(call);
          inCallManager.startRingtone('_BUNDLE_', 'ringtone');
          router.push({
            pathname: "/incomingCall",
            params: { 
              callId: call.id, 
              callerId: call.state.createdBy?.id 
            },
          });
        } else {
          console.log(`(app)/_layout: Ignoring incoming call event for ${call.id}. IsMember: ${!!isMember}, IsRinging: ${isRinging}`);
        }
      };

      const unsubscribe  = streamClient.on('call.ring', handleIncomingCall);
      return () => {
        unsubscribe();
        inCallManager.stopRingtone();
      };
    } else {
      console.log("(app)/_layout: Stream client not ready or user not authenticated.");
    }
  }, [streamClient, user.id, isAuthenticated, router]);
  if (!isAuthenticated) {
    console.log("(app)/_layout: Not authenticated after auth check. Should redirect via root.");
    // router.replace("/signIn");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Not Authenticated. Redirecting...</Text>
      </View>
    );
  }
  if (!streamClient) {
      console.log("(app)/_layout: Authenticated, but Stream client is not ready. Waiting...");
      return (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color="#1E90FF" />
              <Text>Connecting to call service...</Text>
          </View>
      );
  }

  return (
    <StreamVideo client={streamClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="search"
          options={{
            title: "Search",
            headerBackTitle: "Home",
          }}
        />
        <Tabs.Screen
          name="createGroup"
          options={{
            title: "Create Group",
          }}
        />
        <Stack.Screen name="conversation" />
        <Stack.Screen
          name="profile"
          options={{
            title: "Profile",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="waiting"
          options={{
            title:"Calling",
            headerShown: false,
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen 
          name="incomingCall"
          options={{
            title: "Incoming Call",
            headerShown: false,
            presentation: "fullScreenModal",
          }} 
        />
        <Stack.Screen
          name="call"
          options={{
            title: "Call",
            headerShown: false,
            presentation: "fullScreenModal",
          }} 
        />
          <Stack.Screen
              name="settings"
              options={{
                  headerShown: false,
                  presentation: "fullScreenModal",
              }}
          />
          <Stack.Screen
              name="notifications-settings"
              options={{
                  headerShown: false,
                  presentation: "fullScreenModal",
              }}
          />
        {/* <Stack.Screen
          name="conversationInfor"
          options={({ navigation }) => ({
            title: "Conversation Info",
            headerBackTitle: "Back",
            // This allows us to customize the back button behavior
            headerLeft: () => (
              <TouchableOpacity
                onPress={() =>
                  navigation.getParent()?.emit({
                    type: "customBackAction",
                    target: navigation.getId(),
                  })
                }
              >
                <Ionicons name="chevron-back" size={24} color="#007AFF" />
              </TouchableOpacity>
            ),
          })}
        /> */}
      </Stack>
    </StreamVideo>
  );
}
