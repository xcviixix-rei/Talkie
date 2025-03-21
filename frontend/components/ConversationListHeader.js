import { View, Text } from "react-native";
import React from "react";

export default function ConversationListHeader() {
  return (
    <View
      style={{
        paddingVertical: 10,
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
