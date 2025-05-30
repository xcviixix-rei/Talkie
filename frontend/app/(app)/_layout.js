import React, { useEffect } from "react";
import { Stack, Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import inCallManager from "react-native-incall-manager";
import {
  ActivityIndicator,
  View,
  Text,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { useAuth } from "../../context/authContext";
import { notificationListener } from "../../services/pushNotificationService";
import {
  setCurrentCall,
  clearCurrentCall,
  getStreamClient,
} from "../../services/streamService";
import { StreamVideo } from "@stream-io/video-react-native-sdk";

const requestAndroidPermissions = async () => {
  if (Platform.OS !== "android") return;
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
  const {
    streamClient,
    isAuthenticated,
    user,
    isLoading: authIsLoading,
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && Platform.OS === "android") {
      requestAndroidPermissions();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (streamClient && user.id && isAuthenticated) {
      const handleIncomingCall = (event) => {
        const {
          call: eventCall,
          members: eventMembers,
          user: eventCreator,
        } = event;

        if (!eventCall) {
          console.error("CALLEE: eventCall is undefined in the event.");
          return;
        }

        if (!eventCall.id) {
          console.error("CALLEE: eventCall.id is undefined in the event.");
          return;
        }
        if (eventCall.createdBy?.id === user.id) {
          return;
        }

        let isForMe = false;

        if (eventMembers && Array.isArray(eventMembers)) {
          isForMe = eventMembers.some(
            (member) =>
              member.user_id === user.id || member.user?.id === user.id
          );
        } else {
          isForMe = true;
        }

        if (isForMe) {
          setCurrentCall(eventCall);
          const callerIdFromCallCreatedBy = eventCall.createdBy?.id;
          const callerIdFromEventCreator = eventCreator?.id;
          router.push({
            pathname: "/incomingCall",
            params: {
              callId: eventCall.id,
              callerId: callerIdFromEventCreator || callerIdFromCallCreatedBy,
            },
          });
        }
      };

      const unsubscribe = streamClient.on("call.ring", handleIncomingCall);
      return () => {
        unsubscribe();
        inCallManager.stopRingtone();
      };
    }
  }, [streamClient, user?.id, isAuthenticated, router]);
  if (!isAuthenticated) {
    // router.replace("/signIn");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Not Authenticated. Redirecting...</Text>
      </View>
    );
  }
  if (!streamClient) {
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
          name="converInfor"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="waiting"
          options={{
            title: "Calling",
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
        <Stack.Screen
            name="collection"
            options={{
              headerShown: false,
              presentation: "fullScreenModal",
            }}
        />
        <Stack.Screen
            name="collectionInfo"
            options={{
              headerShown: false,
              presentation: "fullScreenModal",
            }}
        />
        <Stack.Screen
            name="createCollection"
            options={{
              headerShown: false,
              presentation: "fullScreenModal",
            }}
        />


      </Stack>
    </StreamVideo>
  );
}
