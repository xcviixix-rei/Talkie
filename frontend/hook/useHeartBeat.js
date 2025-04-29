import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { updateActiveStatus } from "../api/user";
import { useAuth } from "../context/authContext";
// export function useHeartbeat() {
//   const appState = useRef(AppState.currentState);
//   const intervalRef = useRef(null);
//   const { user, isAuthenticated } = useAuth();
//   if (!user) return;
//   console.log(user.id);

//   useEffect(() => {
//     const startHeartbeat = () => {
//       intervalRef.current = setInterval(() => {
//         if (user?.id) {
//           updateActiveStatus(user.id);
//         }
//       }, 30000);
//     };

//     const stopHeartbeat = () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     };

//     const handleAppStateChange = (nextAppState) => {
//       if (nextAppState === "active") {
//         startHeartbeat();
//       } else {
//         stopHeartbeat();
//       }
//       appState.current = nextAppState;
//     };

//     AppState.addEventListener("change", handleAppStateChange);

//     startHeartbeat();

//     return () => {
//       stopHeartbeat();
//       AppState.removeEventListener("change", handleAppStateChange);
//     };
//   }, [!!isAuthenticated, user?.id ?? null]);
// }
export function useHeartbeat() {
  const appState = useRef(AppState.currentState);
  const intervalRef = useRef(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Early return inside useEffect, not before hooks
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
