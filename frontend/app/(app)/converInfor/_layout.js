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
          title: "Conversation",
          headerShown: false,
        }}
      />
      <Stack.Screen name="searchMessages" />
    </Stack>
  );
}
