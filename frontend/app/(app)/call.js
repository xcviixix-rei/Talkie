import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert, View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StreamCall, CallContent, useCall } from '@stream-io/video-react-native-sdk';
import { getCurrentCall, clearCurrentCall } from '../../services/streamService';
import InCallManager from 'react-native-incall-manager';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CallScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [call, setCall] = useState(null);
    const [isVideoCall, setIsVideoCall] = useState(false);
    const [error, setError] = useState(null);


    useEffect(() => {
        const activeCall = getCurrentCall();
        if (activeCall) {
             setCall(activeCall);
             setIsVideoCall(activeCall.state.custom.isVideoCall || false);
        } else {
             console.error("CallScreen: Active call object not found!");
             setError("Call session not found.");
             Alert.alert("Error", "Call session not found. Returning.", [{ text: "OK", onPress: () => cleanupAndGoBack(null) }]);
             return;
        }

        InCallManager.start({ media: activeCall.state.custom.isVideoCall ? 'video' : 'audio' });


        // Listener for when the call actually ends (e.g., other person hangs up)
        const handleCallEnded = (event) => {
             if (event.call?.id !== activeCall.id) return;
             cleanupAndGoBack(null, 'The call has ended.'); // Pass null as call is already gone
        };
         const unsubscribeEnded = activeCall.on('call.ended', handleCallEnded);

        return () => {
             unsubscribeEnded();
             // Stop InCallManager only if we are SURE the call is over when navigating away
             // If navigating to another screen *during* the call, don't stop it here.
             // The cleanupAndGoBack handles stopping InCallManager on hangup/end.
        };
    }, []); // Run only once on mount

    const cleanupAndGoBack = (callInstance = call, alertMessage = null) => {
        InCallManager.stop(); // Stop speaker, proximity sensor etc.
        if (callInstance && getCurrentCall()?.id === callInstance.id) {
             clearCurrentCall(); // Clear global state if it's the active call
        }
        if (alertMessage) {
             Alert.alert('Call Finished', alertMessage, [{ text: 'OK' }]);
        }
         // Navigate back to a safe place (e.g., home or conversation list)
         // Using replace to prevent going back to the call screen
         router.back(); // Or navigate back more intelligently if needed
    };

    const onHangupHandler = async () => {
        if (call) {
            await call.leave();
             // cleanupAndGoBack will be triggered by the 'call.ended' event,
             // so we don't strictly need to call it here, but can for immediate feedback.
            cleanupAndGoBack(call, null); // Provide immediate navigation
        } else {
            cleanupAndGoBack(null, null); // Fallback if call object is lost
        }
    };

    if (error) {
        return <SafeAreaView style={styles.container}><Text style={styles.errorText}>{error}</Text></SafeAreaView>;
    }
    if (!call) {
        // Should ideally be handled by the error state, but as a fallback:
        return <SafeAreaView style={styles.container}><ActivityIndicator size="large" /></SafeAreaView>;
    }

    return (
        // StreamCall provides context for CallContent and hooks
        <StreamCall call={call}>
            <SafeAreaView style={styles.safeArea}>
                <CallContent
                     onHangupCallHandler={onHangupHandler}
                     // You can customize layout, controls etc. here
                     // E.g., using <VideoRenderer />, <CallControls />, <ParticipantView />
                />
            </SafeAreaView>
        </StreamCall>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: 'black' }, // Or theme background
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }, // For error/loading state
    errorText: { fontSize: 16, color: 'red' },
});