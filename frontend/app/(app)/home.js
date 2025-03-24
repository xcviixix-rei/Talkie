import ConversationList from "../../components/ConversationList";
import { useState, useEffect } from "react";
import { View, StatusBar, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/authContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { db } from "../../config/firebaseConfig";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const [users, setusers] = useState([
    {
      username: "duc",
      profileUrl: require("../../assets/images/conech.jpg"),
      userId: "1",
    },
    {
      username: "phong",
      profileUrl: require("../../assets/images/phuthuy.jpg"),
      userId: "2",
    },
    {
      username: "dat",
      profileUrl: require("../../assets/images/conrong.jpg"),
      userId: "3",
    },
  ]);
  useEffect(() => {
    if (users?.id) getUsers();
  }, []);

  const getUsers = async () => {
    // fetch items
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar style="light" />
      {users.length > 0 ? (
        <ConversationList users={users} currentUser={user} />
      ) : (
        <View className="flex item-center">
          <ActivityIndicator size="large" />
          <loading size={hp(10)} />
        </View>
      )}
    </View>
  );
}
