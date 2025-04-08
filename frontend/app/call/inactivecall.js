import React from "react"
import {Button, StyleSheet, Text, View} from "react-native"

export const InactiveCall = ({goToCallScreen}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome to Video Calling Tutorial</Text>
            <Button title="Join Video Call" onPress={goToCallScreen}/>
        </View>
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
    }
})
