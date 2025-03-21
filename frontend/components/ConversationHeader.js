import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { Entypo, Foundation, Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { StatusBar } from "expo-status-bar";

export default function ConversationHeader({ item, router }) {
  return (
    <Stack.Screen
      options={{
        title: item?.username || "Talkie user",
        headerStyle: { height: hp(8) },
        headerShadowVisible: false,
        headerLeft: () => (
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Entypo name="chevron-left" size={hp(4)} color="#737373" />
            </TouchableOpacity>
            <Image
              source={item?.profileUrl || require("../assets/images/icon.png")}
              style={styles.profileImage}
            />
          </View>
        ),
        headerRight: () => (
          <View style={styles.iconContainer}>
            <Ionicons name="call" size={hp(2.8)} color="#737373" />
            <Foundation name="video" size={hp(3.8)} color="#737373" />
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
    gap: hp(1),
  },
  profileImage: {
    height: hp(4.5),
    width: hp(4.5),
    borderRadius: hp(2.25),
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
});
