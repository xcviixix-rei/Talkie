import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StreamCall, CallControls, useCall, useCallStateHooks, ToggleAudioPublishingButton } from '@stream-io/video-react-native-sdk';
import { getCurrentCall, clearCurrentCall } from '../../services/streamService';
import InCallManager from 'react-native-incall-manager';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WaitingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { callId, calleeId, isVideo: isVideoParam } = params;
    const isVideo = isVideoParam === 'true'; // Params are strings

    const [call, setCall] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const activeCall = getCurrentCall();
        if (activeCall && activeCall.id === callId) {
            setCall(activeCall);
        } else {
            console.error(`WaitingScreen: Could not find active call matching ID ${callId}`);
            setError(`Call session mismatch. Expected ${callId}.`);
            Alert.alert("Error", "Call session error. Returning.", [{ text: "OK", onPress: () => router.back() }]);
        }
    }, [callId]);

    useEffect(() => {
        if (!call) return;

        console.log(`WaitingScreen: Listening for events on call ${call.id}`);
        InCallManager.startRingtone('_DEFAULT_', 'ringback'); // Start ringback tone

        const handleCallAccepted = (event) => {
             if (event.call?.id !== call.id) return; // Ensure it's for this call
             console.log(`WaitingScreen: Call ${call.id} accepted by ${event.user.id}`);
            InCallManager.stopRingtone();
            // No need to start InCallManager media here, CallScreen will handle it
            router.replace({ pathname: '/call', params: { callId: call.id, isVideo } });
        };

        const handleCallRejectedOrEnded = (event) => {
             if (event.call?.id !== call.id) return;
             const reason = event.type === 'call.rejected' ? 'rejected' : 'ended';
             console.log(`WaitingScreen: Call ${call.id} ${reason}. Event:`, event);
            InCallManager.stopRingtone();
            Alert.alert('Call Not Connected', `The call was ${reason}.`, [
                 { text: 'OK', onPress: () => cleanupAndGoBack() },
            ]);
        };

         const unsubscribeAccepted = call.on('call.accepted', handleCallAccepted);
         const unsubscribeRejected = call.on('call.rejected', handleCallRejectedOrEnded);
         const unsubscribeEnded = call.on('call.ended', handleCallRejectedOrEnded); // Can also end if user cancels


        return () => {
             console.log(`WaitingScreen: Cleaning up listeners for call ${call.id}`);
             unsubscribeAccepted();
             unsubscribeRejected();
             unsubscribeEnded();
             InCallManager.stopRingtone();
        };
    }, [call, router, isVideo]);


    const cleanupAndGoBack = (callInstance = call) => {
        InCallManager.stopRingtone();
        if (callInstance) {
             // No need to leave here if rejected/ended, already handled by SDK?
            // If user cancels, we need to leave.
             clearCurrentCall();
        }
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/home'); // Fallback
        }
    };

    const cancelCall = async () => {
        console.log(`WaitingScreen: User cancelling call ${call?.id}`);
        InCallManager.stopRingtone();
        if (call) {
            try {
                // await call.stopRinging(); // Let the SDK handle signaling reject/cancel
                await call.leave({ reject: true }); // Indicate cancellation
            } catch (e) {
                console.error("WaitingScreen: Error leaving/rejecting call:", e);
                 // await call.leave(); // Fallback leave
            } finally {
                 clearCurrentCall(); // Clear our reference *after* attempting to leave
                 if (router.canGoBack()) router.back(); else router.replace('/home');
            }
        } else {
             // If call object somehow got lost, just navigate back
             clearCurrentCall();
             if (router.canGoBack()) router.back(); else router.replace('/home');
        }
    };

    if (error) {
        return <SafeAreaView style={styles.container}><Text style={styles.errorText}>{error}</Text></SafeAreaView>;
    }
    if (!call) {
        return <SafeAreaView style={styles.container}><ActivityIndicator size="large" /></SafeAreaView>;
    }

    // Use StreamCall to provide context for UI components
    return (
        <StreamCall call={call}>
            <SafeAreaView style={styles.container}>
                <Text style={styles.text}>Calling {calleeId || '...'}...</Text>
                <Text style={styles.text}>{isVideo ? 'Video Call' : 'Voice Call'}</Text>
                <ActivityIndicator size="large" style={{ marginVertical: 30 }} />

                {/* Basic Controls */}
                <View style={styles.controls}>
                   {/* Allow muting mic while waiting */}
                    <ToggleAudioPublishingButton />
                    {/* Cancel Button */}
                    <Button title="Cancel" onPress={cancelCall} color="red" />
                    {/* Add Toggle Video Button if needed */}
                </View>
                 {/* <CallControls onHangupCallHandler={cancelCall} /> */}
            </SafeAreaView>
        </StreamCall>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20, 
        backgroundColor: 'white' 
    },
    text: { 
        fontSize: 20, 
        marginBottom: 10, 
        color: '#333' 
    },
    errorText: { 
        fontSize: 16, 
        color: 'red' 
    },
    controls: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        width: '80%', 
        marginTop: 40 },
});