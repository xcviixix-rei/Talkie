import { StyleSheet, View, Text } from "react-native";
import React, { useEffect } from "react";
import { Slot, useRouter, useSegments, SplashScreen } from "expo-router";
import { AuthContextProvider, useAuth } from "../context/authContext";

const MainLayout = () => {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (typeof isAuthenticated === "undefined") return;
    const inApp = segments[0] === "(app)";
    const redirect = () => {
      if (isAuthenticated && !inApp) {
        router.replace("/home");
      } else if (!isAuthenticated) {
        router.replace("/signIn");
      }
    };

    const timer = setTimeout(redirect, 1000); // 2-second delay
    return () => clearTimeout(timer); // Cleanup the timer
  }, [isAuthenticated]);

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <MainLayout />
    </AuthContextProvider>
  );
}
