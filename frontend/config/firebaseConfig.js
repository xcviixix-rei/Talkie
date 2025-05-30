import {initializeApp} from "firebase/app";
    import {getReactNativePersistence, initializeAuth} from "firebase/auth";
    import {collection, getFirestore, limit, onSnapshot, orderBy, query, where} from "firebase/firestore";
    import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
    import * as Notifications from 'expo-notifications';
    import {
      FIREBASE_API_KEY,
      FIREBASE_APP_ID,
      FIREBASE_AUTH_DOMAIN,
      FIREBASE_MEASUREMENT_ID,
      FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET,
    } from "@env";

    const firebaseConfig = {
        apiKey: FIREBASE_API_KEY,
        authDomain: FIREBASE_AUTH_DOMAIN,
        projectId: FIREBASE_PROJECT_ID,
        storageBucket: FIREBASE_STORAGE_BUCKET,
        messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
        appId: FIREBASE_APP_ID,
        measurementId: FIREBASE_MEASUREMENT_ID,
    };

    const app = initializeApp(firebaseConfig);
    const auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });

    export const db = getFirestore(app);

    export const usersRef = collection(db, "users");
    export const conversationsRef = collection(db, "conversations");

    class MessageNotificationService {
        constructor() {
            this.activeConversationId = null;
            this.messageListeners = new Map();
            this.userId = null;
            this.userCache = new Map();
            this.isInitialized = false;
            this.notificationInterval = null;
            this.newMessageListeners = [];  // Array to store new message callbacks
        }

        // Method to subscribe to new message events
        onNewMessage(callback) {
            if (typeof callback === 'function') {
                this.newMessageListeners.push(callback);

                // Return unsubscribe function
                return () => {
                    this.newMessageListeners = this.newMessageListeners.filter(cb => cb !== callback);
                };
            }
            return null;
        }

        // Method to notify all listeners when a new message arrives
        notifyNewMessage(message) {
            this.newMessageListeners.forEach(callback => callback(message));
        }

        async initialize() {
          // Don't initialize twice
          if (this.isInitialized) return;

          console.log("Starting notification service initialization");

          try {
            // Configure notification handler
            Notifications.setNotificationHandler({
              handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
              }),
            });

            // Request permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
              console.log("Requesting notification permissions...");
              const { status } = await Notifications.requestPermissionsAsync();
              finalStatus = status;
              console.log("Permission status:", status);
            }

            if (finalStatus !== 'granted') {
              console.log('Failed to get push notification permissions!');
              return;
            }

            // Set as initialized
            this.isInitialized = true;
            console.log("Notification service initialized successfully");
          } catch (error) {
            console.error("Error initializing notification service:", error);
          }
        }
        cleanup() {
            // Clear the interval when no longer needed
            if (this.notificationInterval) {
                clearInterval(this.notificationInterval);
                this.notificationInterval = null;
            }
            this.unsubscribeAllListeners();
        }

        setActiveConversation(conversationId) {
            this.activeConversationId = conversationId;
        }

        triggerNotification(title, body, data = {}) {
            // Immediately notify all new message listeners
            if (data.message) {
                this.notifyNewMessage(data.message);
            }

            // Send the notification
            return this.sendLocalNotification(title, body, data);
        }

        clearActiveConversation() {
            this.activeConversationId = null;
        }

        async getUserDetails(userId) {
            // Check cache first
            if (this.userCache.has(userId)) {
                return this.userCache.get(userId);
            }

            try {
                const userDoc = await db.collection('users').doc(userId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    this.userCache.set(userId, userData);
                    return userData;
                }
                return {username: 'User'};
            } catch (error) {
                console.error('Error fetching user details:', error);
                return {username: 'User'};
            }
        }

        listenToConversation(conversationId, conversationType, conversationName) {
            if (!this.userId || this.messageListeners.has(conversationId)) return;

            // Reference to messages collection for this conversation
            const messagesRef = collection(db, 'conversations', conversationId, 'messages');
            const messagesQuery = query(
                messagesRef,
                orderBy('timestamp', 'desc'),
                limit(1)
            );

            const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
                try {
                    if (snapshot.empty) return;

                    // Get the newest message
                    const changes = snapshot.docChanges();
                    const newMessages = changes.filter(change => change.type === 'added');

                    for (const change of newMessages) {
                        const message = {id: change.doc.id, ...change.doc.data()};

                        // Notify all listeners about new message
                        this.notifyNewMessage(message);

                        // Skip notifications for messages from self or if viewing the conversation
                        if (message.sender === this.userId) continue;
                        if (message.hidden_to && message.hidden_to.includes(this.userId)) continue;
                        if (this.activeConversationId === conversationId) continue;

                        console.log("New message detected, preparing notification:", message);

                        // Create notification
                        const notificationTitle = conversationType === 'group'
                            ? (conversationName || 'Group Chat')
                            : 'New Message';

                        const notificationBody = message.text
                            ? message.text
                            : message.attachments?.length > 0
                                ? 'Sent an attachment'
                                : 'New message';

                        console.log("Sending notification:", {title: notificationTitle, body: notificationBody});

                        // Send notification immediately
                        await this.sendLocalNotification(
                            notificationTitle,
                            notificationBody,
                            {
                                conversationId: conversationId,
                                messageId: message.id,
                                senderId: message.sender
                            }
                        );
                    }
                } catch (error) {
                    console.error("Error processing message for notification:", error);
                }
            });

            this.messageListeners.set(conversationId, unsubscribe);
        }

        stopListeningToConversation(conversationId) {
            const unsubscribe = this.messageListeners.get(conversationId);
            if (unsubscribe) {
                unsubscribe();
                this.messageListeners.delete(conversationId);
            }
        }

        unsubscribeAllListeners() {
            for (const unsubscribe of this.messageListeners.values()) {
                unsubscribe();
            }
            this.messageListeners.clear();
            this.newMessageListeners = [];  // Clear message listeners too
        }

        async sendLocalNotification(title, body, data) {
            try {
                const notificationId = await Notifications.scheduleNotificationAsync({
                    content: {
                        title,
                        body,
                        data,
                        sound: true,
                    },
                    trigger: null, // Show immediately
                });
                console.log("Notification scheduled with ID:", notificationId);
                return notificationId;
            } catch (error) {
                console.error('Error sending notification:', error);
            }
        }

        setupConversationsListener(userId) {
            if (!userId) return;

            console.log("Setting up conversation listeners for user:", userId);
            this.userId = userId; // Ensure userId is set for the service

            // Get all conversations for this user
            const userConversationsQuery = query(
                conversationsRef
            );

            return onSnapshot(userConversationsQuery, (snapshot) => {
                const userConversations = snapshot.docs.filter(doc => {
                    const participants = doc.data().participants || [];
                    // Check if any participant has the user_id we're looking for
                    return participants.some(p => p.user_id === userId);
                });

                console.log(`Found ${userConversations.length} conversations for user`);

                userConversations.forEach(doc => {
                    const conversation = {id: doc.id, ...doc.data()};

                    this.listenToConversation(
                        conversation.id,
                        conversation.type || 'direct',
                        conversation.name || ''
                    );
                });
            }, error => {
                console.error("Error setting up conversation listeners:", error);
            });
        }
    }

    export const messageNotificationService = new MessageNotificationService();
    export default auth;