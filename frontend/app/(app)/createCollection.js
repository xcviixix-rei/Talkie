import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {router} from 'expo-router';
import {createCollection} from '../../api/collection';
import {searchConversations} from '../../api/search';
import {useAuth} from '../../context/authContext';

export default function CreateCollection() {
    const {user} = useAuth();
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('folder');
    const [searchQuery, setSearchQuery] = useState('');
    const [conversations, setConversations] = useState([]);
    const [selectedConversations, setSelectedConversations] = useState([]);
    const [searching, setSearching] = useState(false);
    const [creating, setCreating] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [showIconSelector, setShowIconSelector] = useState(false);

    const icons = [
        {name: 'folder', icon: 'folder-outline', label: 'Default'},
        {name: 'work', icon: 'briefcase-outline', label: 'Work'},
        {name: 'personal', icon: 'account-outline', label: 'Personal'},
        {name: 'team', icon: 'account-multiple', label: 'Team'},
        {name: 'study', icon: 'book-outline', label: 'Study'},
        {name: 'favorite', icon: 'star-outline', label: 'Favorite'}
    ];

    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (searchQuery.trim()) {
            const timeout = setTimeout(() => {
                searchForConversations();
            }, 500);
            setSearchTimeout(timeout);
        } else {
            setConversations([]);
        }

        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchQuery]);

    const searchForConversations = async () => {
        try {
            setSearching(true);
            const results = await searchConversations(searchQuery, user.id);
            setConversations(results);
        } catch (error) {
            console.error('Error searching conversations:', error);
            Alert.alert('Error', 'Failed to search conversations');
        } finally {
            setSearching(false);
        }
    };

    const toggleConversationSelection = (conversation) => {
        const conversationId = conversation._id || conversation.id;
        if (isConversationSelected(conversationId)) {
            setSelectedConversations(
                selectedConversations.filter(id => id !== conversationId)
            );
        } else {
            setSelectedConversations([...selectedConversations, conversationId]);
        }
    };

    const isConversationSelected = (id) => {
        return selectedConversations.includes(id);
    };

    const handleCreateCollection = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a collection name');
            return;
        }

        if (!user?.id) {
            Alert.alert('Error', 'You must be logged in to create a collection');
            return;
        }

        try {
            setCreating(true);
            const newCollection = {
                user_id: user.id,
                name: name.trim(),
                icon: selectedIcon,
                conversations: selectedConversations,
                created_at: new Date().toISOString()
            };

            await createCollection(newCollection);
            Alert.alert('Success', 'Collection created successfully', [
                {text: 'OK', onPress: () => router.replace('/collections')}
            ]);
        } catch (error) {
            console.error('Error creating collection:', error);
            Alert.alert('Error', 'Failed to create collection');
        } finally {
            setCreating(false);
        }
    };

    const getIconName = (iconType) => {
        switch (iconType) {
            case 'work':
                return 'briefcase-outline';
            case 'personal':
                return 'account-outline'
            case 'team':
                return 'account-multiple';
            case 'study':
                return 'book-outline';
            case 'favorite':
                return 'star-outline';
            default:
                return 'folder-outline';
        }
    };

    const renderConversationItem = ({item}) => {
        const isGroup = item.type === "group";
        const displayName = isGroup ? item.name : (item.otherParticipant?.username || "User");
        const avatar = isGroup ? item.conver_pic : (item.otherParticipant?.profile_pic);
        const lastMessage = item.last_message?.text || "No messages yet";

        return (
            <TouchableOpacity
                style={[
                    styles.conversationItem,
                    isConversationSelected(item.id) && styles.selectedConversationItem
                ]}
                onPress={() => toggleConversationSelection(item)}
            >
                {/* Avatar/Icon */}
                {avatar ? (
                    <Image
                        source={{uri: avatar}}
                        style={[
                            styles.avatarImage,
                            isConversationSelected(item.id) && {borderColor: 'white'}
                        ]}
                    />
                ) : (
                    <View style={[
                        styles.conversationIcon,
                        isConversationSelected(item.id) && {backgroundColor: '#1E90FF30'}
                    ]}>
                        <MaterialCommunityIcons
                            name={isGroup ? "account-group" : "account"}
                            size={hp(2.5)}
                            color={isConversationSelected(item.id) ? 'white' : '#1E90FF'}
                        />
                    </View>
                )}

                {/* Conversation Info */}
                <View style={styles.conversationInfo}>
                    <Text
                        style={[
                            styles.conversationName,
                            isConversationSelected(item.id) && styles.selectedText
                        ]}
                        numberOfLines={1}
                    >
                        {displayName}
                    </Text>
                    <Text
                        style={[
                            styles.conversationPreview,
                            isConversationSelected(item.id) && styles.selectedText
                        ]}
                        numberOfLines={1}
                    >
                        {lastMessage}
                    </Text>
                </View>

                {/* Selection indicator */}
                <Ionicons
                    name={isConversationSelected(item.id) ? "checkmark-circle" : "add-circle-outline"}
                    size={hp(2.5)}
                    color={isConversationSelected(item.id) ? "white" : "#1E90FF"}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={hp(3)} color="#1E90FF"/>
                </TouchableOpacity>
                <Text style={styles.title}>Create Collection</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateCollection}
                    disabled={creating || !name.trim()}
                >
                    {creating ? (
                        <ActivityIndicator size="small" color="#1E90FF"/>
                    ) : (
                        <Text style={[
                            styles.createText,
                            (!name.trim()) && styles.disabledText
                        ]}>
                            Create
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Collection Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter collection name"
                        maxLength={50}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.iconSelectorHeader}>
                        <Text style={styles.label}>Select Icon</Text>
                        <TouchableOpacity
                            onPress={() => setShowIconSelector(!showIconSelector)}
                            style={styles.dropdownToggle}
                        >
                            <Text style={styles.dropdownToggleText}>
                                {showIconSelector ? "Hide" : "Show"}
                            </Text>
                            <Ionicons
                                name={showIconSelector ? "chevron-up" : "chevron-down"}
                                size={hp(2)}
                                color="#1E90FF"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.selectedIconDisplay}>
                        <View style={styles.displayIconContainer}>
                            <MaterialCommunityIcons
                                name={getIconName(selectedIcon)}
                                size={hp(3.5)}
                                color="#1E90FF"
                            />
                        </View>
                        <Text style={styles.selectedIconName}>
                            {icons.find(icon => icon.name === selectedIcon)?.label || 'Default'}
                        </Text>
                    </View>

                    {showIconSelector && (
                        <View style={styles.iconsGrid}>
                            {icons.map((icon) => (
                                <TouchableOpacity
                                    key={icon.name}
                                    style={[
                                        styles.iconOption,
                                        selectedIcon === icon.name && styles.selectedIconOption
                                    ]}
                                    onPress={() => {
                                        setSelectedIcon(icon.name);
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={icon.icon}
                                        size={hp(3)}
                                        color={selectedIcon === icon.name ? 'white' : '#1E90FF'}
                                    />
                                    <Text
                                        style={[
                                            styles.iconLabel,
                                            selectedIcon === icon.name && styles.selectedIconLabel
                                        ]}
                                    >
                                        {icon.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.conversationsSection}>
                    <Text style={styles.label}>
                        Add Conversations ({selectedConversations.length} selected)
                    </Text>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={hp(2.5)} color="#666" style={styles.searchIcon}/>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search conversations"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#999"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={hp(2.5)} color="#666"/>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.conversationsContainer}>
                        {searching ? (
                            <ActivityIndicator size="large" color="#1E90FF" style={styles.loadingIndicator}/>
                        ) : conversations.length > 0 ? (
                            <ScrollView
                                style={styles.conversationsScrollView}
                                contentContainerStyle={styles.listContainer}
                                nestedScrollEnabled={true}
                            >
                                {conversations.map(item => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.conversationItem,
                                            isConversationSelected(item.id) && styles.selectedConversationItem
                                        ]}
                                        onPress={() => toggleConversationSelection(item)}
                                    >
                                        {/* Avatar/Icon */}
                                        {item.conver_pic || (item.otherParticipant?.profile_pic) ? (
                                            <Image
                                                source={{uri: item.type === "group" ? item.conver_pic : item.otherParticipant?.profile_pic}}
                                                style={[
                                                    styles.avatarImage,
                                                    isConversationSelected(item.id) && {borderColor: 'white'}
                                                ]}
                                            />
                                        ) : (
                                            <View style={[
                                                styles.conversationIcon,
                                                isConversationSelected(item.id) && {backgroundColor: '#1E90FF30'}
                                            ]}>
                                                <MaterialCommunityIcons
                                                    name={item.type === "group" ? "account-group" : "account"}
                                                    size={hp(2.5)}
                                                    color={isConversationSelected(item.id) ? 'white' : '#1E90FF'}
                                                />
                                            </View>
                                        )}

                                        {/* Conversation Info */}
                                        <View style={styles.conversationInfo}>
                                            <Text
                                                style={[
                                                    styles.conversationName,
                                                    isConversationSelected(item.id) && styles.selectedText
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {item.type === "group" ? item.name : (item.otherParticipant?.username || "User")}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.conversationPreview,
                                                    isConversationSelected(item.id) && styles.selectedText
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {item.last_message?.text || "No messages yet"}
                                            </Text>
                                        </View>

                                        {/* Selection indicator */}
                                        <Ionicons
                                            name={isConversationSelected(item.id) ? "checkmark-circle" : "add-circle-outline"}
                                            size={hp(2.5)}
                                            color={isConversationSelected(item.id) ? "white" : "#1E90FF"}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        ) : searchQuery.trim().length > 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="search" size={hp(4)} color="#ccc"/>
                                <Text style={styles.emptyText}>No conversations found</Text>
                            </View>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons name="chat-outline" size={hp(4)} color="#ccc"/>
                                <Text style={styles.emptyText}>Search for conversations to add</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    conversationsScrollView: {
        maxHeight: hp(30),
    },
    listContainer: {
        paddingVertical: hp(1),
        paddingHorizontal: wp(2),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: hp(1),
    },
    title: {
        fontSize: hp(2.5),
        fontWeight: 'bold',
    },
    createButton: {
        paddingHorizontal: wp(3),
        paddingVertical: hp(1),
        minWidth: wp(15),
        alignItems: 'center',
    },
    createText: {
        color: '#1E90FF',
        fontSize: hp(2),
        fontWeight: '600',
    },
    disabledText: {
        color: '#aaaaaa',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: wp(5),
    },
    inputContainer: {
        marginBottom: hp(2.5),
    },
    iconSelectorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(1),
    },
    dropdownToggle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownToggleText: {
        color: '#1E90FF',
        marginRight: wp(1),
        fontSize: hp(1.8),
    },
    selectedIconDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(2),
        paddingHorizontal: wp(2),
        paddingVertical: hp(1),
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
    },
    displayIconContainer: {
        width: hp(6),
        height: hp(6),
        backgroundColor: '#f0f8ff',
        borderRadius: hp(3),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
    },
    selectedIconName: {
        fontSize: hp(2),
        color: '#444',
    },
    label: {
        fontSize: hp(2),
        fontWeight: '600',
        color: '#444',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: hp(1.5),
        fontSize: hp(2),
    },
    iconsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: hp(1),
    },
    iconOption: {
        width: '32%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(1),
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        padding: hp(1),
    },
    selectedIconOption: {
        backgroundColor: '#1E90FF',
    },
    iconLabel: {
        marginTop: hp(1),
        fontSize: hp(1.5),
        color: '#444',
    },
    selectedIconLabel: {
        color: 'white',
    },
    conversationsSection: {
        marginBottom: hp(2),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(3),
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        height: hp(5.5),
        marginTop: hp(1),
        marginBottom: hp(2),
    },
    searchIcon: {
        marginRight: wp(2),
    },
    searchInput: {
        flex: 1,
        height: hp(5.5),
        fontSize: hp(1.8),
        color: '#333',
    },
    conversationsContainer: {
        borderWidth: 1,
        borderColor: '#eeeeee',
        borderRadius: 8,
        maxHeight: hp(40), // Set a maximum height
    },
    flatListContainer: {
        paddingVertical: hp(1),
        paddingHorizontal: wp(2),
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: hp(1.2),
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: hp(1),
    },
    selectedConversationItem: {
        backgroundColor: '#1E90FF',
    },
    conversationIcon: {
        width: hp(4.5),
        height: hp(4.5),
        borderRadius: hp(2.25),
        backgroundColor: '#e6f2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(2),
    },
    avatarImage: {
        width: hp(4.5),
        height: hp(4.5),
        borderRadius: hp(2.25),
        marginRight: wp(2),
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    conversationInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    conversationName: {
        fontSize: hp(1.8),
        fontWeight: '600',
        marginBottom: hp(0.3),
    },
    conversationPreview: {
        fontSize: hp(1.5),
        color: '#666',
    },
    selectedText: {
        color: 'white',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: hp(4),
    },
    emptyText: {
        fontSize: hp(1.8),
        color: '#888',
        marginTop: hp(1.5),
        textAlign: 'center',
        paddingHorizontal: wp(5),
    },
    loadingIndicator: {
        padding: hp(4),
    }
});