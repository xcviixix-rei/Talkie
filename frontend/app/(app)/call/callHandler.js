import { useContext, useEffect, useState } from "react";
import { StreamContext } from "../../../context/streamContext";
import { Alert } from "react-native";

const CallHandler = () => {
  const { client } = useContext(StreamContext);
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (client) {
      const handleRing = (event) => {
        setIncomingCall(event.call);
        Alert.alert(
          "Incoming Call",
          "You have an incoming call. Accept?",
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
                // Navigate to call screen or show call UI
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