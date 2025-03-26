import MessageItem from "./MessageItem";
import {ScrollView} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import {heightPercentageToDP as hp,} from "react-native-responsive-screen";

export default function MessageList({messages, currentUser}) {
    const scrollViewRef = useRef(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

    useEffect(() => {
        if (isAtBottom) {
            const timer = setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({animated: true});
            }, 100); // 50ms delay

            return () => clearTimeout(timer);
        }
    }, [messages]);

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({animated: false});
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    const handleScroll = (event) => {
        const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
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
            contentContainerStyle={{paddingTop: 3}}
        >
            {messages.map((message, index) => (
                <MessageItem message={message} currentUser={currentUser} key={index}/>
            ))}
        </ScrollView>
    );
}
