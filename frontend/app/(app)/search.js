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

export default function Search() {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const {user} = useAuth();

    // These would be replaced with actual API calls
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

    const mockConversations = [
        {
            id: '101',
            name: 'Project Discussion',
            participants: ['1', '2'],
            lastMessage: 'Let\'s discuss the new features'
        },
        {
            id: '102',
            name: 'Weekend Plans',
            participants: ['1', '3'],
            lastMessage: 'Are you free this weekend?'
        }
    ];

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setResults([]);
            return;
        }

        setLoading(true);

        // Search logic (simulated API call)
        setTimeout(() => {
            // Filter users
            const matchingUsers = mockUsers.filter(u =>
                u.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
                u.userId !== user.userId
            ).map(u => ({
                ...u,
                type: 'user'
            }));

            // Filter conversations
            const matchingConversations = mockConversations.filter(c =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                c.participants.includes(user.userId)
            ).map(c => ({
                ...c,
                type: 'conversation'
            }));

            // Sort results - users first, then conversations
            const results = [...matchingUsers, ...matchingConversations];
            setResults(results);
            setLoading(false);
        }, 500);
    }, [searchQuery]);

    const handleUserSelect = (userId) => {
        // Check if conversation exists with this user
        const existingConversation = mockConversations.find(c =>
            c.participants.includes(userId) &&
            c.participants.includes(user.userId)
        );

        if (existingConversation) {
            // Navigate to existing conversation
            router.replace({
                pathname: '/conversation',
                params: {id: existingConversation.id}
            });
        } else {
            // Create new conversation and navigate to it
            // In a real app, you would create the conversation via API
            const newConversationId = 'new-' + Date.now();
            router.replace({
                pathname: '/conversation',
                params: {
                    id: newConversationId,
                    userId: userId,
                    isNew: true
                }
            });
        }
    };

    const handleConversationSelect = (conversationId) => {
        router.replace({
            pathname: '/conversation',
            params: {id: conversationId}
        });
    };

    const renderItem = ({item}) => {
        if (item.type === 'user') {
            return (
                <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => handleUserSelect(item.userId)}
                >
                    <Image
                        source={item.profileUrl}
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
                    onPress={() => handleConversationSelect(item.id)}
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
                        <ActivityIndicator size="large" color="#1E90FF"/>
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