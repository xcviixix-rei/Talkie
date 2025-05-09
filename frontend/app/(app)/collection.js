import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useLocalSearchParams, router } from 'expo-router';
import { getCollection, getCollectionConversations } from '../../api/collection';

export default function Collection() {
  const { id } = useLocalSearchParams();
  const [collection, setCollection] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.back();
      return;
    }

    fetchCollectionDetails();
  }, [id]);

  const fetchCollectionDetails = async () => {
    try {
      setLoading(true);
      const collectionData = await getCollection(id);
      setCollection(collectionData);

      const conversationsData = await getCollectionConversations(id);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching collection details:', error);
      Alert.alert('Error', 'Failed to load collection details');
    } finally {
      setLoading(false);
    }
  };

  const navigateToConversation = (conversationId) => {
    router.push({
      pathname: '/conversation',
      params: { id: conversationId }
    });
  };

  const navigateToEditCollection = () => {
    router.push({
      pathname: '/collectionInfo',
      params: { id: collection._id }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'unknown date';

    const date = new Date(dateString);
    if (isNaN(date)) return 'invalid date';

    return date.toLocaleDateString();
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigateToConversation(item._id)}
    >
      <MaterialCommunityIcons
        name="chat-outline"
        size={hp(3)}
        color="#1E90FF"
        style={styles.conversationIcon}
      />
      <View style={styles.conversationContent}>
        <Text style={styles.conversationTitle}>{item.title || 'Untitled Conversation'}</Text>
        <Text style={styles.conversationDate}>{formatDate(item.created_at)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={hp(2.5)} color="#999" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={hp(3)} color="#1E90FF" />
        </TouchableOpacity>
        <Text style={styles.title}>{collection?.name || 'Collection'}</Text>
        <TouchableOpacity onPress={navigateToEditCollection} style={styles.editButton}>
          <Ionicons name="settings-outline" size={hp(3)} color="#1E90FF" />
        </TouchableOpacity>
      </View>

      <View style={styles.collectionInfo}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={getIconName(collection?.icon)}
            size={hp(5)}
            color="#1E90FF"
          />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.collectionName}>{collection?.name}</Text>
          <Text style={styles.collectionDate}>Created: {formatDate(collection?.created_at)}</Text>
          <Text style={styles.conversationCount}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {conversations.length > 0 ? (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item._id || item.id}
            renderItem={renderConversationItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="chat-remove-outline"
              size={hp(10)}
              color="#cccccc"
            />
            <Text style={styles.emptyText}>No conversations in this collection</Text>
          </View>
        )}
      </View>
    </View>
  );

  function getIconName(iconType) {
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
  }
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
  editButton: {
    padding: hp(1),
  },
  collectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(5),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: hp(10),
    height: hp(10),
    backgroundColor: '#e6f2ff',
    borderRadius: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  infoText: {
    flex: 1,
  },
  collectionName: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    marginBottom: hp(0.5),
  },
  collectionDate: {
    fontSize: hp(1.6),
    color: '#666',
    marginBottom: hp(0.5),
  },
  conversationCount: {
    fontSize: hp(1.8),
    color: '#333',
  },
  contentContainer: {
    flex: 1,
  },
  listContainer: {
    padding: wp(4),
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: hp(2),
    marginBottom: hp(1.5),
  },
  conversationIcon: {
    marginRight: wp(3),
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: hp(2),
    fontWeight: '500',
    marginBottom: hp(0.5),
  },
  conversationDate: {
    fontSize: hp(1.5),
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp(10),
  },
  emptyText: {
    fontSize: hp(2),
    color: '#888',
    marginTop: hp(2),
  },
});