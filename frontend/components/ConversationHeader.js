import { Image, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { Entypo, Foundation, Ionicons } from "@expo/vector-icons";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import {
  checkActiveStatus,
  formatActiveTime,
  getLastActiveUser,
} from "./ConversationItem";

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
  const [isActive, setIsActive] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState("");

  const refreshTimeDisplays = () => {
    const latestActiveUser = getLastActiveUser(mockUsers, currentUser);
    if (latestActiveUser?.status) {
      setIsActive(checkActiveStatus(latestActiveUser.status));
      setLastActiveTime(formatActiveTime(latestActiveUser.status));
    }
  };

  useEffect(() => {
    // Initial call to set status
    refreshTimeDisplays();

    // Set interval for regular updates
    const timeInterval = setInterval(refreshTimeDisplays, 60000);

    // Cleanup function
    return () => {
      clearInterval(timeInterval);
    };
  }, [mockUsers, currentUser]);

  const openConversationInfor = () => {
    router.push({
      pathname: "/converInfor/conversationInfor",
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
        title: "",
        headerStyle: { height: hp(8) },
        headerShadowVisible: false,
        headerLeft: () => (
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Entypo name="chevron-left" size={hp(4)} color="#0084ff" />
            </TouchableOpacity>
            <View style={styles.profileContainer}>
              <Image source={{ uri: converPic }} style={styles.profileImage} />
              {isActive && <View style={styles.activeStatusIndicator} />}
            </View>
            <View style={styles.nameStatusContainer}>
              <Text style={styles.userName}>{converName}</Text>
              <Text style={styles.statusText}>
                {isActive ? "Active now" : lastActiveTime}
              </Text>
            </View>
          </View>
        ),
        headerRight: () => (
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={onVoiceCall} style={styles.actionButton}>
              <Ionicons name="call" size={hp(2.8)} color="#0084ff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onVideoCall} style={styles.actionButton}>
              <Foundation name="video" size={hp(3.8)} color="#0084ff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openConversationInfor}
              style={styles.actionButton}
            >
              <Ionicons
                name="information-circle"
                size={hp(3.2)}
                color="#0084ff"
              />
            </TouchableOpacity>
          </View>
        ),
      }}
    />
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: hp(1.5),
    paddingLeft: hp(0.5),
  },
  profileContainer: {
    position: "relative",
  },
  profileImage: {
    height: hp(4.5),
    width: hp(4.5),
    borderRadius: hp(2.25),
  },
  activeStatusIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: hp(1.8),
    height: hp(1.8),
    borderRadius: hp(10),
    backgroundColor: "#31A24C", // Messenger green
    borderWidth: hp(0.2),
    borderColor: "#FFFFFF",
  },
  nameStatusContainer: {
    flexDirection: "column",
    justifyContent: "center",
  },
  userName: {
    fontSize: hp(2.3),
    fontWeight: "600",
    color: "#262626",
  },
  statusText: {
    fontSize: hp(1.4),
    color: "#65676B",
    marginTop: hp(0.2),
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: hp(2),
    paddingRight: hp(-1),
  },
  actionButton: {
    padding: hp(0.2),
  },
});
