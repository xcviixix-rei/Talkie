// app/(app)/incomingCall.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StreamCall, useStreamVideoClient } from '@stream-io/video-react-native-sdk';
import { getCurrentCall, setCurrentCall, clearCurrentCall } from '../../services/streamService';
import InCallManager from 'react-native-incall-manager';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IncomingCallScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { callId, callerId: paramCallerId } = params;
    const streamVideoClient = useStreamVideoClient();

    const [callObject, setCallObject] = useState(null);
    const [isVideoCall, setIsVideoCall] = useState(false);
    const [displayCallerId, setDisplayCallerId] = useState(paramCallerId || 'Unknown Caller');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCallEndedMessage, setShowCallEndedMessage] = useState(false); // New state to control UI

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        setShowCallEndedMessage(false);

        if (!streamVideoClient) {
            setError("Call service not ready.");
            setIsLoading(false);
            return;
        }

        if (!callId) {
            setError("Call identifier missing.");
            setIsLoading(false);
            return;
        }

        const activeCallInstance = streamVideoClient.call('default', callId);

        // Store the cleanup function for listeners
        let listenerCleanupFunction = () => {};

        const setupCall = async (callToLoad) => {
            try {
                await callToLoad.get();

                if (!callToLoad.state) {
                    throw new Error("Failed to load call state after .get().");
                }

                InCallManager.startRingtone('_DEFAULT_');

                setCallObject(callToLoad); // Set call object regardless of state for listeners
                setCurrentCall(callToLoad); // Update global currentCall

                // Set up listeners immediately after getting the call object
                const handleCallEndedOrRejected = (event) => {
                    if (event.call?.id !== callToLoad.id && event.callCid !== callToLoad.cid) return;
                    setError(`Call ${event.reason || 'has ended'}.`); // Update error state
                    setShowCallEndedMessage(true); // Indicate that call ended UI should be shown
                    // Do not navigate here, let the UI reflect the state
                    // cleanupAndGoBack will be called if user presses "Go Back"
                };
                const unsubRejected = callToLoad.on('call.rejected', handleCallEndedOrRejected);
                const unsubEnded = callToLoad.on('call.ended', handleCallEndedOrRejected);
                listenerCleanupFunction = () => { // Assign to the outer scope variable
                    unsubRejected();
                    unsubEnded();
                };
                    // Call is RINGING, set UI details
                    setIsVideoCall(callToLoad.state.custom?.isVideoCall || false);
                    setDisplayCallerId(callToLoad.state.createdBy?.id || paramCallerId || 'Unknown Caller');

            } catch (err) {
                console.error(`IncomingCallScreen: Error in setupCall for call ID ${callToLoad.id}:`, err);
                setError(`Could not load call details: ${err.message}`);
                setShowCallEndedMessage(true); // Treat as an ended call for UI
            } finally {
                setIsLoading(false);
            }
        };

        setupCall(activeCallInstance);

        return () => {
            console.log(`IncomingCallScreen: useEffect cleanup for callId ${callId}. Stopping ringtone.`);
            listenerCleanupFunction(); // Call the stored cleanup function
            InCallManager.stopRingtone();
        };

    }, [streamVideoClient, callId, paramCallerId]);


    const cleanupAndGoBack = (alertMessage = null) => {
        InCallManager.stopRingtone();
        if (alertMessage) Alert.alert('Call Info', alertMessage, [{ text: 'OK' }]);
        
        // Clear currentCall only if it's the one this screen was managing
        if (callObject && getCurrentCall()?.id === callObject.id) {
            clearCurrentCall();
        }
        setCallObject(null); // Clear local call object

        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/home');
        }
    };

    const acceptCall = async () => {
        if (!callObject || showCallEndedMessage) { // Don't accept if call already ended
            Alert.alert("Cannot Accept", "This call is no longer active.");
            return;
        }
        console.log(`IncomingCallScreen: Accepting call ${callObject.id}`);
        InCallManager.stopRingtone();
        try {
            await callObject.join();
            console.log(`IncomingCallScreen: Call ${callObject.id} joined.`);
            router.replace({ pathname: '/call', params: { callId: callObject.id, isVideo: isVideoCall.toString() } });
        } catch (error) {
            console.error('IncomingCallScreen: Error accepting call:', error);
            Alert.alert('Error', 'Could not accept call: ' + error.message);
            setError("Failed to accept call."); // Update UI
            setShowCallEndedMessage(true); // Treat as an ended call for UI
        }
    };

    const rejectCall = async () => {
        if (!callObject) return; // No need to check showCallEndedMessage, rejecting an ended call is fine
        console.log(`IncomingCallScreen: Rejecting call ${callObject.id}`);
        InCallManager.stopRingtone();
        try {
            await callObject.reject();
            console.log(`IncomingCallScreen: Call ${callObject.id} rejected by user.`);
        } catch (error) {
            console.error('IncomingCallScreen: Error rejecting call:', error);
            // Even if API reject fails, we still want to leave this screen
        } finally {
            // The call.rejected listener should handle UI update and eventual navigation if needed
            // For immediate feedback and cleanup:
            cleanupAndGoBack(null);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading call...</Text>
            </SafeAreaView>
        );
    }

    // If showCallEndedMessage is true, or if there's an error and no call object yet
    if (showCallEndedMessage || (error && !callObject) ) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>{error || "Call has ended."}</Text>
                <Button title="Go Back" onPress={() => cleanupAndGoBack(null)} />
            </SafeAreaView>
        );
    }
    
    // If callObject is null after loading and no specific "ended" message, it's an unexpected error
    if (!callObject) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Could not load call information.</Text>
                <Button title="Go Back" onPress={() => cleanupAndGoBack(null)} />
            </SafeAreaView>
        );
    }

    return (
         <StreamCall call={callObject}>
             <SafeAreaView style={styles.container}>
                {/* Display a general error if one occurred but we still show buttons */}
                {error && !showCallEndedMessage && <Text style={[styles.errorText, {marginBottom: 10}]}>{error}</Text>}
                <Text style={styles.title}>Incoming {isVideoCall ? 'Video' : 'Voice'} Call</Text>
                <Text style={styles.callerText}>From: {displayCallerId}</Text>
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
    loadingText: {
        marginTop: 10, 
        fontSize: 16, 
        color: 'lightgrey'
    },
    errorText: { 
        fontSize: 16, 
        color: 'red', // Keep red for errors
        textAlign: 'center', 
        marginBottom: 20 
    },
    buttonRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        width: '100%', 
        paddingHorizontal: 20 
    },
});