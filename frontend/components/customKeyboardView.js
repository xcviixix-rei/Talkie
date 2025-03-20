import { StatusBar } from "expo-status-bar";
import {StyleSheet, View, Text, KeyboardAvoidingView, ScrollView} from "react-native";
import React from "react";
import {Slot, Stack} from "expo-router";
import {Platform} from "react-native";

const ios = Platform.OS === "ios";
export default function CustomKeyboardView({children}) {
    return(
        <KeyboardAvoidingView
            behavior={ios ? "padding" : "height"}
            style={{flex: 1}}
        >

            <ScrollView
                style={{flex: 1}}
                bounce={false}
                showsVerticalScrollIndicator={false}
            >
                {
                    children
                }
            </ScrollView>
        </KeyboardAvoidingView>
    )
}