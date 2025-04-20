import {Tabs} from "expo-router";
import {StyleSheet} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
                headerShown: false,
                tabBarActiveTintColor: '#1E90FF',
                tabBarInactiveTintColor: '#777',
                tabBarShowLabel: true,
                tabBarPressColor: 'transparent',
                tabBarHideOnKeyboard: true,
                tabBarItemStyle: {
                    pressOpacity: 1,
                    androidRipple: {borderless: false, color: 'transparent'},
                }
            }}
            pressColor="transparent"
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Messages',
                    tabBarIcon: ({color, size, focused}) => (
                        <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="collections"
                options={{
                    title: 'Collections',
                    tabBarIcon: ({color, size, focused}) => (
                        <Ionicons
                            name={focused ? 'people-circle' : 'people-circle-outline'}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="menu"
                options={{
                    title: 'Menu',
                    tabBarIcon: ({color, size, focused}) => (
                        <Ionicons name={focused ? 'menu' : 'menu-outline'} size={size} color={color}/>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        height: hp(8),
        paddingBottom: hp(1),
        paddingTop: hp(1),
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: 'white',
    },
    tabBarLabel: {
        fontSize: hp(1.4),
        fontWeight: '500',
    }
});