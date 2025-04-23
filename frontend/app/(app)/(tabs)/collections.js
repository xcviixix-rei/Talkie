import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useAuth } from '../../../context/authContext';

export default function Collections() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);

  // Mock data - replace with your actual API call
  const loadCollections = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        const mockCollections = [
          { id: '1', name: 'Family Chat', type: 'personal', members: 5, lastUpdated: '2023-10-15' },
          { id: '2', name: 'Marketing Team', type: 'work', members: 8, lastUpdated: '2023-10-12' },
          { id: '3', name: 'Book Club', type: 'interest', members: 4, lastUpdated: '2023-10-10' },
          { id: '4', name: 'Travel Planning', type: 'interest', members: 6, lastUpdated: '2023-10-05' },
        ];
        setCollections(mockCollections);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to load collections:", error);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCollections();
    }, [])
  );

  const renderCollectionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.collectionItem}
      onPress={() => console.log(`Collection ${item.id} pressed`)}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={item.type === 'personal' ? 'account-group' : (item.type === 'work' ? 'briefcase-outline' : 'bookmark-outline')}
          size={hp(3)}
          color="#1E90FF"
        />
      </View>
      <View style={styles.collectionDetails}>
        <Text style={styles.collectionName}>{item.name}</Text>
        <Text style={styles.collectionMembers}>{item.members} members</Text>
      </View>
      <Text style={styles.lastUpdated}>Updated {item.lastUpdated}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collections</Text>
        <TouchableOpacity style={styles.createButton}>
          <Ionicons name="add" size={hp(3)} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E90FF" />
          </View>
        ) : (
          <FlatList
            data={collections}
            keyExtractor={(item) => item.id}
            renderItem={renderCollectionItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="folder-multiple-outline" size={hp(10)} color="#cccccc" />
                <Text style={styles.emptyText}>No collections yet</Text>
                <TouchableOpacity style={styles.createCollectionButton}>
                  <Text style={styles.createCollectionText}>Create Collection</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  title: {
    fontSize: hp(3),
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#1E90FF',
    width: hp(5),
    height: hp(5),
    borderRadius: hp(2.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: wp(4),
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: hp(2),
    marginBottom: hp(1.5),
  },
  iconContainer: {
    width: hp(6),
    height: hp(6),
    backgroundColor: '#e6f2ff',
    borderRadius: hp(3),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  collectionDetails: {
    flex: 1,
  },
  collectionName: {
    fontSize: hp(2),
    fontWeight: '600',
    marginBottom: hp(0.5),
  },
  collectionMembers: {
    fontSize: hp(1.6),
    color: '#666',
  },
  lastUpdated: {
    fontSize: hp(1.4),
    color: '#888',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp(10),
  },
  emptyText: {
    fontSize: hp(2),
    color: '#888',
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  createCollectionButton: {
    backgroundColor: '#1E90FF',
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: 8,
  },
  createCollectionText: {
    color: 'white',
    fontSize: hp(1.8),
    fontWeight: '600',
  },
});