import {ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity, View} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import {useLocalSearchParams, useRouter} from "expo-router";
import ConversationHeader from "../../components/ConversationHeader";
import MessageList from "../../components/MessageList";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import CustomKeyboardView from "../../components/CustomKeyboardView";
import {Ionicons} from "@expo/vector-icons";
import {useAuth} from "../../context/authContext";

export default function Conversation() {
    const item = useLocalSearchParams();
    const router = useRouter();
    const {user} = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const textRef = useRef("");
    const inputRef = useRef(null);

    // Fetch messages for the conversation
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true);
                const conversationId = item.conversationId;

                if (!conversationId) {
                    console.error("No conversation ID provided");
                    setLoading(false);
                    return;
                }

                // Change the URL to match what you provided
                const response = await fetch(
                    `http://10.0.2.2:5000/api/conversations/${conversationId}/messages/`
                );

                // Parse the JSON response
                const data = await response.json();

                // Transform the API response to match component's expected format
                const formattedMessages = data.map(msg => ({
                    id: msg.id,
                    username: msg.sender.username,
                    userId: msg.sender.user_id,
                    message: msg.text,
                    createdAt: msg.timestamp,
                    attachments: msg.attachments || [],
                    seenBy: msg.seen_by || []
                }));

                setMessages(formattedMessages);
            } catch (error) {
                console.error("Error fetching messages:", error);
                Alert.alert("Error", "Failed to load conversation messages");
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [item.conversationId]);

    const handleSendMessage = async () => {
        const message = textRef.current.trim();
        if (!message) return;
        if (inputRef.current) inputRef.current.clear();
        textRef.current = "";

        try {
            const conversationId = item.conversationId;

            // Optimistically update UI
            const newMessage = {
                id: `temp-${Date.now()}`,
                username: user.username,
                userId: user.uid,
                message: message,
                createdAt: new Date().toISOString(),
                pending: true
            };

            setMessages(prev => [...prev, newMessage]);

            // Send message to API
            const response = await fetch(
                `http://10.0.2.2:5000/api/conversations/${conversationId}/messages/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        text: message,
                        sender_id: user.uid
                    })
                }
            );

            // Parse the response
            const responseData = await response.json();

            // Replace temp message with actual message
            setMessages(prev =>
                prev.map(msg => msg.id === newMessage.id ? {
                    id: responseData.id,
                    username: responseData.sender.username,
                    userId: responseData.sender.user_id,
                    message: responseData.text,
                    createdAt: responseData.timestamp,
                    attachments: responseData.attachments || [],
                    seenBy: responseData.seen_by || []
                } : msg)
            );

        } catch (err) {
            console.error("Error sending message:", err);
            Alert.alert("Error", "Failed to send message");

            // Remove failed message from UI
            setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
        }
    };

    return (
        <CustomKeyboardView inChat={true}>
            <View style={styles.container}>
                <ConversationHeader item={item} router={router}/>
                <View style={styles.header}/>
                <View style={styles.main}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#1E90FF"/>
                        </View>
                    ) : (
                        <View style={styles.messageList}>
                            <MessageList messages={messages} currentUser={user}/>
                        </View>
                    )}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <View style={styles.inputBox}>
                                <TextInput
                                    ref={inputRef}
                                    onChangeText={(value) => (textRef.current = value)}
                                    placeholder="Type message..."
                                    style={styles.textInput}
                                />
                                <TouchableOpacity
                                    style={styles.sendButton}
                                    onPress={handleSendMessage}
                                >
                                    <Ionicons
                                        name="send"
                                        size={hp(2.7)}
                                        color="#737373"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    statusBar: {
        backgroundColor: "white",
    },
    header: {
        height: hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: "#d1d5db",
    },
    main: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
        overflow: "visible",
    },
    messageList: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    inputContainer: {
        marginBottom: hp(1.0),
        paddingTop: hp(0.5),
    },
    inputWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: wp(3),
    },
    inputBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#d1d5db",
        padding: hp(1),
        borderRadius: 50,
        width: "100%",
    },
    textInput: {
        flex: 2,
        fontSize: hp(2),
        marginRight: wp(10),
    },
    sendButton: {
        backgroundColor: "#e5e7eb",
        padding: hp(1),
        borderRadius: 50,
    },
});