import React, {useEffect} from "react";
import {Slot, useRouter, useSegments} from "expo-router";
import {AuthContextProvider, useAuth} from "../context/authContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

const MainLayout = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading || typeof isAuthenticated === "undefined") return;
        const inApp = segments[0] === "(app)";

        const redirect = () => {
            if (isAuthenticated && !inApp) {
                router.replace("/home");
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
