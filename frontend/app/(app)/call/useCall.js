import { useContext } from "react";
import { StreamContext } from "../../../context/streamContext";
import { v4 as uuidv4 } from "uuid";
import { useNavigation } from "@react-navigation/native";

export const useCall = (currentUserId, calleeId) => {
    const { client } = useContext(StreamContext);
    const navigation = useNavigation();

    const initiateCall = async (isVideoCall) => {
        try {
            const callId = uuidv4();
            const newCall = client.call("default", callId);

            // Create or get the call with members
            await newCall.getOrCreate({
                data: {
                    members: [
                        { user_id: currentUserId },
                        { user_id: calleeId },
                    ],
                },
            });

            // Join the call
            await newCall.join();

            // Configure media settings
            await newCall.microphone.enable();
            if (isVideoCall) {
                await newCall.camera.enable();
            }

            // Navigate to CallScreen
            navigation.navigate("CallScreen", { callId, type: isVideoCall ? "video" : "voice" });
        } catch (error) {
            console.error(`Error initiating ${isVideoCall ? "video" : "voice"} call:`, error);
        }
    };

    return {
        initiateVoiceCall: () => initiateCall(false),
        initiateVideoCall: () => initiateCall(true),
    };
};