import { useContext, useEffect, useState } from "react";
import { StreamContext } from "../../../context/streamContext";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchUserData } from "../../../api/user";

const CallHandler = () => {
  const { client } = useContext(StreamContext);
  const [incomingCall, setIncomingCall] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (client) {
      const handleRing = async (event) => {
        setIncomingCall(event.call);
        let callerUsername = "Unknown Caller";
        try {
          const callerId = event.call.state.members.find(member => member.user_id !== client.userId)?.user_id;
          if (callerId) {
            const callerData = await fetchUserData(callerId);
            callerUsername = callerData?.full_name || "Unknown Caller";
          }
        } catch (error) {
          console.error("Error fetching caller data:", error);
        }
        Alert.alert(
          "Incoming Call",
          `You have an incoming ${event.call.type === "video-call" ? "video" : "voice"} call from ${callerUsername}. Accept?`,
          [
            {
              text: "Reject",
              onPress: () => setIncomingCall(null),
              style: "cancel",
            },
            {
              text: "Accept",
              onPress: async () => {
                await event.call.join();
                setIncomingCall(null);
                // Navigate to CallScreen
                navigation.navigate("CallScreen", {
                  callId: event.call.id,
                  type: event.call.type === "video-call" ? "video" : "voice",
                  calleeUsername: callerUsername,
                });
              },
            },
          ]
        );
      };
      client.on("call.ring", handleRing);
      return () => client.off("call.ring", handleRing);
    }
  }, [client]);

  return null; // This component doesn't render UI itself
};

export default CallHandler;