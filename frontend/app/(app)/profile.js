import {Image, ScrollView, StyleSheet, Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useAuth} from "../../context/authContext";

export default function ProfileScreen() {
    const {user} = useAuth();

    return (
        <>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    {user?.profile_pic ? (
                        <Image
                            source={{uri: user?.profile_pic}}
                            style={styles.profileImage}
                        />
                    ) : (
                        <View style={[styles.profileImage, styles.profilePlaceholder]}>
                            <Text style={styles.profilePlaceholderText}>
                                {user?.username?.charAt(0) || 'U'}
                            </Text>
                        </View>
                    )}
                    <Text style={styles.name}>{user?.username || "User"}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.sectionItem}>
                        <Ionicons name="mail-outline" size={24} color="#666"/>
                        <Text style={styles.sectionItemText}>Email: {user?.email}</Text>
                    </View>
                    {user?.metadata?.creationTime && (
                        <View style={styles.sectionItem}>
                            <Ionicons name="calendar-outline" size={24} color="#666"/>
                            <Text
                                style={styles.sectionItemText}>Joined: {new Date(user.metadata.creationTime).toLocaleDateString()}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.sectionItem}>
                        <Ionicons name="notifications-outline" size={24} color="#666"/>
                        <Text style={styles.sectionItemText}>Notifications</Text>
                    </View>
                    <View style={styles.sectionItem}>
                        <Ionicons name="lock-closed-outline" size={24} color="#666"/>
                        <Text style={styles.sectionItemText}>Privacy</Text>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
    },
    profilePlaceholder: {
        backgroundColor: '#1E90FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profilePlaceholderText: {
        color: 'white',
        fontSize: 48,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#666',
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
    sectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    sectionItemText: {
        fontSize: 16,
        marginLeft: 16,
        color: '#333',
    },
});