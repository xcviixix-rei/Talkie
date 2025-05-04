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
            {/* <Stack.Screen
        name="conversationInfor"
        options={({ navigation }) => ({
          title: "Conversation Info",
          headerBackTitle: "Back",
          // This allows us to customize the back button behavior
          headerLeft: () => (
            <TouchableOpacity
              onPress={() =>
                navigation.getParent()?.emit({
                  type: "customBackAction",
                  target: navigation.getId(),
                })
              }
            >
              <Ionicons name="chevron-back" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        })}
      /> */}
        </Stack>
    );
}
