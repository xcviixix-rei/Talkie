import { StatusBar } from "expo-status-bar";
import { View, Text, TextInput, TouchableOpacity, Pressable, Alert } from "react-native";
import React, {useRef, useState} from "react";
import {useRouter} from "expo-router";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from "react-native-responsive-screen";
import {Feather, Octicons} from "@expo/vector-icons";
import Loading from "../components/Loading";
import CustomKeyboardView from "../components/CustomKeyboardView";
import {useAuth} from "../context/authContext";



export default function SignUp() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { handleSignUp } = useAuth();
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
        let response = await  handleSignUp(usernameRef.current, emailRef.current, passwordRef.current);
        setLoading(false);

        if (!response.success) {
            Alert.alert("Error", response.data);
        }
    }

    return(
        <CustomKeyboardView>
            <StatusBar style="dark" />
            <View style={{paddingTop: hp(18), paddingHorizontal: wp(5)}} className="flex-1 gap-12">

                <View className="gap-10">
                    <Text style={{fontSize: hp (4)}} className="font-bold tracking-wider text-left text-neutral-800">Create{"\n"}Account</Text>
                    {/* input */}
                    <View className="gap-4">
                        <View style={{height: hp(7)}} className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl">
                            <View style={{ width: hp(3), alignItems: 'center' }}>
                                <Feather name="user" size={hp(2.7)} color="gray" />
                            </View>
                            <TextInput
                                onChangeText={value => usernameRef.current = value}
                                style={{fontSize: hp(2)}}
                                className="flex-1 font-semibold text-neutral-700"
                                placeholder='Username'
                                placeholderTextColor={'gray'}
                            />
                        </View>
                        <View style={{height: hp(7)}} className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl">
                            <View style={{ width: hp(3), alignItems: 'center' }}>
                                <Octicons name="mail" size={hp(2.7)} color="gray" />
                            </View>
                            <TextInput
                                onChangeText={value => emailRef.current = value}
                                style={{fontSize: hp(2)}}
                                className="flex-1 font-semibold text-neutral-700"
                                placeholder='Email address'
                                placeholderTextColor={'gray'}
                            />
                        </View>
                        <View style={{height: hp(7)}} className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl">
                            <View style={{ width: hp(3), alignItems: 'center' }}>
                                <Octicons name="lock" size={hp(2.7)} color="gray" />
                            </View>
                            <TextInput
                                onChangeText={value => passwordRef.current = value}
                                style={{fontSize: hp(2)}}
                                className="flex-1 font-semibold text-neutral-700"
                                placeholder='Password'
                                secureTextEntry={!showPassword}
                                placeholderTextColor={'gray'}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Octicons name={showPassword ? "eye" : "eye-closed"} size={hp(2.7)} color="gray" />
                            </TouchableOpacity>
                        </View>
                        <View style={{height: hp(7)}} className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl">
                            <View style={{ width: hp(3), alignItems: 'center' }}>
                                <Octicons name="shield-lock" size={hp(2.7)} color="gray" />
                            </View>
                            <TextInput
                                onChangeText={value => passwordConfirmRef.current = value}
                                style={{fontSize: hp(2)}}
                                className="flex-1 font-semibold text-neutral-700"
                                placeholder='Confirm Password'
                                secureTextEntry={!showPassword}
                                placeholderTextColor={'gray'}
                            />
                        </View>

                        {/*submit button*/}

                        <View>
                            {
                                loading? (
                                    <View className="flex-row justify-center">
                                        <Loading size={hp(7)} />
                                    </View>
                                ):(
                                    <TouchableOpacity onPress={handleRegister} style={{height: hp(6.5)}} className="bg-indigo-500 rounded-xl justify-center items-center">
                                        <Text style={{fontSize: hp(2.7)}} className="text-white font-bold tracking-wider">
                                            Sign Up
                                        </Text>
                                    </TouchableOpacity>
                                )
                            }
                        </View>



                        {/*sign up*/}
                        <View className="flex-row justify-center">
                            <Text style={{fontSize: hp(1.9)}} className=" font-semibold text-neutral-500">Already have an account?</Text>
                            <Pressable onPress={() => router.push("/signIn")}>
                                <Text style={{fontSize: hp(1.9)}} className="text-indigo-500 font-bold"> Sign In</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    )
}