import {Stack, Tabs} from "expo-router";

export default function AppLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="(tabs)"
                options={{headerShown: false}}
            />
            <Stack.Screen
                name="search"
                options={{
                    title: 'Search',
                    headerBackTitle: 'Home',
                }}
            />
            <Tabs.Screen
                name="createGroup"
                options={{
                    title: "Create Group",
                }}
            />
            <Stack.Screen
                name="conversation"
            />
            <Stack.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    headerBackTitle: 'Back',
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
