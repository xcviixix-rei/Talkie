import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {router} from 'expo-router';
import {useAuth} from '../../context/authContext';

export default function SettingsScreen() {
    const {user} = useAuth();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333"/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView style={styles.contentContainer}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Preferences</Text>

                    <TouchableOpacity
                        style={styles.settingOption}
                        onPress={() => router.push("/notifications-settings")}
                    >
                        <View style={styles.settingIconContainer}>
                            <Ionicons name="notifications-outline" size={24} color="#666"/>
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingLabel}>Notification Settings</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#999"/>
                    </TouchableOpacity>

                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <TouchableOpacity style={styles.settingOption}>
                        <View style={styles.settingIconContainer}>
                            <Ionicons name="information-circle-outline" size={24} color="#666"/>
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingLabel}>App Information</Text>
                            <Text style={styles.settingValue}>Version 1.0.0</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#999"/>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingOption}>
                        <View style={styles.settingIconContainer}>
                            <Ionicons name="document-text-outline" size={24} color="#666"/>
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingLabel}>Terms of Service</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#999"/>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingOption}>
                        <View style={styles.settingIconContainer}>
                            <Ionicons name="shield-checkmark-outline" size={24} color="#666"/>
                        </View>
                        <View style={styles.settingTextContainer}>
                            <Text style={styles.settingLabel}>Privacy Policy</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#999"/>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    contentContainer: {
        flex: 1,
    },
    section: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    settingOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingIconContainer: {
        width: 40,
        alignItems: 'center',
    },
    settingTextContainer: {
        flex: 1,
        marginLeft: 10,
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
    },
    settingValue: {
        fontSize: 14,
        color: '#777',
        marginTop: 2,
    }
});