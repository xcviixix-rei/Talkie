import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React, {useEffect, useState} from "react";
import {Stack} from "expo-router";
import {Entypo, Foundation, Ionicons} from "@expo/vector-icons";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {useAuth} from "../context/authContext";
import {fetchUserData} from "../api/users";

export default function ConversationHeader({item, router, currentUser}) {
    const {user} = useAuth();
    const [otherUserName, setOtherUserName] = useState("Unknown");
    const [otherUserPic, setOtherUserPic] = useState(null);

    // Get the other user in the conversation
    useEffect(() => {
        const fetchOtherUserDetails = async () => {
            if (item?.userId && item.userId !== currentUser?.uid) {
                try {
                    // Fetch actual user data from API
                    const userData = await fetchUserData(item.userId);

                    // Set the name and profile pic from the fetched user data
                    setOtherUserName(userData.username || "Unknown");
                    setOtherUserPic(userData.profile_pic);
                } catch (error) {
                    console.error("Error fetching user details:", error);
                    // Fallback to item data if API call fails
                    setOtherUserName(item.username || "Unknown");
                    setOtherUserPic(item.profile_pic);
                    console.log(otherUserPic)
                }
            }
        };

        fetchOtherUserDetails();
    }, [item, user]);


    return (
        <Stack.Screen
            options={{
                title: otherUserName,
                headerStyle: {height: hp(8)},
                headerShadowVisible: false,
                headerLeft: () => (
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Entypo name="chevron-left" size={hp(4)} color="#737373"/>
                        </TouchableOpacity>
                        <Image
                            source={{uri: otherUserPic}}
                            style={styles.profileImage}
                        />
                    </View>
                ),
                headerRight: () => (
                    <View style={styles.iconContainer}>
                        <Ionicons name="call" size={hp(2.8)} color="#737373"/>
                        <Foundation name="video" size={hp(3.8)} color="#737373"/>
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
        marginRight: hp(1),
    },
    username: {
        fontSize: hp(2),
        fontWeight: "500",
        color: "#333",
    },
    iconContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
    },
});