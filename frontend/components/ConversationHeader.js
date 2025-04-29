import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Stack } from "expo-router";
import { Entypo, Foundation, Ionicons } from "@expo/vector-icons";
import { fetchConversation } from "../api/conversation";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function ConversationHeader({
  item,
  mockUsers,
  router,
  converName,
  converPic,
  currentUser,
  onVoiceCall,
  onVideoCall,
}) {
  const openConversationInfor = () => {
    router.push({
      pathname: "/conversationInfor",
      params: {
        rawItem: JSON.stringify(item),
        rawMockUsers: JSON.stringify(mockUsers),
        converName,
        converPic,
      },
    });
  };

  return (
    <Stack.Screen
      options={{
        title: converName,
        headerStyle: { height: hp(8) },
        headerShadowVisible: false,
        headerLeft: () => (
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Entypo name="chevron-left" size={hp(4)} color="#737373" />
            </TouchableOpacity>
            <Image source={{ uri: converPic }} style={styles.profileImage} />
          </View>
        ),
        headerRight: () => (
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={onVoiceCall}>
              <Ionicons name="call" size={hp(2.8)} color="#737373" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onVideoCall}>
              <Foundation name="video" size={hp(3.8)} color="#737373" />
            </TouchableOpacity>
            <TouchableOpacity onPress={openConversationInfor}>
              <Ionicons
                name="information-circle"
                size={hp(2.8)}
                color="#737373"
              />
            </TouchableOpacity>
          </View>
        ),
      }}
    />
  );
}
const styles = StyleSheet.create({
  headerContainer: { flexDirection: "row", alignItems: "center", gap: hp(1) },
  profileImage: { height: hp(4.5), width: hp(4.5), borderRadius: hp(2.25) },
  iconContainer: { flexDirection: "row", alignItems: "center", gap: 20 },
});
