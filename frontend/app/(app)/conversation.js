import {Alert, StyleSheet, TextInput, TouchableOpacity, View} from "react-native";
import React, {useRef, useState} from "react";
import {useLocalSearchParams, useRouter} from "expo-router";
import ConversationHeader from "../../components/ConversationHeader";
import MessageList from "../../components/MessageList";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import CustomKeyboardView from "../../components/CustomKeyboardView";
import {Ionicons} from "@expo/vector-icons";
import {db} from "../../config/firebaseConfig";
import {useAuth} from "../../context/authContext";
import {collection, doc, setDoc, Timestamp,} from "firebase/firestore";

export default function Conversation() {
    const item = useLocalSearchParams();
    const router = useRouter();
    const {user} = useAuth();
    const [messages, setMessages] = useState([
        {
            username: "manh",
            //profileUrl: require("../assets/conech.jpg"),
            userId: "1",
            message: "Hello Phong!",
            createdAt: "2025-03-19T10:15:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message: "Hey Manh! How's it going?",
            createdAt: "2025-03-19T10:16:00Z",
        },
        {
            username: "manh",
            //profileUrl: require("../assets/conech.jpg"),
            userId: "1",
            message: "I'm doing well! Just working on a new project. What about you?",
            createdAt: "2025-03-19T10:18:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
        {
            username: "phong",
            //profileUrl: require("../assets/phuthuy.jpg"),
            userId: "2",
            message:
                "Nice! I'm also busy with some React Native stuff. We should catch up soon.",
            createdAt: "2025-03-19T10:20:00Z",
        },
    ]);
    const textRef = useRef("");
    const inputRef = useRef(null);
    // useEffect(() => {
    //   createConversationIfNotExists();
    //   let conversationId = getconversationId([user, ...item]);
    //   const docRef = doc(db, "conversations");
    //   const messageRef = collection(docRef, "messages");
    //   const q = query(messageRef, orderBy("createAt", "asc"));

    //   let unsub = onSnapshot(q, (snapshot) => {
    //     let allMessages = snapshot.docs.map((doc) => doc.data());
    //     setMessages([...allMessages]);
    //   });
    // });

    const createConversationIfNotExists = async () => {
        // call API
        let conversationId = getconversationID([user, ...item]);
        await setDoc(doc(db), "conversations", conversationId),
            {
                conversationId,
                createdAt: Timestamp.fromDate(new Date()),
            };
    };

    const handleSendMessage = async () => {
        let message = textRef.current.trim();
        if (!message) return;
        if (inputRef) inputRef?.current?.clear();

        try {
            let conversationId = getConversationId([user, ...item]);
            const docRef = doc(db, "conversations");
            const messageRef = collection(docRef, "message");

            const newDoc = await addDoc(messageRef, {
                userId: user?.userId,
                message: message,
                userfileUrl: user?.userfileUrl,
                senderName: user?.userName,
                createdAt: Timestamp.fromDate(new Date()),
            });
        } catch (err) {
            Alert.alert("Message", err.message);
        }
    };

    return (
        <CustomKeyboardView inChat={true}>
            <View style={styles.container}>
                <ConversationHeader item={item} router={router}/>
                <View style={styles.header}/>
                <View style={styles.main}>
                    <View style={styles.messageList}>
                        <MessageList messages={messages} currentUser={user}/>
                    </View>
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <View style={styles.inputBox}>
                                <TextInput
                                    ref={inputRef}
                                    onChangeText={(value) => (textRef.current = value)}
                                    placeholder="Type message ..."
                                    style={styles.textInput}
                                />
                                <TouchableOpacity style={styles.sendButton}>
                                    <Ionicons
                                        name="send"
                                        onPress={handleSendMessage}
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
        borderBottomColor: "#d1d5db", // border-neutral-300
    },
    main: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#f3f4f6", // bg-neutral-100
        overflow: "visible",
    },
    messageList: {
        flex: 1,
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
        borderColor: "#d1d5db", // border-neutral-300
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
        backgroundColor: "#e5e7eb", // bg-neutral-200
        padding: hp(1),
        borderRadius: 50,
    },
});
