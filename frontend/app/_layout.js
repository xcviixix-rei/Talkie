import React, {useEffect, useState} from "react";
import {Stack, useRouter, useSegments} from "expo-router";
import {AuthContextProvider, useAuth} from "../context/authContext";
import {Easing, Platform} from "react-native";

const MainLayout = () => {
    const {isAuthenticated} = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (typeof isAuthenticated === "undefined") return;

        const inApp = segments[0] === "(app)";
        const inAuthFlow = segments[0] === "signIn" || segments[0] === "signUp";

        // Set a short delay before navigation to ensure components are loaded
        setTimeout(() => {
            setIsReady(true);
            if (isAuthenticated && !inApp) {
                router.replace("/home");
            } else if (!isAuthenticated && !inAuthFlow && segments[0] !== undefined) {
                router.replace("/signIn");
            }
        }, 100); // Small delay to ensure HomeHeader is ready
    }, [isAuthenticated, segments]);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: Platform.OS === 'ios' ? "default" : "fade",
                animationDuration: 500,
                gestureEnabled: false,
                contentStyle: {backgroundColor: 'white'},
                presentation: "card",
                customAnimationOnGesture: true,
                fullScreenGestureEnabled: false,
                animationTypeForReplace: "push",
                transitionSpec: {
                    open: {
                        animation: 'timing',
                        config: {
                            duration: 500,
                            easing: Easing.out(Easing.poly(4)),
                            delay: 500, // Add 500ms delay to start transition
                            useNativeDriver: true
                        }
                    },
                    close: {
                        animation: 'timing',
                        config: {
                            duration: 500,
                            easing: Easing.in(Easing.poly(4)),
                            useNativeDriver: true
                        }
                    }
                }
            }}
        >
            <Stack.Screen
                name="(app)"
                options={{
                    headerShown: false,
                    animation: Platform.OS === 'ios' ? "default" : "fade",
                }}
            />
            <Stack.Screen name="signIn" options={{headerShown: false}}/>
            <Stack.Screen name="signUp" options={{headerShown: false}}/>
        </Stack>
    );
};

export default function RootLayout() {
    return (
        <AuthContextProvider>
            <MainLayout/>
        </AuthContextProvider>
    );
}