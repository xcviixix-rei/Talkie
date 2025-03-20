import {Pressable, Text, View} from "react-native";
import React from "react";
import {useAuth} from "../../context/authContext";


export default function Home() {
    const {handleSignOut} = useAuth();
    const signOut = async () => {
        await handleSignOut();
    }
    return (
        <View>
            <Pressable onPress={signOut}>
                <Text>signOut</Text>
            </Pressable>
        </View>
    )
}