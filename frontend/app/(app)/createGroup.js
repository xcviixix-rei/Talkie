import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {router} from 'expo-router';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {searchAll} from '../../api/search'; // Updated import
import {createConversation} from '../../api/conversation';
import {useAuth} from '../../context/authContext';

export default function CreateGroup() {
    const {user: currentUser} = useAuth();
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState('search'); // 'search' or 'selected'

    useEffect(() => {
        const handleSearch = async () => {
            if (searchQuery.trim().length > 0) {
                setIsLoading(true);
                try {
                    const results = await searchAll(searchQuery, currentUser.id, "user"); // Updated API call
                    // Filter out current user and already selected users
                    const filteredUsers = results.filter(
                        user =>
                            user.id !== currentUser.id &&
                            !selectedUsers.some(selected => selected.id === user.id)
                    );
                    setSearchResults(filteredUsers);
                } catch (error) {
                    console.error('Error searching users:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSearchResults([]);
            }
        };

        // Debounce search
        const timer = setTimeout(handleSearch, 700);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedUsers, currentUser]);

    const handleSelectUser = (user) => {
        setSelectedUsers([...selectedUsers, user]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveUser = (userId) => {
        setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
    };

    const handleCreateGroup = async () => {
        if (groupName.trim() === '') {
            alert('Please enter a group name');
            return;
        }

        if (selectedUsers.length === 0) {
            alert('Please select at least one user');
            return;
        }

        setIsCreating(true);

        try {
            // Add current user to participants
            const participants = [
                {
                    alias: currentUser.alias || "",
                    role: "Admin",
                    user_id: currentUser.id
                },
                ...selectedUsers.map(user => ({
                    alias: "",
                    role: "",
                    user_id: user.id
                }))
            ];

            await createConversation(groupName, "group", participants);

            router.replace('/home');
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };


    const renderGroupNameInput = () => (
        <View style={styles.inputSection}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
                style={styles.input}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Enter group name..."
                placeholderTextColor="#999"
            />
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'search' && styles.activeTab]}
                onPress={() => setActiveTab('search')}
            >
                <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
                    Add Members
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'selected' && styles.activeTab]}
                onPress={() => setActiveTab('selected')}
            >
                <Text style={[styles.tabText, activeTab === 'selected' && styles.activeTabText]}>
                    Selected ({selectedUsers.length})
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderSearchContent = () => (
        <View style={styles.tabContent}>
            <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon}/>
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search users..."
                    placeholderTextColor="#999"
                />
            </View>

            {isLoading ? (
                <ActivityIndicator size="small" color="#1E90FF" style={styles.loader}/>
            ) : (
                <FlatList
                    data={searchResults}
                    renderItem={({item}) => (
                        <TouchableOpacity
                            style={styles.userItem}
                            onPress={() => handleSelectUser(item)}
                        >
                            <Image
                                source={item.profile_pic ? {uri: item.profile_pic} : require('../../assets/images/conech.jpg')}
                                style={styles.userImage}
                            />
                            <Text style={styles.userName}>{item.username}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    style={styles.searchResults}
                    ListEmptyComponent={
                        searchQuery.trim().length > 0 ? (
                            <Text style={styles.noResultsText}>No users found</Text>
                        ) : null
                    }
                />
            )}
        </View>
    );

    const renderSelectedContent = () => (
        <View style={styles.tabContent}>
            {selectedUsers.length > 0 ? (
                <FlatList
                    data={selectedUsers}
                    renderItem={({item}) => (
                        <View style={styles.selectedUserItemList}>
                            <Image
                                source={item.profile_pic ? {uri: item.profile_pic} : require('../../assets/images/conech.jpg')}
                                style={styles.userImage}
                            />
                            <Text style={styles.userName}>{item.username}</Text>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => handleRemoveUser(item.id)}
                            >
                                <Ionicons name="close-circle" size={24} color="#FF3B30"/>
                            </TouchableOpacity>
                        </View>
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.selectedUsersList}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.noUsersText}>No users selected</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {renderGroupNameInput()}
            {renderTabs()}

            {activeTab === 'search' ? renderSearchContent() : renderSelectedContent()}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.createButton,
                        (groupName.trim() === '' || selectedUsers.length === 0) && styles.createButtonDisabled
                    ]}
                    onPress={handleCreateGroup}
                    disabled={groupName.trim() === '' || selectedUsers.length === 0 || isCreating}
                >
                    {isCreating ? (
                        <ActivityIndicator size="small" color="white"/>
                    ) : (
                        <Text style={styles.createButtonText}>Create Group</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
        backgroundColor: 'white',
    },
    backButton: {
        padding: 6,
    },
    headerTitle: {
        fontSize: hp(2.2),
        fontWeight: 'bold',
        color: '#333',
    },
    placeholder: {
        width: 36,
    },
    inputSection: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    label: {
        fontSize: hp(2),
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: hp(2),
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#1E90FF',
    },
    tabText: {
        fontSize: hp(1.8),
        fontWeight: '500',
        color: '#666',
    },
    activeTabText: {
        color: '#1E90FF',
        fontWeight: '600',
    },
    tabContent: {
        flex: 1,
        padding: 16,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        padding: 12,
        fontSize: hp(2),
    },
    searchResults: {
        flex: 1,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedUserItemList: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: 'white',
    },
    userImage: {
        width: hp(5),
        height: hp(5),
        borderRadius: 25,
        marginRight: 10,
    },
    userName: {
        flex: 1,
        fontSize: hp(2),
        color: '#333',
    },
    removeButton: {
        padding: 5,
    },
    selectedUsersList: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    selectedUserItem: {
        alignItems: 'center',
        marginRight: 15,
        width: hp(10),
    },
    selectedUserImage: {
        width: hp(6),
        height: hp(6),
        borderRadius: hp(3),
        marginBottom: 5,
    },
    selectedUserName: {
        fontSize: hp(1.5),
        textAlign: 'center',
        marginBottom: 3,
        width: hp(10),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 20,
    },
    noUsersText: {
        color: '#999',
        fontSize: hp(1.8),
        textAlign: 'center',
        paddingVertical: 10,
    },
    noResultsText: {
        color: '#999',
        fontSize: hp(1.8),
        textAlign: 'center',
        paddingVertical: 15,
    },
    buttonContainer: {
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5',
    },
    createButton: {
        backgroundColor: '#1E90FF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonDisabled: {
        backgroundColor: '#A9CCF5',
    },
    createButtonText: {
        color: 'white',
        fontSize: hp(2.2),
        fontWeight: '600',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});
