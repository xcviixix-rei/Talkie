import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { getconversationId } from "../utils/common";

export default function ConversationItem({
  item,
  router,
  noBorder,
  currentuser,
}) {
  const [lastMessage, setLastMessage] = useState(undefined);
  const openConversation = () => {
    router.push({ pathname: "/conversation", params: item });
  };

  user = {
    username: "manh",
    // profileUrl: require("../assets/conech.jpg"),
    userId: "1",
  };
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
  ]);

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
    let conversationId = getconversationID([currentuser, ...item]);
    await setDoc(doc(db), "conversations", conversationId),
      {
        conversationId,
        createdAt: Timestamp.fromDate(new Date()),
      };
  };
  useEffect(() => {
    try {
      setLastMessage(
        messages[messages.length - 1].userId === user.userId
          ? "You"
          : messages[messages.length - 1].username +
              ": " +
              messages[messages.length - 1].message
      );
    } catch (err) {
      console.log(err);
    }
  });
  return (
    <TouchableOpacity
      onPress={openConversation}
      style={[styles.container, noBorder && styles.noBorder]}
    >
      <Image
        source={item?.profileUrl || require("../assets/icon.png")}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <View style={styles.row}>
          <Text style={styles.nameText}>{item?.username}</Text>
          <Text style={styles.timeText}>time</Text>
        </View>
        <Text style={styles.messageText} numberOfLines={1} ellipsizeMode="tail">
          {lastMessage}
        </Text>
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
    borderBottomWidth: 0, // Removes border when applied
  },
  image: {
    height: hp(6),
    width: hp(6),
    borderRadius: 9999, // Fully rounded image
  },
  textContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameText: {
    fontSize: hp(2),
    fontWeight: "600",
    color: "#333",
  },
  timeText: {
    fontSize: hp(2),
    color: "#333",
  },
  messageText: {
    fontSize: hp(2),
    color: "#333",
  },
});
