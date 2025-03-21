import MessageItem from "./MessageItem";
import { ScrollView } from "react-native";
import React, { useRef, useEffect } from "react";

export default function MessageList({ messages, currentUser }) {
  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: false });
    console.log(1);
  }, [messages]);

  return (
    <ScrollView
      ref={scrollViewRef}
      scrollToEnd={true}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 3 }}
    >
      {messages.map((message, index) => (
        <MessageItem message={message} currentUser={currentUser} key={index} />
      ))}
    </ScrollView>
  );
}
