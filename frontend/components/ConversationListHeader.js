import {useSafeAreaInsets} from "react-native-safe-area-context";
import {BalsamiqSans_700Bold, useFonts} from "@expo-google-fonts/balsamiq-sans";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useAuth} from "../context/authContext";
import {Ionicons} from "@expo/vector-icons";
import {useEffect, useState} from "react";
import {router, usePathname} from "expo-router";

export default function ConversationListHeader() {
    const insets = useSafeAreaInsets();
    const [fontsLoaded] = useFonts({BalsamiqSans_700Bold});
    const {handleSignOut, user} = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const pathname = usePathname();

    // Close dropdown when navigating away
    useEffect(() => {
        setShowDropdown(false);
    }, [pathname]);

    const handleSignOutPress = async () => {
        try {
            setShowDropdown(false);
            await handleSignOut();
            router.replace("/signIn");
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    };

    const navigateToProfile = () => {
        setShowDropdown(false);
        router.push("/profile");
    };

    if (!fontsLoaded) {
        return null;
    }

    const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

    return (
        <View style={[styles.headerContainer, {paddingTop: insets.top}]}>
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>
                    Talkie
                </Text>
            </View>

            <TouchableOpacity
                onPress={() => setShowDropdown(!showDropdown)}
                style={styles.avatarContainer}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel="User menu"
                accessibilityRole="button"
            >
                {user?.profile_pic ? (
                    <Image
                        source={{uri: user.profile_pic}}
                        style={styles.avatar}
                        defaultSource={require('../assets/images/conech.jpg')}
                    />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>
                            {userInitial}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            {showDropdown && (
                <>
                    <TouchableOpacity
                        style={[styles.dropdownOverlay, {top: insets.top + 60}]}
                        activeOpacity={1}
                        onPress={() => setShowDropdown(false)}
                    />

                    <View style={[styles.dropdownMenu, {top: insets.top + 60}]}>
                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={navigateToProfile}
                            accessible={true}
                            accessibilityLabel="Your Profile"
                            accessibilityRole="button"
                        >
                            <Ionicons name="person-outline" size={20} color="#333"/>
                            <Text style={styles.dropdownItemText}>Your Profile</Text>
                        </TouchableOpacity>

                        <View style={styles.divider}/>

                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={handleSignOutPress}
                            accessible={true}
                            accessibilityLabel="Log Out"
                            accessibilityRole="button"
                        >
                            <Ionicons name="log-out-outline" size={20} color="#333"/>
                            <Text style={styles.dropdownItemText}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
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
        zIndex: 1,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'flex-start',
        paddingLeft: 6,
    },
    titleText: {
        fontSize: 32,
        color: "#1E90FF",
        letterSpacing: 1,
        fontFamily: "BalsamiqSans_700Bold",
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    avatarPlaceholder: {
        backgroundColor: '#1E90FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    dropdownOverlay: {
        position: 'absolute',
        top: insets => insets.top + 60,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
        zIndex: 1,
    },
    dropdownMenu: {
        position: 'absolute',
        right: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        paddingVertical: 8,
        width: 200,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 2,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    dropdownItemText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e5e5',
        marginVertical: 4,
    },
});