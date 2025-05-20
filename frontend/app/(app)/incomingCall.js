import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StreamCall, useStreamVideoClient, CallContent } from '@stream-io/video-react-native-sdk';
import { getCurrentCall, setCurrentCall, clearCurrentCall } from '../../services/streamService';
import InCallManager from 'react-native-incall-manager';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IncomingCallScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { callId, callerId } = params;
    const client = useStreamVideoClient(); // Get client from context

    const [call, setCall] = useState(null);
    const [isVideo, setIsVideo] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let callInstance = getCurrentCall();

        // If global call doesn't match or doesn't exist, try to get it from client
        if (!callInstance || callInstance.id !== callId) {
            if (client && callId) {
                console.log(`IncomingCallScreen: Fetching call object for ID ${callId}`);
                // Query calls to get the ringing one - more reliable than just getting currentCall
                // This might be async, handle appropriately
                // OR rely on the listener in _layout having set the *correct* currentCall
                 callInstance = client.call('default', callId); // Get instance
                // Need to ensure its state is loaded if not already set by listener
                 callInstance.get().then(() => {
                     if (callInstance.state.callingState === 'RINGING') {
                         setCurrentCall(callInstance); // Make sure it's set globally
                         setCall(callInstance);
                         setIsVideo(callInstance.state.custom.isVideoCall || false);
                     } else {
                         // Call is no longer ringing (maybe cancelled?)
                         setError("Call is no longer available.");
                         cleanupAndGoBack(null, "Call ended before pickup");
                     }
                 }).catch(err => {
                     console.error("IncomingCallScreen: Error fetching call state:", err);
                     setError("Could not load call details.");
                     cleanupAndGoBack(null, "Error loading call");
                 });

            } else {
                console.error("IncomingCallScreen: Client not ready or callId missing.");
                 setError("Call details unavailable.");
                 cleanupAndGoBack(null, "Call details missing");
                 return; // Exit early
            }
        } else {
             // Global call exists and matches ID
             setCall(callInstance);
             setIsVideo(callInstance.state.custom.isVideoCall || false);
        }

        // Even if we found the call, start listening for its end/cancellation
        if (callInstance) {
            const handleCallEndedOrRejected = (event) => {
                 if (event.call?.id !== callInstance.id) return;
                 console.log('IncomingCallScreen: Call ended/rejected remotely while screen is open.');
                 cleanupAndGoBack(null, 'Call cancelled or ended.');
            };

            const unsubRejected = callInstance.on('call.rejected', handleCallEndedOrRejected);
            const unsubEnded = callInstance.on('call.ended', handleCallEndedOrRejected);

            return () => {
                unsubRejected();
                unsubEnded();
            };
        }


    }, [client, callId]); // Depend on client and callId

    const cleanupAndGoBack = (callInstance = call, alertMessage = null) => {
        InCallManager.stopRingtone();
        if (alertMessage) {
             Alert.alert('Call Ended', alertMessage, [{ text: 'OK' }]);
        }
         // No need to leave if rejecting/ending, accept/reject handles it.
         // But clear the global state ONLY IF it's the current call being processed
         if (callInstance && getCurrentCall()?.id === callInstance.id) {
             clearCurrentCall();
         }
         if (router.canGoBack()) {
             router.back();
         } else {
             router.replace('/home'); // Fallback
         }
    };

    const acceptCall = async () => {
        if (!call) return;
        console.log(`IncomingCallScreen: Accepting call ${call.id}`);
        InCallManager.stopRingtone();
        try {
            await call.join();
            // await call.accept(); // join() should implicitly accept for ringing calls? Test this. If not, uncomment accept().
            console.log(`IncomingCallScreen: Call ${call.id} joined/accepted.`);
            // Navigate to the main call screen
            router.replace({ pathname: '/call', params: { callId: call.id, isVideo } });
        } catch (error) {
            console.error('IncomingCallScreen: Error accepting call:', error);
            Alert.alert('Error', 'Could not accept call.');
            cleanupAndGoBack(call, null); // Pass call to potentially clear state
        }
    };

    const rejectCall = async () => {
        if (!call) return;
        console.log(`IncomingCallScreen: Rejecting call ${call.id}`);
        InCallManager.stopRingtone();
        try {
            await call.reject();
            console.log(`IncomingCallScreen: Call ${call.id} rejected.`);
        } catch (error) {
            console.error('IncomingCallScreen: Error rejecting call:', error);
            // Even if reject fails, leave the screen.
        } finally {
            cleanupAndGoBack(call, null); // Pass call to potentially clear state
        }
    };


    if (error) {
         return <SafeAreaView style={styles.container}><Text style={styles.errorText}>{error}</Text></SafeAreaView>;
    }
    if (!call) {
        return <SafeAreaView style={styles.container}><ActivityIndicator size="large" /></SafeAreaView>;
    }

    const actualCallerId = call.state.createdBy?.id || callerId || 'Unknown Caller';


    // Use StreamCall provider for potential future use, even if not using CallContent here
    return (
         <StreamCall call={call}>
             <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Incoming {isVideo ? 'Video' : 'Voice'} Call</Text>
                <Text style={styles.callerText}>From: {actualCallerId}</Text>
                {/* Add Avatar etc. if desired */}
                <View style={styles.buttonRow}>
                    <Button title="Decline" onPress={rejectCall} color="red" />
                    <Button title="Accept" onPress={acceptCall} color="green" />
                </View>
            </SafeAreaView>
        </StreamCall>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        padding: 20, 
        backgroundColor: '#222' 
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: 'white', 
        textAlign: 'center' 
    },
    callerText: { 
        fontSize: 20, 
        color: 'lightgrey', 
        marginBottom: 30, 
        textAlign: 'center' 
    },
    buttonRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        width: '100%', 
        paddingHorizontal: 20 
    },
     errorText: { 
        fontSize: 16, 
        color: 'red' 
    },
});