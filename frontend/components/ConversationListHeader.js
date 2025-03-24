import { View, Text } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ConversationListHeader() {
  const { top } = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: top,
        paddingVertical: 100,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "#1E90FF",
        paddingBottom: 5,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: "#1E90FF",
          letterSpacing: 1,
        }}
      >
        Talkie
      </Text>
    </View>
  );
}
