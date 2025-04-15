import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {router} from 'expo-router';
import {useAuth} from '../../context/authContext';
import {fetchQuery} from "../../api/search";
import {createConversation} from "../../api/conversation";
import {Alert} from "react-native";
import Loading from '../../components/Loading';

export default function Search() {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const {user} = useAuth();

    // In your search.js useEffect
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setResults([]);
            return;
        }

        setLoading(true);

        // Set up debounce timer
        const timer = setTimeout(() => {
            const searchUsers = async () => {
                try {
                    // Get user matches with conversations
                    if (searchQuery.trim() === '') {
                        setResults([]);
                        setLoading(false);
                        return;
                    }
                    const matchingUsers = await fetchQuery(searchQuery, user.id);

                    // Format results
                    const userResults = matchingUsers.map(u => ({
                        username: u.username,
                        profile_pic: u.profile_pic,
                        userId: u.id,
                        conversation: u.conversation,
                        type: 'user'
                    }));

                    setResults(userResults);
                } catch (error) {
                    console.error("Error searching users:", error);
                } finally {
                    setLoading(false);
                }
            };

            searchUsers();
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchQuery, user]);

    const handleUserSelect = async (item) => {
        try {
            if (item.conversation) {
                // Navigate to existing conversation
                router.push({
                    pathname: '/conversation',
                    params: {id: item.conversation.id}
                });
            } else {
                // Show loading indicator
                setLoading(true);

                // Create new conversation
                const participants = [user.id, item.userId];
                const newConversation = await createConversation(participants);

                // Navigate to the conversation screen
                router.push({
                    pathname: '/conversation',
                    params: {id: newConversation.id}
                });
            }
        } catch (error) {
            console.error("Error handling user selection:", error);
            Alert.alert("Error", "Could not open conversation. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({item}) => {
        if (item.type === 'user') {
            return (
                <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => handleUserSelect(item)}
                >
                    <Image
                        source={{uri: item.profile_pic}}
                        style={styles.avatar}
                    />
                    <View style={styles.resultDetails}>
                        <Text style={styles.resultName}>{item.username}</Text>
                        <Text style={styles.resultType}>User</Text>
                    </View>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => handleConversationSelect(item)}
                >
                    <View style={styles.conversationAvatar}>
                        <Ionicons name="chatbubble-outline" size={24} color="#1E90FF"/>
                    </View>
                    <View style={styles.resultDetails}>
                        <Text style={styles.resultName}>{item.name}</Text>
                        <Text style={styles.resultType}>Conversation</Text>
                        <Text numberOfLines={1} style={styles.lastMessage}>
                            {item.lastMessage}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon}/>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users and conversations..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                        clearButtonMode="while-editing"
                    />
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Loading size={100} />
                    </View>
                ) : results.length > 0 ? (
                    <FlatList
                        data={results}
                        renderItem={renderItem}
                        keyExtractor={(item) =>
                            item.type === 'user' ? `user-${item.userId}` : `conversation-${item.id}`
                        }
                        contentContainerStyle={styles.resultsList}
                    />
                ) : searchQuery.trim() !== '' ? (
                    <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
                    </View>
                ) : null}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        margin: 16,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 46,
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultsList: {
        paddingHorizontal: 16,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    conversationAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e6f2ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultDetails: {
        marginLeft: 12,
        flex: 1,
    },
    resultName: {
        fontSize: 16,
        fontWeight: '600',
    },
    resultType: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    lastMessage: {
        fontSize: 14,
        color: '#777',
        marginTop: 2,
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    noResultsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});