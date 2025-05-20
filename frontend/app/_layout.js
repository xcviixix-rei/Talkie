import React, {useEffect} from "react";
import {Slot, useRouter, useSegments} from "expo-router";
import {AuthContextProvider, useAuth} from "../context/authContext";
import { useHeartbeat } from "../hook/useHeartBeat";
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const MainLayout = () => {
    const { isAuthenticated, isLoading, handleSignOut, user } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    useHeartbeat();

    useEffect(() => {
        // Set up notification response handler
        const responseListener = Notifications.addNotificationResponseReceivedListener(
            response => {
                const { data } = response.notification.request.content;

                // Handle notification tap
                if (data.conversationId) {
                    router.push(`/conversation/${data.conversationId}`);
                } else if (data.screen) {
                    router.push(`/${data.screen}`);
                }
            }
        );

        return () => {
            Notifications.removeNotificationSubscription(responseListener);
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

    return <Slot />;
};

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AuthContextProvider>
                        <MainLayout/>
                </AuthContextProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
