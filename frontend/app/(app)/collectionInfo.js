import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
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
import {router, useLocalSearchParams} from 'expo-router';
import {deleteCollection, getCollection, updateCollection} from '../../api/collection';
import {useAuth} from '../../context/authContext';
import {searchConversations} from '../../api/search';

export default function CollectionInfo() {
    const {id} = useLocalSearchParams();
    const {user} = useAuth();
    const [collection, setCollection] = useState(null);
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('folder-outline');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showIconOptions, setShowIconOptions] = useState(false);

    // Icons array in 2x3 format
    const icons = [
        {name: 'folder', icon: 'folder-outline', label: 'Default'},
        {name: 'work', icon: 'briefcase-outline', label: 'Work'},
        {name: 'personal', icon: 'account-outline', label: 'Personal'},
        {name: 'team', icon: 'account-multiple', label: 'Team'},
        {name: 'study', icon: 'book-outline', label: 'Study'},
        {name: 'favorite', icon: 'star-outline', label: 'Favorite'}
    ];

    useEffect(() => {
        if (!id) {
            router.back();
            return;
        }

        fetchCollectionDetails();
    }, [id]);

    useEffect(() => {
        if (searchQuery.trim()) {
            handleSearch();
        }
    }, [searchQuery]);

    const fetchCollectionDetails = async () => {
        try {
            setLoading(true);
            const collectionData = await getCollection(id);
            setCollection(collectionData);
            setName(collectionData.name || '');
            setSelectedIcon(collectionData.icon || 'folder');
        } catch (error) {
            console.error('Error fetching collection details:', error);
            Alert.alert('Error', 'Failed to load collection details');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            setSearching(true);
            const results = await searchConversations(searchQuery, user.id);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching conversations:', error);
            Alert.alert('Error', 'Failed to search conversations');
        } finally {
            setSearching(false);
        }
    };

    const saveChanges = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Collection name cannot be empty');
            return;
        }

        try {
            setSaving(true);
            await updateCollection(id, {
                name: name.trim(),
                icon: selectedIcon,
            });
            Alert.alert('Success', 'Collection updated successfully', [
                {text: 'OK', onPress: () => router.back()}
            ]);
        } catch (error) {
            console.error('Error updating collection:', error);
            Alert.alert('Error', 'Failed to update collection');
        } finally {
            setSaving(false);
        }
    };

    const isConversationInCollection = (conversationId) => {
        return collection?.conversations?.includes(conversationId);
    };

    const handleToggleConversation = async (conversationId) => {
        try {
            const updatedConversations = isConversationInCollection(conversationId)
                ? collection.conversations.filter(id => id !== conversationId)
                : [...(collection.conversations || []), conversationId];

            await updateCollection(id, {
                conversations: updatedConversations
            });

            setCollection({
                ...collection,
                conversations: updatedConversations
            });
        } catch (error) {
            console.error('Error updating collection conversations:', error);
            Alert.alert('Error', 'Failed to update conversations in collection');
        }
    };

    const confirmDelete = () => {
        Alert.alert(
            'Delete Collection',
            'Are you sure you want to delete this collection? This action cannot be undone.',
            [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Delete', style: 'destructive', onPress: handleDelete}
            ]
        );
    };

    const handleDelete = async () => {
        try {
            setSaving(true);
            await deleteCollection(id);
            router.replace('/collections');
        } catch (error) {
            console.error('Error deleting collection:', error);
            Alert.alert('Error', 'Failed to delete collection');
            setSaving(false);
        }
    };

    const renderConversationItem = ({item}) => {
        const isGroup = item.type === "group";

        // For direct messages, get the otherUser's info
        const displayName = isGroup
            ? item.name
            : (item.otherParticipant?.username || "User");

        const lastMessage = item.last_message
            ? (item.last_message.text
                ? item.last_message.text
                : (item.last_message.attachments && item.last_message.attachments.length > 0
                    ? "Sent an attachment"
                    : "No messages yet"))
            : "No messages yet";

        // Display image handling
        let displayImage;
        if (isGroup) {
            displayImage = item.conver_pic || null;
        } else {
            displayImage = item.otherParticipant?.profile_pic || null;
        }

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => handleToggleConversation(item.id)}
            >
                <View style={styles.conversationIconContainer}>
                    {displayImage ? (
                        <Image
                            source={{uri: displayImage}}
                            style={styles.conversationImage}
                        />
                    ) : (
                        <MaterialCommunityIcons
                            name={isGroup ? "account-group" : "account"}
                            size={hp(3)}
                            color="#1E90FF"
                        />
                    )}
                </View>

                <View style={styles.conversationContent}>
                    <Text style={styles.conversationTitle} numberOfLines={1}>
                        {displayName}
                    </Text>
                    <Text style={styles.conversationPreview} numberOfLines={1}>
                        {lastMessage}
                    </Text>
                </View>

                <Ionicons
                    name={isConversationInCollection(item.id) ? "checkmark-circle" : "add-circle-outline"}
                    size={hp(3)}
                    color={isConversationInCollection(item.id) ? "#1E90FF" : "#999"}
                />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E90FF"/>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={hp(3)} color="#1E90FF"/>
                </TouchableOpacity>
                <Text style={styles.title}>Edit Collection</Text>
                <TouchableOpacity onPress={saveChanges} disabled={saving} style={styles.saveButton}>
                    {saving ? (
                        <ActivityIndicator size="small" color="#1E90FF"/>
                    ) : (
                        <Text style={styles.saveText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Collection Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter collection name"
                    />
                </View>

                <View style={styles.formGroup}>
                    <TouchableOpacity
                        style={styles.sectionHeader}
                        onPress={() => setShowIconOptions(!showIconOptions)}
                    >
                        <Text style={styles.label}>Icon</Text>
                        <Ionicons
                            name={showIconOptions ? "chevron-up" : "chevron-down"}
                            size={hp(2.5)}
                            color="#666"
                        />
                    </TouchableOpacity>

                    {selectedIcon && (
                        <View style={styles.selectedIconPreview}>
                            <MaterialCommunityIcons
                                name={icons.find(icon => icon.name === selectedIcon)?.icon || 'folder-outline'}
                                size={hp(3.5)}
                                color="#1E90FF"
                            />
                            <Text style={styles.selectedIconName}>
                                {icons.find(icon => icon.name === selectedIcon)?.label || 'Default'}
                            </Text>
                        </View>
                    )}

           
                    {showIconOptions && (
                        <View style={styles.iconsGrid}>
                            {icons.map((iconObj) => (
                                <TouchableOpacity
                                    key={iconObj.name}
                                    style={[
                                        styles.iconOption,
                                        selectedIcon === iconObj.name && styles.selectedIconOption
                                    ]}
                                    onPress={() => setSelectedIcon(iconObj.name)}
                                >
                                    <MaterialCommunityIcons
                                        name={iconObj.icon}
                                        size={hp(3.5)}
                                        color={selectedIcon === iconObj.name ? 'white' : '#444'}
                                    />
                                    <Text
                                        style={[
                                            styles.iconLabel,
                                            selectedIcon === iconObj.name && styles.selectedIconLabel
                                        ]}
                                    >
                                        {iconObj.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Search Conversations</Text>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={hp(2.5)} color="#999" style={styles.searchIcon}/>
                        <TextInput
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search conversations"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

                <View style={styles.searchResultsContainer}>
                    {searching ? (
                        <ActivityIndicator style={styles.searchingIndicator} size="large" color="#1E90FF"/>
                    ) : searchResults.length > 0 ? (
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.id}
                            renderItem={renderConversationItem}
                            scrollEnabled={false}
                            nestedScrollEnabled={true}
                            ListHeaderComponent={
                                <Text style={styles.resultsHeader}>
                                    {collection?.conversations?.length || 0} conversations in collection
                                </Text>
                            }
                        />
                    ) : searchQuery.trim() ? (
                        <View style={styles.emptyResults}>
                            <Text style={styles.emptyResultsText}>No conversations found</Text>
                        </View>
                    ) : null}
                </View>

                <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
                    <MaterialCommunityIcons name="delete-outline" size={hp(2.5)} color="white"/>
                    <Text style={styles.deleteText}>Delete Collection</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    saveButton: {
        padding: hp(1),
        minWidth: wp(15),
        alignItems: 'center',
    },
    saveText: {
        color: '#1E90FF',
        fontSize: hp(2),
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: wp(5),
    },
    formGroup: {
        marginBottom: hp(3),
    },
    label: {
        fontSize: hp(2),
        fontWeight: '600',
        marginBottom: hp(1),
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
        marginTop: hp(1),
    },
    iconOption: {
        width: wp(28),
        height: hp(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(2),
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: wp(3),
    },
    searchIcon: {
        marginRight: wp(2),
    },
    searchInput: {
        flex: 1,
        paddingVertical: hp(1.5),
        fontSize: hp(2),
    },
    searchResultsContainer: {
        marginBottom: hp(3),
    },
    searchingIndicator: {
        marginVertical: hp(3),
    },
    resultsHeader: {
        fontSize: hp(1.8),
        color: '#666',
        marginBottom: hp(2),
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    conversationIconContainer: {
        width: hp(5),
        height: hp(5),
        borderRadius: hp(2.5),
        backgroundColor: '#e6f2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
    },
    conversationContent: {
        flex: 1,
    },
    conversationTitle: {
        fontSize: hp(1.8),
        fontWeight: '500',
    },
    conversationPreview: {
        fontSize: hp(1.5),
        color: '#777',
    },
    emptyResults: {
        alignItems: 'center',
        padding: hp(3),
    },
    emptyResultsText: {
        fontSize: hp(1.8),
        color: '#999',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ff4d4d',
        padding: hp(1.5),
        borderRadius: 8,
        marginTop: hp(2),
        marginBottom: hp(5),
    },
    deleteText: {
        color: 'white',
        fontSize: hp(2),
        fontWeight: '600',
        marginLeft: wp(2),
    },
    conversationImage: {
        width: hp(5),
        height: hp(5),
        borderRadius: hp(2.5),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(1.5),
    },
    selectedIconPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: hp(1.5),
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginBottom: hp(1.5),
    },
    selectedIconName: {
        fontSize: hp(1.8),
        marginLeft: wp(2),
        color: '#333',
    },
});