import { StreamVideoClient } from '@stream-io/video-react-native-sdk';
import { getCallToken } from "../api/user";
import { GETSTREAM_API_KEY } from '@env';

let client = null;
let currentCall = null;
console.log('this line is ran again');

export const initializeStreamClient = async (userId) => {
    if (client && client.user?.id === userId) return client;

    try {
        const user = { id: userId };
        const token = await getCallToken(userId);
        if (!token) throw new Error('Failed to get call token');
        client = new StreamVideoClient({ apiKey: GETSTREAM_API_KEY, user, token });
        console.log('Stream client initialized:', client);
        return client;
    } catch (error) {
        console.error('Error in service initializing Stream client:', error);
        client = null;
        throw error;
    }
};

export const getStreamClient = () => {
    if (!client) throw new Error('Stream client not initialized. Call initializeStreamClient first.');
    return client;
};

export const disconnectStreamClient = async () => {
    if (client) {
        console.log('Disconnecting Stream client...');
        await client.disconnectUser();
        client = null;
        clearCurrentCall(); // Clear any active call state
    }
};

export const getCurrentCall = () => currentCall;
export const setCurrentCall = (call) => { currentCall = call; };
export const clearCurrentCall = () => { currentCall = null; };

export const createAndJoinCall = async (streamClient, callId, calleeUids, isVideo = false) => {
    if (!streamClient) throw new Error('Client not initialized');
    if (currentCall) {
        console.warn('Already in a call or initiating one.');
        throw new Error('User is already in a call process.');
    }

    const call = streamClient.call('default', callId);
    console.log('Client', streamClient.streamClient);
    try {
        const members = [
            { user_id: streamClient.streamClient._user.id},
            ...calleeUids.map(uid => ({ user_id: uid }))
        ];

        await call.getOrCreate({ // Use getOrCreate for robustness
            ring: true, // Automatically ring the other members
            data: {
                members: members,
                custom: { isVideoCall: isVideo }
            },
        });
        
        setCurrentCall(call);

        console.log(`Call ${callId} created and joined. Ringing...`);
        return call;
    } catch (error) {
        console.error('Error creating/joining call:', error);
        clearCurrentCall();
        try { await call.leave(); } catch (e) {};
        throw error;
    }
};