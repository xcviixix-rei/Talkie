import { Image, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { Entypo, Foundation, Ionicons } from "@expo/vector-icons";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useAuth } from "../context/authContext";
import { clearCurrentCall, createAndJoinCall } from "../services/streamService";
import {v5 as uuidv5} from 'uuid';
import {
  checkActiveStatus,
  formatActiveTime,
  getLastActiveUser,
} from "./ConversationItem";


const UUID_V4 = '70a5e7f6-6360-4560-a7d3-3230afb08140';

export default function ConversationHeader({
  item,
  theme,
  mockUsers,
  router,
  converName,
  converPic,
  currentUser,
}) {
  const [isActive, setIsActive] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState("");
  const { user: currentStreamUser, streamClient } = useAuth();

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

  const getCalleeIds = () => {
    return item.participants
        .filter(participant => participant.user_id !== currentStreamUser.id)
        .map(participant => participant.user_id);
  }

  const initiateCall = async (isVideo) => {
    const calleeIds = getCalleeIds();
    if (!calleeIds) {
      console.error("Callee ID not found");
      return;
    }

    const sortedId = [currentStreamUser.id, ...calleeIds].sort();
    const pairedId = sortedId.join("-");
    const callIdBase = uuidv5(
      pairedId,
      UUID_V4
    );
    const callId = `${callIdBase}-${Date.now()}`;
    try {
      const call = await createAndJoinCall(streamClient, callId, calleeIds, isVideo);
      await call.camera.enable(isVideo);
      await call.join();
      router.push({
        pathname: "/call",
        params: {
          callId: call.id,
          isVideo: isVideo.toString(),
          converName,
          converPic,
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
        headerStyle: {
          backgroundColor: theme?.header_color || "#FFFFFF",
        },
        headerShadowVisible: false,
        headerTitle: () => null,
        headerLeft: () => (
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Entypo
                name="chevron-left"
                size={hp(4)}
                color={theme?.ui_color || "#0084ff"}
              />
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
            <TouchableOpacity onPress={() => initiateCall(false)}>
              <Ionicons name="call" size={hp(2.8)} color="#737373" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => initiateCall(true)}>
              <Foundation name="video" size={hp(3.8)} color="#737373" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openConversationInfor}
              style={styles.actionButton}
            >
              <Ionicons
                name="information-circle"
                size={hp(3.2)}
                color={theme?.ui_color || "#0084ff"}
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
    backgroundColor: "#31A24C",
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
