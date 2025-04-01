import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BalsamiqSans_700Bold, useFonts } from "@expo-google-fonts/balsamiq-sans";
import {View, Text, Pressable} from "react-native";
import { useAuth } from "../context/authContext";
import {Ionicons} from "@expo/vector-icons";

export default function ConversationListHeader() {
    const insets = useSafeAreaInsets();
    const [fontsLoaded] = useFonts({ BalsamiqSans_700Bold });
    const { handleSignOut, user } = useAuth();
    console.log("user", user);

    const handleSignOutPress = async () => {
        await handleSignOut();
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View
            style={{
                paddingTop: insets.top,
                paddingBottom: 12,
                paddingHorizontal: 16,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                borderBottomWidth: 2,
                borderBottomColor: "#1E90FF",
            }}
        >

            <View style={{ flex: 1, alignItems: 'center' }}>
                <Text
                    style={{
                        fontSize: 32,
                        color: "#1E90FF",
                        letterSpacing: 1,
                        fontFamily: "BalsamiqSans_700Bold",
                        marginLeft: 40, // Compensates for right button space
                    }}
                >
                    Talkie
                </Text>
            </View>

            <Pressable onPress={handleSignOutPress}>
                <Ionicons name="log-out-outline" size={24} color="#1E90FF" />
            </Pressable>
        </View>
    );
}