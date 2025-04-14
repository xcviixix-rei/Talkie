import {useSafeAreaInsets} from "react-native-safe-area-context";
import {BalsamiqSans_700Bold, useFonts} from "@expo-google-fonts/balsamiq-sans";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";

export default function HomeHeader() {
    const insets = useSafeAreaInsets();
    const [fontsLoaded] = useFonts({BalsamiqSans_700Bold});

    const navigateToMenu = () => {
        router.push("/menu");
    };

    const navigateToSearch = () => {
        router.push("/search");
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={[styles.headerContainer, {paddingTop: insets.top}]}>
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>
                    Talkie
                </Text>
            </View>

            <View style={styles.iconsContainer}>
                <TouchableOpacity
                    onPress={navigateToSearch}
                    style={styles.iconButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="search-outline" size={28} color="#1E90FF"/>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={navigateToMenu}
                    style={styles.iconButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="menu-outline" size={32} color="#1E90FF"/>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
        backgroundColor: "#fff",
    },
    titleContainer: {
        flex: 1,
        alignItems: 'left',
        paddingLeft: 6,
    },
    titleText: {
        fontSize: 32,
        color: "#1E90FF",
        letterSpacing: 1,
        fontFamily: "BalsamiqSans_700Bold",
    },
    iconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        paddingTop: 6,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
});