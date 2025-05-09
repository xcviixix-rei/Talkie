import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { getUserCollections, deleteCollection } from '../../../api/collection';
import { useAuth } from '../../../context/authContext';
import { router } from 'expo-router';

export default function Collections() {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            if (user?.id) {
                const data = await getUserCollections(user.id);
                setCollections(data);
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        } finally {
            setLoading(false);
        }
    };

   // In your collections.js file, update the handleCreateCollection function:

   const handleCreateCollection = () => {
     router.push('/createCollection');
   };
    const handleCollectionPress = (collection) => {
        // Navigate to collection detail screen with collection ID
        router.push({
            pathname: '/collection',
            params: { id: collection._id }
        });
    };


    const renderCollectionItem = ({ item }) => (
        <TouchableOpacity
            style={styles.collectionItem}
            onPress={() => handleCollectionPress(item)}
        >
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                    name={getIconName(item.icon)}
                    size={hp(3)}
                    color="#1E90FF"
                />
            </View>
            <View style={styles.collectionDetails}>
                <Text style={styles.collectionName}>{item.name}</Text>
                <Text style={styles.collectionMembers}>
                    {item.conversations?.length || 0} conversations
                </Text>
            </View>

        </TouchableOpacity>
    );

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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Collections</Text>
                <TouchableOpacity style={styles.createButton} onPress={handleCreateCollection}>
                    <Ionicons name="add" size={hp(3)} color="white"/>
                </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#1E90FF"/>
                    </View>
                ) : (
                    <FlatList
                        data={collections}
                        keyExtractor={(item) => item._id || item.id}
                        renderItem={renderCollectionItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons
                                    name="folder-multiple-outline"
                                    size={hp(10)}
                                    color="#cccccc"
                                />
                                <Text style={styles.emptyText}>No collections yet</Text>
                                <TouchableOpacity
                                    style={styles.createCollectionButton}
                                    onPress={handleCreateCollection}
                                >
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