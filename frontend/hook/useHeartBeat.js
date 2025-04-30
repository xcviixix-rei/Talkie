import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { updateActiveStatus } from "../api/user";
import { useAuth } from "../context/authContext";

export function useHeartbeat() {
  const appState = useRef(AppState.currentState);
  const intervalRef = useRef(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const startHeartbeat = () => {
      intervalRef.current = setInterval(() => {
        updateActiveStatus(user.id);
      }, 30000);
    };

    const stopHeartbeat = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "active") {
        startHeartbeat();
      } else {
        stopHeartbeat();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    startHeartbeat();

    return () => {
      stopHeartbeat();
      subscription.remove();
    };
  }, [isAuthenticated, user?.id]); // Consistent dependency array
}
