import React, {useCallback, useState} from 'react';
import {Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {router, useFocusEffect, useLocalSearchParams} from 'expo-router';
import {getCollection, getCollectionConversations} from '../../api/collection';
import {useAuth} from '../../context/authContext';
import LottieView from "lottie-react-native";

export default function Collection() {
    const {id} = useLocalSearchParams();
    const {user} = useAuth();
    const [collection, setCollection] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

  useFocusEffect(
      useCallback(() => {
        if (!id) {
          router.back();
          return;
        }

        fetchCollectionDetails();
      }, [id])
  );


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

   const navigateToConversation = async (conversation) => {
     try {
       const isGroup = conversation.type === "group";

       if (isGroup) {
         // Get the participants for the group
         const participants = conversation.participants || [];

         // Initialize the mockUsers array
         let mockUsers = [];

         // For each participant in the group, get their user information
         for (const participant of participants) {
           try {
             const userId = typeof participant === "object" ? participant.user_id : participant;

             // Fetch user data (update URL to match your API)
             const userResponse = await fetch(`http://10.0.2.2:5000/api/users/${userId}`);

             if (userResponse.ok) {
               const userData = await userResponse.json();
               mockUsers.push({
                 id: userData.id,
                 username: userData.username,
                 full_name: userData.full_name || userData.username,
                 profile_pic: userData.profile_pic,
               });
             }
           } catch (err) {
             console.error(`Failed to fetch user info for ID: ${participant}`, err);
           }
         }


         // Navigate to the conversation screen with group data
         router.push({
           pathname: "/conversation",
           params: {
             rawItem: JSON.stringify(conversation),
             rawMockUsers: JSON.stringify(mockUsers),
             converName: conversation.name,
             conver_pic: conversation.conver_pic,
           }
         });
       } else {
         // For direct conversations
         const mockUsers = [
           {
             id: user.id,
             username: user.username,
             full_name: user.full_name || user.username,
             profile_pic: user.profile_pic,
           },
           {
             id: conversation.otherParticipant?.user_id,
             username: conversation.otherParticipant?.username || "User",
             full_name: conversation.otherParticipant?.full_name || conversation.otherParticipant?.username || "User",
             profile_pic: conversation.otherParticipant?.profile_pic,
           }
         ];

         router.push({
           pathname: "/conversation",
           params: {
             rawItem: JSON.stringify(conversation),
             rawMockUsers: JSON.stringify(mockUsers),
             converName: conversation.otherParticipant?.username || "User",
             converPic: conversation.otherParticipant?.profile_pic
           }
         });
       }
     } catch (error) {
       console.error("Error navigating to conversation:", error);
       Alert.alert("Error", "Could not open conversation. Please try again.");
     }
   };

    const navigateToEditCollection = () => {
        router.push({
            pathname: '/collectionInfo',
            params: {id: collection._id}
        });
    };
  const formatTime = (dateString) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        if (isNaN(date)) return '';

        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    };
  const renderConversationItem = ({item}) => {
        const isGroup = item.type === "group";


        // For direct messages, get the otherUser's info
        const displayName = isGroup
            ? item.name
            : (item.otherParticipant?.username || "User");

        const displayImage = isGroup
            ? item.conver_pic
            : (item.otherParticipant?.profile_pic);

        const lastMessage = item.last_message
         ? (item.last_message.text
            ? item.last_message.text
            : (item.last_message.attachments && item.last_message.attachments.length > 0
               ? "Sent an attachment"
               : "No messages yet"))
         : "No messages yet";

        const lastMessageTime = item.last_message?.timestamp
            ? formatTime(item.last_message.timestamp)
            : '';

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => navigateToConversation(item)}
            >
                {/* Avatar/Image */}
                {displayImage ? (
                    <Image
                        source={{uri: displayImage}}
                        style={styles.conversationImage}
                    />
                ) : (
                    <View style={styles.conversationIconContainer}>
                        <MaterialCommunityIcons
                            name={isGroup ? "account-group" : "account"}
                            size={hp(3)}
                            color="#1E90FF"
                        />
                    </View>
                )}

                {/* Conversation Info */}
                <View style={styles.conversationContent}>
                  <Text style={styles.conversationTitle} numberOfLines={1}>
                    {displayName}
                  </Text>
                    <View style={styles.nameTimeRow}>
                      <Text style={styles.conversationPreview} numberOfLines={1}>
                        {lastMessage}
                      </Text>

                        <Text style={styles.timeText}>
                            {lastMessageTime}
                        </Text>
                    </View>

                </View>

            </TouchableOpacity>
        );
    };
  if (loading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <LottieView style={{height: 100, width: 100}} source={require('../../assets/animation/loading2.json')} autoPlay
                          loop/>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={hp(3)} color="#1E90FF"/>
                </TouchableOpacity>
                <Text style={styles.title}>{collection?.name || 'Collection'}</Text>
                <TouchableOpacity onPress={navigateToEditCollection} style={styles.editButton}>
                    <Ionicons name="settings-outline" size={hp(3)} color="#1E90FF"/>
                </TouchableOpacity>
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
    conversationImage: {
        width: hp(6),
        height: hp(6),
        borderRadius: hp(3),
        marginRight: wp(3),
    },
    conversationIconContainer: {
        width: hp(6),
        height: hp(6),
        borderRadius: hp(3),
        backgroundColor: '#e6f2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
    },
    conversationContent: {
        flex: 1,
        justifyContent: 'center',
    },
    nameTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(0.5),
    },
    conversationTitle: {
        fontSize: hp(2),
        fontWeight: '500',
        flex: 1,
        marginRight: wp(2),
    },
    timeText: {
        fontSize: hp(1.5),
        color: '#888',
    },
    conversationPreview: {
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