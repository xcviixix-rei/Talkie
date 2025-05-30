import React, {useEffect} from "react";
import {Slot, useRouter, useSegments} from "expo-router";
import {AuthContextProvider, useAuth} from "../context/authContext";
import {useHeartbeat} from "../hook/useHeartBeat";
import * as Notifications from 'expo-notifications';
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {Platform} from 'react-native';
import {messageNotificationService} from '../config/firebaseConfig';

const MainLayout = () => {
    const {isAuthenticated, isLoading, handleSignOut, user} = useAuth();
    const segments = useSegments();
    const router = useRouter();
    useHeartbeat();

    // Initialize notification service
    useEffect(() => {
      const setupNotifications = async () => {
        try {
          // Set up Android notification channel
          if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
              name: 'Default',
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#FF231F7C',
            });
          }

          // Initialize notification service
          await messageNotificationService.initialize();
          console.log("Notification service initialized at app level");
        } catch (error) {
          console.error("Error setting up notifications:", error);
        }
      };

      setupNotifications();

      return () => {
        // Clean up recurring notifications when component unmounts
        messageNotificationService.cleanup();
      };
    }, []);

    useEffect(() => {
        if (isLoading || typeof isAuthenticated === "undefined") return;
        const inApp = segments[0] === "(app)";

        const redirect = () => {
            if (isAuthenticated && !inApp) {
                if (user.username !== "") {
                    router.replace("/home");
                } else {
                    handleSignOut();
                }
            } else if (!isAuthenticated) {
                router.replace("/signIn");
            }
        };

        const timer = setTimeout(redirect, 1000);
        return () => clearTimeout(timer);
    }, [isAuthenticated, isLoading, segments, router]);

    return <Slot/>;
};

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <SafeAreaProvider>
                <AuthContextProvider>
                    <MainLayout/>
                </AuthContextProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}