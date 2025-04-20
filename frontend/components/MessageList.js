import MessageItem from "./MessageItem";
import { ScrollView } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function MessageList({ messages, currentUser }) {
  const scrollViewRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  useEffect(() => {
    if (isAtBottom) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const bottomThreshold = hp(10); // Adjust as needed
    const isUserAtBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - bottomThreshold;

    setIsAtBottom(isUserAtBottom);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 3 }}
    >
      {messages.map((text, index) => (
        <MessageItem message={text} currentUser={currentUser} key={index} />
      ))}
    </ScrollView>
  );
}
