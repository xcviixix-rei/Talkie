import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { getStreamClient } from './streamService';

export async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
        getFCMToken();
    }
    return enabled;
}

export async function getFCMToken() {
    try {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
            console.log('FCM Token:', fcmToken);
            // Send this token to your backend to register with Stream
            const client = getStreamClient();
            if (client && client.user) {
                 await fetch(`http://10.0.2.2:5000/api/notifications/register-device`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: client.user.id,
                        deviceToken: fcmToken,
                        platform: Platform.OS === 'ios' ? 'apn' : 'firebase',
                    }),
                });
                console.log('Device token registered with backend.');
            }
        } else {
            console.log('Failed to get FCM token.');
        }
    } catch (error) {
        console.error('Error getting FCM token:', error);
    }
}

export const notificationListener = (navigation) => { // Pass navigation if needed directly
    // Handle notification when app is in foreground
    messaging().onMessage(async remoteMessage => {
        console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
        // You might want to show a custom in-app notification
        // GetStream SDK usually handles incoming call events if connected
        // This is more for general push notifications or if GetStream event isn't picked up
        if (remoteMessage.data && remoteMessage.data.stream) {
            // It's a Stream notification
            // The SDK should ideally pick up the call.ring event if connected
            // If not, you might need to parse remoteMessage.data.stream to handle incoming call
            console.log("Stream related push:", remoteMessage.data);
        }
    });

    // Handle notification when app is in background or closed
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification caused app to open from background state:', remoteMessage);
        if (remoteMessage.data && remoteMessage.data.stream) {
            const streamData = JSON.parse(remoteMessage.data.stream);
            if (streamData.type === 'call_notification' && streamData.call_cid) {
                 // Potentially navigate to IncomingCallScreen if SDK doesn't auto-handle
                 // The SDK aims to handle this, but good to have a fallback or be aware
                 // This might be tricky if client isn't initialized yet
                 // This is where RootNavigation.navigate helps
                 const callId = streamData.call_cid.split(':')[1]; // e.g., default:call-id
                 console.log("Navigating to incoming call from push for callId:", callId);
                 // Check if already on incoming call screen for this call
                 // navigate('IncomingCall', { callId, isFromPush: true });
            }
        }
    });

    messaging()
        .getInitialNotification()
        .then(remoteMessage => {
            if (remoteMessage) {
                console.log('Notification caused app to open from quit state:', remoteMessage);
                 if (remoteMessage.data && remoteMessage.data.stream) {
                    const streamData = JSON.parse(remoteMessage.data.stream);
                     if (streamData.type === 'call_notification' && streamData.call_cid) {
                         const callId = streamData.call_cid.split(':')[1];
                         console.log("Initial notification for callId:", callId);
                         // Schedule navigation after app is ready
                         // Store callId and navigate once client is up
                     }
                }
            }
        });
};