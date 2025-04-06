import {StatusBar} from "expo-status-bar";
import {Alert, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import React, {useRef, useState} from "react";
import {router} from "expo-router";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {Octicons} from "@expo/vector-icons";
import Loading from "../components/Loading";
import CustomKeyboardView from "../components/CustomKeyboardView";
import {useAuth} from "../context/authContext";

export default function SignIn() {
    const [loading, setLoading] = useState(false);
    const {handleSignIn} = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const emailRef = useRef("");
    const passwordRef = useRef("");

    const handleLogin = async () => {
        if (!emailRef.current || !passwordRef.current) {
            Alert.alert("Please fill in all fields");
            return;
        }

        // login process
        setLoading(true);
        let response = await handleSignIn(emailRef.current, passwordRef.current);
        setLoading(false);

        if (!response.success) {
            Alert.alert("Error", response.data);
        }
    }

    return (
        <CustomKeyboardView>
            <StatusBar style="dark"/>
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    <Text style={styles.headerText}>
                        Welcome{"\n"}Back
                    </Text>

                    <View style={styles.inputsContainer}>
                        <View style={styles.inputWrapper}>
                            <View style={styles.iconContainer}>
                                <Octicons name="mail" size={hp(2.7)} color="gray"/>
                            </View>
                            <TextInput
                                onChangeText={value => emailRef.current = value}
                                style={styles.input}
                                placeholder='Email address'
                                placeholderTextColor='gray'
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <View style={styles.iconContainer}>
                                <Octicons name="lock" size={hp(2.7)} color="gray"/>
                            </View>
                            <TextInput
                                onChangeText={value => passwordRef.current = value}
                                style={styles.input}
                                placeholder='Password'
                                secureTextEntry={!showPassword}
                                placeholderTextColor='gray'
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Octicons
                                    name={showPassword ? "eye" : "eye-closed"}
                                    size={hp(2.7)}
                                    color="gray"
                                />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <Loading size={hp(7)}/>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={handleLogin}
                                style={styles.signInButton}
                            >
                                <Text style={styles.signInButtonText}>
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.signUpContainer}>
                            <Text style={styles.signUpText}>
                                Don't have an account?
                            </Text>
                            <Pressable onPress={() => router.push("/signUp")}>
                                <Text style={styles.signUpLink}>
                                    Sign Up
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: hp(18),
        paddingHorizontal: wp(5)
    },
    formContainer: {
        gap: 40
    },
    headerText: {
        fontSize: hp(4),
        fontWeight: 'bold',
        letterSpacing: 0.5,
        textAlign: 'left',
        color: '#333'
    },
    inputsContainer: {
        gap: 16
    },
    inputWrapper: {
        height: hp(7),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        paddingHorizontal: 16,
        gap: 12
    },
    iconContainer: {
        width: hp(3),
        alignItems: 'center'
    },
    input: {
        flex: 1,
        fontSize: hp(2),
        fontWeight: '600',
        color: '#333'
    },
    eyeIcon: {
        padding: 4
    },
    signInButton: {
        height: hp(6.5),
        backgroundColor: '#6366f1',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8
    },
    signInButtonText: {
        fontSize: hp(2.7),
        color: 'white',
        fontWeight: 'bold',
        letterSpacing: 0.5
    },
    loadingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12
    },
    signUpText: {
        fontSize: hp(1.9),
        fontWeight: '600',
        color: '#6b7280'
    },
    signUpLink: {
        fontSize: hp(1.9),
        fontWeight: 'bold',
        color: '#6366f1',
        marginLeft: 4
    }
});