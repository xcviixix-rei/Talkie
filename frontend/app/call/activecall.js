import React, {useEffect, useState} from "react"
import {StyleSheet, Text, View} from "react-native"
import {
    CallContent,
    CallingState,
    HangUpCallButton,
    StreamCall,
    ToggleAudioPublishingButton as ToggleMic,
    ToggleVideoPublishingButton as ToggleCam,
    useCall,
    useStreamVideoClient,
} from "@stream-io/video-react-native-sdk"

const CustomCallControls = ({onHangupCallHandler}) => {
    const call = useCall();
    return (
        <View style={styles.customCallControlsContainer}>
            <ToggleMic onPressHandler={call?.microphone.toggle}/>
            <ToggleCam onPressHandler={call?.camera.toggle}/>
            <HangUpCallButton onHangupCallHandler={onHangupCallHandler}/>
        </View>
    );
};

export const ActiveCall = ({goToHomeScreen, callId}) => {
    const [call, setCall] = useState(null);
    const client = useStreamVideoClient();

    useEffect(() => {
        if (client) {
            const _call = client.call('default', callId);
            _call?.join({create: true}).then(() => setCall(_call));
        }
    }, [client, callId]);

    useEffect(() => {
        return () => {
            if (call && call.state.callingState !== CallingState.LEFT) {
                call.leave();
            }
        };
    }, [call]);

    if (!call) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Joining call...</Text>
            </View>
        );
    }
    return (
        <StreamCall call={call}>
            <View style={styles.container}>
                <CallContent
                    onHangupCallHandler={goToHomeScreen}
                    // CallControls={CustomCallControls}
                />
            </View>
        </StreamCall>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "white"
    },
    text: {
        color: "black",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center"
    },
    customCallControlsContainer: {
        // position: 'absolute',
        // bottom: 40,
        // paddingVertical: 10,
        // width: '80%',
        // marginHorizontal: 20,
        // flexDirection: 'row',
        // alignSelf: 'center',
        // justifyContent: 'space-around',
        // backgroundColor: 'orange',
        // borderRadius: 10,
        // borderColor: 'black',
        // borderWidth: 5,
        // zIndex: 5,
    },
})