import { StreamVideoClient } from '@stream-io/video-react-native-sdk';
import { getCallToken } from "../api/user";
import { GETSTREAM_API_KEY } from '@env';

let client;
let currentCall = null;

export const initializeStreamClient = async (userId) => {
    if (client) return client;
        const user = { id: userId };
        const token = await getCallToken(userId);
        console.log('Token:', token);

    try {
        client = new StreamVideoClient({ apiKey: GETSTREAM_API_KEY, user, token });
        console.log('Stream client initialized for user:', userId);
        return client;
    } catch (error) {
        console.error('Error in service initializing Stream client:', error);
        throw error;
    }
};

export const getStreamClient = () => {
    if (!client) throw new Error('Stream client not initialized. Call initializeStreamClient first.');
    return client;
};

export const getCurrentCall = () => currentCall;
export const setCurrentCall = (call) => { currentCall = call; };
export const clearCurrentCall = () => { currentCall = null; };

export const createAndJoinCall = async (callId, calleeUids, isVideo = false) => {
    if (!client) throw new Error('Client not initialized');
    if (currentCall) {
        console.warn('Already in a call or initiating one.');
        return currentCall;
    }

    const call = client.call('default', callId);
    try {
        const members = [
            { user_id: client.user.id },
            ...calleeUids.map(uid => ({ user_id: uid }))
        ];

        await call.join({
            data: {
                members: members,
                custom: { 
                    // Optional custom data
                    isVideoCall: isVideo,
                }
            },
        });
        setCurrentCall(call);
        console.log(`Call ${callId} created and joined. Ringing...`);
        // Ringing is usually handled by GetStream backend sending events to other members
        // Or we can explicitly ring
        await call.ring();
        return call;
    } catch (error) {
        console.error('Error creating/joining call:', error);
        clearCurrentCall();
        throw error;
    }
};