import ConversationList from "../../components/ConversationList";
import HomeHeader from "../../components/HomeHeader";
import {useEffect, useState} from "react";
import {ActivityIndicator, StatusBar, StyleSheet, View} from "react-native";
import {useRouter} from "expo-router";
import {useAuth} from "../../context/authContext";

export default function Home() {
    const router = useRouter();
    const {user} = useAuth();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                // Mock data loading - replace with your API call
                const mockUsers = [
                    {
                        username: "duc",
                        profileUrl: require("../../assets/images/conech.jpg"),
                        userId: "1",
                    },
                    {
                        username: "phong",
                        profileUrl: require("../../assets/images/phuthuy.jpg"),
                        userId: "2",
                    },
                    {
                        username: "dat",
                        profileUrl: require("../../assets/images/conrong.jpg"),
                        userId: "3",
                    },
                ];

                setUsers(mockUsers);
            } catch (error) {
                console.error("Failed to load users:", error);
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content"/>
            <HomeHeader/>

            <View style={styles.contentContainer}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#1E90FF"/>
                    </View>
                ) : (
                    <ConversationList users={users} currentUser={user}/>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    contentContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});