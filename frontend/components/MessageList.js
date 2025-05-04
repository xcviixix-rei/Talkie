// import MessageItem from "./MessageItem";
// import {
//   ScrollView,
//   TouchableOpacity,
//   View,
//   StyleSheet,
//   Animated,
// } from "react-native";
// import React, { useEffect, useRef, useState } from "react";
// import { heightPercentageToDP as hp } from "react-native-responsive-screen";
// import { ChevronDown } from "lucide-react-native";

// export default function MessageList({ messages, currentUser }) {
//   const scrollViewRef = useRef(null);
//   const [isAtBottom, setIsAtBottom] = useState(true);
//   const [showScrollButton, setShowScrollButton] = useState(false);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // Independent visibility control that doesn't rely only on isAtBottom
//   const [contentFullyLoaded, setContentFullyLoaded] = useState(false);

//   useEffect(() => {
//     // Mark content as loaded after a safe delay from mount
//     const loadTimer = setTimeout(() => {
//       setContentFullyLoaded(true);
//     }, 500);
//     return () => clearTimeout(loadTimer);
//   }, []);

//   // Scroll to bottom when new messages arrive if user is already at bottom
//   useEffect(() => {
//     if (isAtBottom) {
//       scrollToBottom(true);
//       setShowScrollButton(false);
//       fadeOut();
//     } else if (messages.length > 0) {
//       // Show scroll button when new messages arrive and user isn't at bottom
//       setShowScrollButton(true);
//       fadeIn();
//     }
//   }, [messages]);

//   // Initial scroll to bottom when component mounts - more reliable approach
//   useEffect(() => {
//     // Immediate attempt
//     // scrollToBottom(false);
//     // setShowScrollButton(false);

//     // Multiple attempts with different timings to ensure it works
//     setTimeout(() => {
//       if (scrollViewRef.current) {
//         scrollToBottom(false);
//         setShowScrollButton(false);
//       }
//     }, 400);
//   }, []);

//   // Ensure scroll button is fully hidden at start and doesn't flash
//   useEffect(() => {
//     fadeAnim.setValue(0); // Start with opacity at 0
//     setShowScrollButton(false);
//   }, []);

//   const scrollToBottom = (animated = true) => {
//     scrollViewRef.current?.scrollToEnd({ animated });
//     // Ensure button is hidden after scrolling
//     setTimeout(() => {
//       setShowScrollButton(false);
//       fadeOut();
//     }, 100);
//   };

//   const handleScroll = (event) => {
//     const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
//     const bottomThreshold = hp(40); // Increased threshold to ensure better detection
//     const isUserAtBottom =
//       layoutMeasurement.height + contentOffset.y >=
//       contentSize.height - bottomThreshold;

//     // Update bottom state
//     setIsAtBottom(isUserAtBottom);

//     // Only control button visibility after content is fully loaded
//     if (!contentFullyLoaded) return;

//     // Show/hide scroll button based on scroll position
//     if (isUserAtBottom) {
//       // Always hide when at bottom
//       if (showScrollButton) {
//         setShowScrollButton(false);
//         fadeOut();
//       }
//     } else if (contentSize.height > layoutMeasurement.height + hp(40)) {
//       // Only show when there's significant scrollable content and not at bottom
//       if (!showScrollButton) {
//         setShowScrollButton(true);
//         fadeIn();
//       }
//     }
//   };

//   const fadeIn = () => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 200,
//       useNativeDriver: true,
//     }).start();
//   };

//   const fadeOut = () => {
//     Animated.timing(fadeAnim, {
//       toValue: 0,
//       duration: 200,
//       useNativeDriver: true,
//     }).start();
//   };

//   return !contentFullyLoaded ? (
//     <></>
//   ) : (
//     <View style={styles.container}>
//       <ScrollView
//         ref={scrollViewRef}
//         onScroll={handleScroll}
//         scrollEventThrottle={32}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//         onContentSizeChange={() => {
//           // When content size changes and we're supposed to be at bottom, ensure we are
//           if (isAtBottom || !contentFullyLoaded) {
//             scrollToBottom(false);
//           }
//         }}
//         onLayout={() => {
//           // When layout happens, scroll to bottom if we're supposed to be there
//           if (isAtBottom || !contentFullyLoaded) {
//             scrollToBottom(false);
//           }
//         }}
//       >
//         {messages.map((text, index) => (
//           <MessageItem message={text} currentUser={currentUser} key={index} />
//         ))}
//       </ScrollView>

//       {/* Scroll to bottom button */}
//       <Animated.View
//         style={[
//           styles.scrollButtonContainer,
//           { opacity: fadeAnim },
//           !showScrollButton && { display: "none" },
//         ]}
//         pointerEvents={showScrollButton ? "auto" : "none"}
//       >
//         <TouchableOpacity
//           style={styles.scrollButton}
//           onPress={() => scrollToBottom()}
//           activeOpacity={0.8}
//         >
//           <ChevronDown size={24} color="#ffffff" />
//         </TouchableOpacity>
//       </Animated.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     position: "relative",
//   },
//   scrollContent: {
//     paddingTop: 3,
//     paddingBottom: hp(2),
//   },
//   scrollButtonContainer: {
//     position: "absolute",
//     bottom: hp(2),
//     left: 0,
//     right: 0,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 5,
//     zIndex: 10,
//   },
//   scrollButton: {
//     backgroundColor: "#000000", // Changed to black to match your screenshot
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
// });

