import { Stack } from "expo-router";
import { CallScreen } from "./call/callScreen";

export default function AppLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="home"
                options={{headerShown: false}}
            />
            <Stack.Screen
                name="conversation"
            />
            <Stack.Screen
                name="search"
                options={{
                    title: 'Search',
                    headerBackTitle: 'Home',
                    // This ensures when returning from conversation, it goes back to home
                }}
            />
            <Stack.Screen
                name="menu"
                options={{
                    title: 'Menu',
                    presentation: 'modal'
                }}
            />
            <Stack.Screen
                name="profile"
                options={{
                    title: 'Your Profile',
                    presentation: 'modal'
                }}
            />
            <Stack.Screen
                name="callScreen"
                options={{
                    headerShown: false,
                    presentation: 'fullScreenModal',
                }}
            />
        </Stack>
    );
}
