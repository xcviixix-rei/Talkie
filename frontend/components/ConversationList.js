import { FlatList, View } from "react-native";
import React from "react";
import ConversationItem from "./ConversationItem";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useRouter } from "expo-router";

export default function ConversationList({ users, currentUser }) {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={users}
        contentContainerStyle={{ paddingVertical: hp(3) }}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <ConversationItem
            noBorder={index + 1 === users.length}
            item={item}
            router={router}
            currentUser={currentUser}
            index={index}
          />
        )}
      />
    </View>
  );
}
