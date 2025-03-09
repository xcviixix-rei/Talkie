import React from 'react';
import { Text, View, StyleSheet, TextInput, Image, FlatList } from 'react-native';

interface User {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    avatar: string;
}

const users: User[] = [
    { id: '1', name: 'User 1', lastMessage: 'Last message from user 1', time: '12:00 PM', avatar: 'https://via.placeholder.com/50' },
    { id: '2', name: 'User 2', lastMessage: 'Last message from user 2', time: '1:00 PM', avatar: 'https://via.placeholder.com/50' },
    { id: '3', name: 'User 3', lastMessage: 'Last message from user 3', time: '2:00 PM', avatar: 'https://via.placeholder.com/50' },
    { id: '4', name: 'User 4', lastMessage: 'Last message from user 4', time: '3:00 PM', avatar: 'https://via.placeholder.com/50' },
    { id: '5', name: 'User 5', lastMessage: 'Last message from user 5', time: '4:00 PM', avatar: 'https://via.placeholder.com/50' },
    { id: '6', name: 'User 6', lastMessage: 'Last message from user 6', time: '5:00 PM', avatar: 'https://via.placeholder.com/50' },
    { id: '7', name: 'User 7', lastMessage: 'Last message from user 7', time: '6:00 PM', avatar: 'https://via.placeholder.com/50' },
    { id: '8', name: 'User 8', lastMessage: 'Last message from user 8', time: '7:00 PM', avatar: 'https://via.placeholder.com/50' },
    { id: '9', name: 'User 9', lastMessage: 'Last message from user 9', time: '8:00 PM', avatar: 'https://via.placeholder.com/50' },
    { id: '10', name: 'User 10', lastMessage: 'Last message from user 10', time: '9:00 PM', avatar: 'https://via.placeholder.com/50' },
    { id: '11', name: 'User 11', lastMessage: 'Last message from user 11', time: '10:00 PM', avatar: 'https://via.placeholder.com/50' },
    { id: '12', name: 'User 11', lastMessage: 'Last message from user 11', time: '10:00 PM', avatar: 'https://via.placeholder.com/50' },
    { id: '13', name: 'User 11', lastMessage: 'Last message from user 11', time: '10:00 PM', avatar: 'https://via.placeholder.com/50' },
];

export default function HomeScreen() {
    const renderItem = ({ item }: { item: User }) => (
        <View style={styles.chatBox}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.chatContent}>
                <Text style={styles.chatText}>{item.name}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <TextInput style={styles.searchBar} placeholder="Search..." />
            <FlatList
                data={users}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
    },
    searchBar: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        marginBottom: 20,
    },
    chatBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    chatContent: {
        flex: 1,
    },
    chatText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
});