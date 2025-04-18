import React, {useState} from "react"
import {SafeAreaView, StyleSheet} from "react-native"
import {StreamVideo, StreamVideoClient} from "@stream-io/video-react-native-sdk"
import {ActiveCall} from "./call/activecall"
import {InactiveCall} from "./call/inactivecall"
import {GETSTREAM_API_KEY} from "@env"

const apiKey = GETSTREAM_API_KEY
const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL0NvdW50X0Rvb2t1IiwidXNlcl9pZCI6IkNvdW50X0Rvb2t1IiwidmFsaWRpdHlfaW5fc2Vjb25kcyI6NjA0ODAwLCJpYXQiOjE3NDI3Mzg0MTUsImV4cCI6MTc0MzM0MzIxNX0.y2s56Rgd1C2hv3P1r_IFIugM3Iu6zZUPGId1d4YF90A"
const userId = "Count_Dooku"
const callId = "vAF3QxN2MJn9"
//Cái này là token của web nó gen để mình test, sau này mình phải tự gen theo user rồi thay vào đây để call
//Web call test cho ae: https://getstream.io/video/demos/auth/signin?callbackUrl=/join/hVWnqXC0doFf?user_id=Jaina_Solo

const user = {
    id: userId,
    name: 'Rei',
    image: 'https://robohash.org/John',
};
const client = new StreamVideoClient({apiKey, user, token});

export default function CallScreen() {
    const [activeScreen, setActiveScreen] = useState("home")
    const goToCallScreen = () => setActiveScreen("call-screen")
    const goToHomeScreen = () => setActiveScreen("home")

    return (
        <StreamVideo client={client}>
            <SafeAreaView style={styles.container}>
                {activeScreen === "call-screen" ? (
                    <ActiveCall goToHomeScreen={goToHomeScreen} callId={callId}/>
                ) : (
                    <InactiveCall goToCallScreen={goToCallScreen}/>
                )}
            </SafeAreaView>
        </StreamVideo>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})