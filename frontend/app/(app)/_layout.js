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

        const { call: eventCall, members: eventMembers, user: eventCreator } = event;

        if (!eventCall) {
          console.error("CALLEE: eventCall is undefined in the event.");
          return;
        }

        const callerDetails = eventCreator;
        let isForMe = false;

        if (eventMembers && Array.isArray(eventMembers)) {
          isForMe = eventMembers.some(member => member.user_id === user.id || member.user?.id === user.id);
        } else {
          console.error("CALLEE: eventMembers is not an array or is undefined.");
        }

        // const isRinging = call.state.callingState === "RINGING";
        const isRinging = true;
        
        if (isForMe && isRinging) {
          setCurrentCall(eventCall);
          const callerIdFromCallCreatedBy = eventCall.createdBy?.id;
          const callerIdFromEventCreator = callerDetails?.id;

          console.log("CALLEE: Caller ID from event.call.created_by:", callerIdFromCallCreatedBy);
          console.log("CALLEE: Caller ID from event.user:", callerIdFromEventCreator);
          router.push({
            pathname: "/incomingCall",
            params: { 
              callId: eventCall.id, 
              callerId: callerIdFromEventCreator || callerIdFromCallCreatedBy,
            },
          });
        } else {
          console.log(`CALLEE: Ignoring incoming call event for ${eventCall.id}. IsForMe: ${isForMe}, IsRinging: ${isRinging}`);
        }

    //     if (isMember && isRinging) {
    //       setCurrentCall(call);
    //       inCallManager.startRingtone('_BUNDLE_', 'ringtone');
    //       router.push({
    //         pathname: "/incomingCall",
    //         params: { 
    //           callId: call.id, 
    //           callerId: call.state.createdBy?.id 
    //         },
    //       });
    //     } else {
    //       console.log(`(app)/_layout: Ignoring incoming call event for ${call.id}. IsMember: ${!!isMember}, IsRinging: ${isRinging}`);
    //     }
      };

      const unsubscribe  = streamClient.on('call.ring', handleIncomingCall);
      return () => {
        unsubscribe();
        inCallManager.stopRingtone();
      };
    } else {
      console.log("(app)/_layout: Stream client not ready or user not authenticated.");
    }
  }, [streamClient, user?.id, isAuthenticated, router]);
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
