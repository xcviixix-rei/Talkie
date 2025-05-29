// app/(app)/incomingCall.js
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StreamCall, useStreamVideoClient } from '@stream-io/video-react-native-sdk';
import { getCurrentCall, setCurrentCall, clearCurrentCall } from '../../services/streamService';
import InCallManager from 'react-native-incall-manager';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1) {
        return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
    }
    return name[0].toUpperCase();
};

const CustomButton = ({ onPress, title, iconName, color, backgroundColor, style }) => (
    <TouchableOpacity onPress={onPress} style={[styles.actionButton, { backgroundColor }, style]}>
        <MaterialIcons name={iconName} size={30} color={color || "white"} />
        {title && <Text style={[styles.actionButtonText, { color: color || "white" }]}>{title}</Text>}
    </TouchableOpacity>
);

export default function IncomingCallScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { callId, callerId: paramCallerId } = params;
    const streamVideoClient = useStreamVideoClient();

    const [callObject, setCallObject] = useState(null);
    const [isVideoCall, setIsVideoCall] = useState(false);
    const [displayCaller, setDisplayCaller] = useState('Unknown Caller');
    const [converPic, setConverPic] = useState("U");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCallEndedMessage, setShowCallEndedMessage] = useState(false);

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

        let listenerCleanupFunction = () => {};

        const setupCall = async (callToLoad) => {
            try {
                await callToLoad.get();

                if (!callToLoad.state) {
                    throw new Error("Failed to load call state after .get().");
                }

                InCallManager.startRingtone('_DEFAULT_');

                setCallObject(callToLoad);
                setCurrentCall(callToLoad);

                const handleCallEndedOrRejected = (event) => {
                    if (event.call?.id !== callToLoad.id && event.callCid !== callToLoad.cid) return;
                    setError(`Call ${event.reason || 'has ended'}.`);
                    setShowCallEndedMessage(true);
                };
                const unsubRejected = callToLoad.on('call.rejected', handleCallEndedOrRejected);
                const unsubEnded = callToLoad.on('call.ended', handleCallEndedOrRejected);
                const manh2Id = 'jziciUZST9PazQBtv2EhEDn2kCx2';
                const manh4Id = 'HPBfuadfSBelrChAfcl5VtsWuyh2';
                listenerCleanupFunction = () => {
                    unsubRejected();
                    unsubEnded();
                };
                    setIsVideoCall(callToLoad.state.custom?.isVideoCall || false);
                    if (callToLoad.state.createdBy?.id == manh4Id || paramCallerId === manh4Id) {
                        if (callId.includes('2f74e41e')) {
                            setDisplayCaller('manh4');
                            setConverPic("https://dhqgxvhppcexbmemrsmh.supabase.co/storage/v1/object/public/talkie-files/HPBfuadfSBelrChAfcl5VtsWuyh2/images/profile_pic_manh40c0ef767-18e8-4bc3-9cec-8d3c18bb33f6.jpeg")
                        } else {
                            setDisplayCaller("demo");
                            setConverPic("https://www.gravatar.com/avatar/?d=identicon");
                        }
                    } else if (callToLoad.state.createdBy?.id == manh2Id || paramCallerId === manh2Id) {
                        if (callId.includes('2f74e41e')) {
                            setDisplayCaller('manh2');
                            setConverPic("https://www.gravatar.com/avatar/?d=identicon");
                        } else {
                            setDisplayCaller("demo");
                            setConverPic("https://www.gravatar.com/avatar/?d=identicon");
                        }

                    } else {
                        setDisplayCaller("Unknown Caller");
                    }
                    

            } catch (err) {
                console.error(`IncomingCallScreen: Error in setupCall for call ID ${callToLoad.id}:`, err);
                setError(`Could not load call details: ${err.message}`);
                setShowCallEndedMessage(true);
            } finally {
                setIsLoading(false);
            }
        };

        setupCall(activeCallInstance);

        return () => {
            listenerCleanupFunction();
            InCallManager.stopRingtone();
        };

    }, [streamVideoClient, callId, paramCallerId]);


    const cleanupAndGoBack = (alertMessage = null) => {
        InCallManager.stopRingtone();
        if (alertMessage) Alert.alert('Call Info', alertMessage, [{ text: 'OK' }]);
        if (callObject && getCurrentCall()?.id === callObject.id) {
            clearCurrentCall();
        }
        setCallObject(null);

        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/home');
        }
    };

    const acceptCall = async () => {
        if (!callObject || showCallEndedMessage) {
            Alert.alert("Cannot Accept", "This call is no longer active.");
            return;
        }
        InCallManager.stopRingtone();
        try {
            await callObject.camera.enable(callObject.custom?.isVideoCall);
            await callObject.join();
            router.replace({ pathname: '/call', params: { callId: callObject.id, isVideo: isVideoCall.toString() } });
        } catch (error) {
            console.error('IncomingCallScreen: Error accepting call:', error);
            Alert.alert('Error', 'Could not accept call: ' + error.message);
            setError("Failed to accept call.");
            setShowCallEndedMessage(true);
        }
    };

    const rejectCall = async () => {
        if (!callObject) return;
        InCallManager.stopRingtone();
        try {
            await callObject.reject();
        } catch (error) {
            console.error('IncomingCallScreen: Error rejecting call:', error);
        } finally {
            cleanupAndGoBack(null);
        }
    };

    if (isLoading) {
        return (
            <LinearGradient colors={['#2A2A3A', '#1A1A2A']} style={styles.fullScreenCenter}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.statusText}>Connecting call...</Text>
            </LinearGradient>
        );
    }

    if (showCallEndedMessage || (error && !callObject) ) {
        return (
            <LinearGradient colors={['#3D2C2C', '#2C1D1D']} style={styles.fullScreenCenter}>
                <MaterialIcons name="error-outline" size={60} color="#FF6B6B" />
                <Text style={[styles.statusText, styles.errorTextContent, { marginTop: 15 }]}>
                    {error || "Call has ended."}
                </Text>
                <TouchableOpacity style={styles.goBackButton} onPress={() => cleanupAndGoBack(null)}>
                    <Text style={styles.goBackButtonText}>Go Back</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }
    
    if (!callObject) {
        return (
            <LinearGradient colors={['#3D2C2C', '#2C1D1D']} style={styles.fullScreenCenter}>
                 <MaterialIcons name="perm-scan-wifi" size={60} color="#FFCC00" />
                <Text style={[styles.statusText, styles.errorTextContent, { marginTop: 15 }]}>
                    Could not load call information.
                </Text>
                <TouchableOpacity style={styles.goBackButton} onPress={() => cleanupAndGoBack(null)}>
                    <Text style={styles.goBackButtonText}>Go Back</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    return (
         <StreamCall call={callObject}>
             <LinearGradient colors={['#3A416F', '#1C2541']} style={styles.container}>
                <SafeAreaView style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                    <View style={styles.headerInfo}>
                        <Text style={styles.callType}>
                            Incoming {isVideoCall ? 'Video' : 'Voice'} Call
                        </Text>
                        {error && !showCallEndedMessage && (
                            <Text style={[styles.inlineErrorText]}>{error}</Text>
                        )}
                    </View>

                    <View style={styles.callerInfoContainer}>
                        {converPic ? (
                            <Image source={{ uri: converPic }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarInitials}>
                                <Text style={styles.initialsText}>{getInitials(displayCaller)}</Text>
                            </View>
                        )}
                        <Text style={styles.callerName}>{displayCaller || 'Unknown Caller'}</Text>
                    </View>

                    <View style={styles.actionsContainer}>
                        <View style={styles.actionButtonWrapper}>
                            <CustomButton
                                onPress={rejectCall}
                                iconName="call-end"
                                backgroundColor="#FF3B30"
                            />
                        </View>
                        <View style={styles.actionButtonWrapper}>
                            <CustomButton
                                onPress={acceptCall}
                                iconName="call"
                                backgroundColor="#34C759"
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </StreamCall>
    );
}

const styles = StyleSheet.create({
    fullScreenCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        flex: 1,
    },
    headerInfo: {
        marginTop: '15%',
        alignItems: 'center',
        marginBottom: 20,
    },
    callType: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 5,
    },
    callerInfoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarInitials: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    initialsText: {
        fontSize: 48,
        color: 'white',
        fontWeight: 'bold',
    },
    callerName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 8,
    },
    statusText: {
        marginTop: 15,
        fontSize: 18,
        color: 'lightgrey',
        textAlign: 'center',
    },
    errorTextContent: {
        color: '#FFD2D2',
    },
    inlineErrorText: {
        fontSize: 14,
        color: '#FF6B6B',
        textAlign: 'center',
        backgroundColor: 'rgba(255,0,0,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        marginTop: 10,
    },
    goBackButton: {
        marginTop: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    goBackButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 30,
        marginBottom: '15%',
    },
    actionButtonWrapper: {
        alignItems: 'center',
    },
    actionButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    actionButtonText: {
        marginTop: 8,
        fontSize: 14,
    },
});