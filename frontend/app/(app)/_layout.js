import {Stack} from "expo-router";

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
