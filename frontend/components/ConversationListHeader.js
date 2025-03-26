import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BalsamiqSans_700Bold, useFonts } from "@expo-google-fonts/balsamiq-sans";
import { View, Text } from "react-native";

export default function ConversationListHeader() {
    const { top } = useSafeAreaInsets();
    useFonts({ BalsamiqSans_700Bold });

    return (
        <View
            style={{
                paddingTop: top,
                paddingVertical: 100,
                alignItems: "left",
                paddingLeft: 10,
                borderBottomWidth: 2,
                borderBottomColor: "#1E90FF",
                paddingBottom: 2,
            }}
        >
            <Text
                style={{
                    fontSize: 32,
                    color: "#1E90FF",
                    letterSpacing: 1,
                    fontFamily: "BalsamiqSans_700Bold",
                }}
            >
                Talkie
            </Text>
        </View>
    );
}