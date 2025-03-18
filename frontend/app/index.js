import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import GoogleSign from "../components/googleSign";
import EmailSign from "../components/emailSign";
import '../global.css'

export default function StartPage() {

    return (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="gray" />
        </View>
    );
}