import MessageItem from "./MessageItem";
import {
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  Pressable, // Added Pressable import
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { ChevronDown } from "lucide-react-native";
import MessageToolbar from "./MessageToolbar";

export default function MessageList({ messages, currentUser }) {
  const scrollViewRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // State for message toolbar
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(null);
  const [toolbarVisible, settoolbarVisible] = useState(false);

  // Independent visibility control that doesn't rely only on isAtBottom
  const [contentFullyLoaded, setContentFullyLoaded] = useState(false);

  useEffect(() => {
    // Mark content as loaded after a safe delay from mount
    const loadTimer = setTimeout(() => {
      setContentFullyLoaded(true);
    }, 500);
    return () => clearTimeout(loadTimer);
  }, []);

  // Scroll to bottom when new messages arrive if user is already at bottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom(true);
      setShowScrollButton(false);
      fadeOut();
    } else if (messages.length > 0) {
      // Show scroll button when new messages arrive and user isn't at bottom
      setShowScrollButton(true);
      fadeIn();
    }
  }, [messages]);

  // Initial scroll to bottom when component mounts - more reliable approach
  useEffect(() => {
    // Multiple attempts with different timings to ensure it works
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollToBottom(false);
        setShowScrollButton(false);
      }
    }, 400);
  }, []);

  // Ensure scroll button is fully hidden at start and doesn't flash
  useEffect(() => {
    fadeAnim.setValue(0); // Start with opacity at 0
    setShowScrollButton(false);
  }, []);

  const scrollToBottom = (animated = true) => {
    scrollViewRef.current?.scrollToEnd({ animated });
    // Ensure button is hidden after scrolling
    setTimeout(() => {
      setShowScrollButton(false);
      fadeOut();
    }, 100);
  };

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const bottomThreshold = hp(40); // Increased threshold to ensure better detection
    const isUserAtBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - bottomThreshold;

    // Update bottom state
    setIsAtBottom(isUserAtBottom);

    // Only control button visibility after content is fully loaded
    if (!contentFullyLoaded) return;

    // Show/hide scroll button based on scroll position
    if (isUserAtBottom) {
      // Always hide when at bottom
      if (showScrollButton) {
        setShowScrollButton(false);
        fadeOut();
      }
    } else if (contentSize.height > layoutMeasurement.height + hp(40)) {
      // Only show when there's significant scrollable content and not at bottom
      if (!showScrollButton) {
        setShowScrollButton(true);
        fadeIn();
      }
    }
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Handle long press on a message
  const handleLongPressMessage = (index) => {
    setSelectedMessageIndex(index);
    settoolbarVisible(true);
  };

  // Handle dismissing the toolbar
  const handleDismissToolbar = () => {
    settoolbarVisible(false);
    setSelectedMessageIndex(null);
    console.log(2);
  };

  return !contentFullyLoaded ? (
    <></>
  ) : (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={() => {
          // When content size changes and we're supposed to be at bottom, ensure we are
          if (isAtBottom || !contentFullyLoaded) {
            scrollToBottom(false);
          }
        }}
        onLayout={() => {
          // When layout happens, scroll to bottom if we're supposed to be there
          if (isAtBottom || !contentFullyLoaded) {
            scrollToBottom(false);
          }
        }}
      >
        {messages.map((message, index) => (
          <Pressable
            key={index}
            onLongPress={() => handleLongPressMessage(index)}
            delayLongPress={300}
          >
            <MessageItem
              message={message}
              currentUser={currentUser}
              isSelected={selectedMessageIndex === index}
            />
          </Pressable>
        ))}
      </ScrollView>
      {/* Message Toolbar */}
      {toolbarVisible && selectedMessageIndex !== null && (
        <MessageToolbar
          message={messages[selectedMessageIndex]}
          onDismiss={handleDismissToolbar}
          user={currentUser}
        />
      )}
      {toolbarVisible && selectedMessageIndex !== null && (
        <Pressable
          style={StyleSheet.absoluteFill} // Covers the entire screen
          onPress={handleDismissToolbar}
        />
      )}
      {/* Scroll to bottom button */}
      <Animated.View
        style={[
          styles.scrollButtonContainer,
          { opacity: fadeAnim },
          !showScrollButton && { display: "none" },
        ]}
        pointerEvents={showScrollButton ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.scrollButton}
          onPress={() => scrollToBottom()}
          activeOpacity={0.8}
        >
          <ChevronDown size={24} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  scrollContent: {
    paddingTop: 3,
    paddingBottom: hp(2),
  },
  scrollButtonContainer: {
    position: "absolute",
    bottom: hp(2),
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    zIndex: 10,
  },
  scrollButton: {
    backgroundColor: "#000000", // Changed to black to match your screenshot
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
