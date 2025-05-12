import React, {useEffect} from "react";
import {Slot, useRouter, useSegments} from "expo-router";
import {AuthContextProvider, useAuth} from "../context/authContext";
import { useHeartbeat } from "../hook/useHeartBeat";
import * as Notifications from 'expo-notifications';



Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const MainLayout = () => {
    const { isAuthenticated, handleSignOut, user } = useAuth();
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
        if (typeof isAuthenticated === "undefined") return;
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
    }, [isAuthenticated]);

    return <Slot />;
};

export default function RootLayout() {
    return (
        <AuthContextProvider>
            <MainLayout/>
        </AuthContextProvider>
    );
}
