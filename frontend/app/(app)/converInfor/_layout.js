import { StyleSheet } from "react-native";
import { Stack, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="conversationInfor"
        options={{
          title: "Conversation Information",
          //headerShown: false,
        }}
      />
      <Stack.Screen
        name="themeSelection"
        options={{
          title: "Theme",
          //headerShown: false,
        }}
      />
      <Stack.Screen
        name="summaryMessages"
        options={{
          title: "Summarize",
          //headerShown: false,
        }}
      />
      <Stack.Screen
        name="searchMessages"
        options={{
          title: "Search Messages",
          //headerShown: false,
        }}
      />
    </Stack>
  );
}
