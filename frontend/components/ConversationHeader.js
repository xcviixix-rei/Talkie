import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Stack } from "expo-router";
import { Entypo, Foundation, Ionicons } from "@expo/vector-icons";
import { fetchConversation } from "../api/conversation";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useAuth } from "../context/authContext";
import { clearCurrentCall, createAndJoinCall } from "../services/streamService";
import {v5 as uuidv5} from 'uuid';
import { UUID_V4 } from "@env";

export default function ConversationHeader({
  item,
  mockUsers,
  router,
  converName,
  converPic,
}) {
  const { user: currentUser, streamClient } = useAuth();
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

  const getCalleeId = () => {
    if (item.type === "direct") {
      return item.participants[0] === currentUser.id
        ? item.participants[1]
        : item.participants[0];
    }
    return null;
  }

  const initiateCall = async (isVideo) => {
    const calleeId = getCalleeId();
    if (!calleeId) {
      console.error("Callee ID not found");
      return;
    }

    const sortedId = [currentUser.id, calleeId].sort();
    const pairedId = `${sortedId[0]}-${sortedId[1]}`;
    const callIdBase = uuidv5(
      pairedId,
      UUID_V4
    );
    const callId = `${callIdBase}-${Date.now()}`;
    try {
      const call = await createAndJoinCall(streamClient, callId, [calleeId], isVideo);
      router.push({
        pathname: "/waiting",
        params: {
          callId: call.id,
          calleeId: calleeId,
          isVideo: isVideo.toString(),
        },
      });
    } catch (error) {
      console.error("Error initiating call:", error);
      clearCurrentCall();
    }
  }

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
            <TouchableOpacity onPress={() => initiateCall(false)}>
              <Ionicons name="call" size={hp(2.8)} color="#737373" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => initiateCall(true)}>
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
