import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React, {useEffect, useState} from "react";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {fetchUserData} from "../api/users";
import {useAuth} from "../context/authContext";

export default function ConversationItem({
                                             item,
                                             router,
                                             noBorder,
                                             currentUser,
                                         }) {
    // Add state for other user's details
    const [otherUserName, setOtherUserName] = useState("Unknown");
    const [otherUserPic, setOtherUserPic] = useState(null);
    const {user} = useAuth();

    // Fetch other user's details when component mounts
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
                }
            }
        };

        fetchOtherUserDetails();
    }, [item, currentUser]);

    const openConversation = () => {
        router.push({pathname: "/conversation", params: item});
    };

    // Format the timestamp for display
    const getFormattedTime = (timestamp) => {
        if (!timestamp) return "";
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();
            const isThisWeek = Math.abs(now - date) < 7 * 24 * 60 * 60 * 1000;

            if (isToday) {
                // Format time for today (e.g., "2:30 PM")
                return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
            } else if (isThisWeek) {
                // Format day name for this week (e.g., "Mon", "Tue")
                return date.toLocaleDateString([], {weekday: 'short'});
            } else {
                // Format date (e.g., "31 Jun")
                return date.toLocaleDateString([], {day: 'numeric', month: 'short'});
            }
        } catch (err) {
            return "";
        }
    };

    // Get the last message text with proper formatting
    const getLastMessageText = () => {
        if (!item?.lastMessage?.text) return "";

        // Check if the current user sent this message
        const isSentByCurrentUser = item?.lastMessage?.sender === user.uid;
        const prefix = isSentByCurrentUser ? "You: " : "";
        return prefix + item.lastMessage.text;
    };

    return (
        <TouchableOpacity
            onPress={openConversation}
            style={[styles.container, noBorder && styles.noBorder]}
        >
            <Image
                source={otherUserPic ? {uri: otherUserPic} : require("../assets/images/icon.png")}
                style={styles.image}
            />
            <View style={styles.textContainer}>
                <View>
                    <Text style={styles.nameText}>{otherUserName}</Text>

                </View>
                <View style={styles.row}>
                    <Text style={styles.messageText} numberOfLines={1} ellipsizeMode="tail">
                        {getLastMessageText()}
                    </Text>
                    <Text style={styles.timeText}>{getFormattedTime(item?.lastMessage?.timestamp)}</Text>
                </View>

            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 16,
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "black",
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    image: {
        height: hp(6),
        width: hp(6),
        borderRadius: 9999,
    },
    textContainer: {
        flex: 1,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 2,
    },
    nameText: {
        fontSize: hp(2),
        fontWeight: "600",
        color: "#333",
    },
    timeText: {
        fontSize: hp(1.5),
        color: "#999",
        fontWeight: "400",
        paddingTop: 1,
    },
    messageText: {
        fontSize: hp(1.7),
        color: "#666",
        marginTop: 2,
    },
});