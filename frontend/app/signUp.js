import {StatusBar} from "expo-status-bar";
import {Alert, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import React, {useRef, useState} from "react";
import {useRouter} from "expo-router";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {Feather, Octicons} from "@expo/vector-icons";
import Loading from "../components/Loading";
import CustomKeyboardView from "../components/CustomKeyboardView";
import {useAuth} from "../context/authContext";

export default function SignUp() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const {handleSignUp} = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const emailRef = useRef("");
    const usernameRef = useRef("");
    const passwordRef = useRef("");
    const passwordConfirmRef = useRef("");

    const handleRegister = async () => {
        if (!emailRef.current || !passwordRef.current || !usernameRef.current) {
            Alert.alert("Please fill in all fields");
            return;
        }

        if (passwordRef.current !== passwordConfirmRef.current) {
            Alert.alert("Password does not match");
            return;
        }

        // register process
        setLoading(true);
        let response = await handleSignUp(usernameRef.current, emailRef.current, passwordRef.current);


        if (!response.success) {
            Alert.alert("Error", response.data);
            setLoading(false);
        }
    }

    return (
        <CustomKeyboardView>
            <StatusBar style="dark"/>
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    <Text style={styles.headerText}>
                        Create{"\n"}Account
                    </Text>

                    <View style={styles.inputsContainer}>
                        <View style={styles.inputWrapper}>
                            <View style={styles.iconContainer}>
                                <Feather name="user" size={hp(2.7)} color="gray"/>
                            </View>
                            <TextInput
                                onChangeText={value => usernameRef.current = value}
                                style={styles.input}
                                placeholder='Username'
                                placeholderTextColor='gray'
                            />
                        </View>

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

                        <View style={styles.inputWrapper}>
                            <View style={styles.iconContainer}>
                                <Octicons name="shield-lock" size={hp(2.7)} color="gray"/>
                            </View>
                            <TextInput
                                onChangeText={value => passwordConfirmRef.current = value}
                                style={styles.input}
                                placeholder='Confirm Password'
                                secureTextEntry={!showPassword}
                                placeholderTextColor='gray'
                            />
                        </View>

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <Loading size={hp(7)}/>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={handleRegister}
                                style={styles.signUpButton}
                            >
                                <Text style={styles.signUpButtonText}>
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.signInContainer}>
                            <Text style={styles.signInText}>
                                Already have an account?
                            </Text>
                            <Pressable onPress={() => router.push("/signIn")}>
                                <Text style={styles.signInLink}>
                                    Sign In
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
    signUpButton: {
        height: hp(6.5),
        backgroundColor: '#6366f1',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8
    },
    signUpButtonText: {
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
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12
    },
    signInText: {
        fontSize: hp(1.9),
        fontWeight: '600',
        color: '#6b7280'
    },
    signInLink: {
        fontSize: hp(1.9),
        fontWeight: 'bold',
        color: '#6366f1',
        marginLeft: 4
    }
});