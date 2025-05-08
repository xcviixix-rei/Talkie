import {Stack, Tabs} from "expo-router";

export default function AppLayout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            <Stack.Screen
                name="search"
                options={{
                    title: "Search",
                    headerBackTitle: "Home",
                }}
            />
            <Tabs.Screen
                name="createGroup"
                options={{
                    title: "Create Group",
                }}
            />
            <Stack.Screen name="conversation"/>
            <Stack.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerBackTitle: "Back",
                }}
            />
            <Stack.Screen
                name="callScreen"
                options={{
                    headerShown: false,
                    presentation: "fullScreenModal",
                }}
            />
            <Stack.Screen
                name="conversationInfor"
                options={{
                    title: "Conversation",
                }}
            />
            <Stack.Screen
                name="notifications-settings"
                options={{
                    headerShown: false,
                    headerBackTitle: "Back",
                }
                }
            />
            <Stack.Screen
                name="settings"
                options={{
                    headerShown: false,
                    headerBackTitle: "Back",
                }}
            />
            <Stack.Screen
                name="collection"
                options={{
                    headerShown: false,
                    headerBackTitle: "Back",
                }}
            />
            <Stack.Screen
                name="collectionInfo"
                options={{
                    headerShown: false,
                    headerBackTitle: "Back",
                }}
            />
            <Stack.Screen
                name="createCollection"
                options={{
                    headerShown: false,
                    headerBackTitle: "Back",
                }}
            />
        </Stack>
    );
}
