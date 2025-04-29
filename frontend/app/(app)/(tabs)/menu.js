import React from 'react';
import {SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {useAuth} from "../../../context/authContext";
import {router} from "expo-router";

export default function MenuScreen() {
    const {handleSignOut, user} = useAuth();

    const handleSignOutPress = async () => {
        await handleSignOut();
        router.replace("/signIn");
    };

    const navigateToProfile = () => {
        router.push("/profile");
    };


    return (
        <>
            <SafeAreaView style={styles.container}>

                <View style={styles.menuItems}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={navigateToProfile}
                    >
                        <Ionicons name="person-outline" size={24} color="#333"/>
                        <Text style={styles.menuItemText}>Your Profile</Text>
                        <Ionicons name="chevron-forward" size={24} color="#ccc"/>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="settings-outline" size={24} color="#333"/>
                        <Text style={styles.menuItemText}>Settings</Text>
                        <Ionicons name="chevron-forward" size={24} color="#ccc"/>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="help-circle-outline" size={24} color="#333"/>
                        <Text style={styles.menuItemText}>Help</Text>
                        <Ionicons name="chevron-forward" size={24} color="#ccc"/>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.signOutButton}
                    onPress={handleSignOutPress}
                >
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30"/>
                    <Text style={styles.signOutText}>Log Out</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerSpacer: {
        width: 36, // Match the width of the back button
    },
    profileSection: {
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 16,
    },
    profileImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1E90FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    profileImageText: {
        fontSize: 32,
        color: 'white',
        fontWeight: 'bold',
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    menuItems: {
        paddingTop: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 16,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginTop: 'auto',
        marginBottom: 16,
        marginHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#f8f8f8',
    },
    signOutText: {
        fontSize: 16,
        marginLeft: 16,
        color: '#FF3B30',
    },
});