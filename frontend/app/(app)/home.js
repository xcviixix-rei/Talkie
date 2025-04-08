// In frontend/app/(app)/home.js
import {useEffect, useState} from "react";
import {ActivityIndicator, StatusBar, StyleSheet, View} from "react-native";
import {useRouter} from "expo-router";
import {useAuth} from "../../context/authContext";
import ConversationList from "../../components/ConversationList";
import HomeHeader from "../../components/HomeHeader";
import {fetchUserConversations} from "../../api/conversations";

export default function Home() {
    const router = useRouter();
    const {user} = useAuth();
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        const loadConversations = async () => {
            if (!user?.uid) return;

            try {
                setLoading(true);
                const userConversations = await fetchUserConversations(user.uid);

                const processedConversations = userConversations.map(conv => {
                    // Find the other participant (not the current user)
                    const otherParticipantId = conv.participants.find(id => id !== user.uid);


                    return {
                        conversationId: conv.id,
                        username: conv.last_message?.sender || "Unknown",
                        userId: otherParticipantId,
                        lastMessage: {
                            text: conv.last_message?.text || "",
                            timestamp: conv.last_message?.timestamp || conv.created_at
                        },
                        updatedAt: conv.last_message?.timestamp || conv.created_at
                    };
                });

                setConversations(processedConversations);
            } catch (error) {
                console.error("Failed to load conversations:", error);
            } finally {
                setLoading(false);
            }
        };

        loadConversations();
    }, [user]);

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
                    <ConversationList users={conversations} currentUser={user}/>
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