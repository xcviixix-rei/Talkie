import { StatusBar } from "expo-status-bar";
import { View, Text, Image, TextInput, TouchableOpacity, Pressable, Alert } from "react-native";
import React, {useRef, useState} from "react";
import {useRouter} from "expo-router";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from "react-native-responsive-screen";
import {Octicons} from "@expo/vector-icons";
import Loading from "../components/loading";


export default function SignIn() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const emailRef = useRef("");
    const passwordRef = useRef("");

    const handleLogin = async () => {
        if (!emailRef.current || !passwordRef.current) {
            Alert.alert("Please fill in all fields");
        }

        // login process
    }

    return(
        <View className="flex-1">
            <StatusBar style="dark" />
            <View style={{paddingTop: hp(8), paddingHorizontal: wp(5)}} className="flex-1 gap-12">
                <View className="items-center">
                    <Image style={{height: hp(18.5)}} resizeMode="contain" source={require(`../assets/images/icon.png`)} />
                </View>
                <View className="gap-10">
                    <Text style={{fontSize: hp (4)}} className="font-bold tracking-wider text-center text-neutral-800">Welcome back!</Text>
                    {/* input */}
                    <View className="gap-4">
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
                        <View className="gap-3">
                            <View style={{height: hp(7)}} className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl">
                                <View style={{ width: hp(3), alignItems: 'center' }}>
                                    <Octicons name="lock" size={hp(2.7)} color="gray" />
                                </View>
                                <TextInput
                                    onChangeText={value => passwordRef.current = value}
                                    style={{fontSize: hp(2)}}
                                    className="flex-1 font-semibold text-neutral-700"
                                    placeholder='Password'
                                    secureTextEntry={true}
                                    placeholderTextColor={'gray'}
                                />
                            </View>
                            <Text style={{fontSize: hp(1.8)}} className="text-right font-semibold text-neutral-500">Forgot password?</Text>
                        </View>

                        {/*submit button*/}

                        <View>
                            {
                                loading? (
                                    <View className="flex-row justify-center">
                                        <Loading size={hp(7)} />
                                    </View>
                                ):(
                                    <TouchableOpacity onPress={handleLogin} style={{height: hp(6.5)}} className="bg-indigo-500 rounded-xl justify-center items-center">
                                        <Text style={{fontSize: hp(2.7)}} className="text-white font-bold tracking-wider">
                                            Sign In
                                        </Text>
                                    </TouchableOpacity>
                                )
                            }
                        </View>



                        {/*sign up*/}
                        <View className="flex-row justify-center">
                            <Text style={{fontSize: hp(1.9)}} className=" font-semibold text-neutral-500">Don't have an account?</Text>
                            <Pressable onPress={() => router.push("/signUp")}>
                                <Text style={{fontSize: hp(1.9)}} className="text-indigo-500 font-bold"> Sign Up</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}