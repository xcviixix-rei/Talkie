import ConversationList from "../../components/ConversationList";
import { useState, useEffect } from "react";
import { View, StatusBar, ActivityIndicator } from "react-native";
// import "../global.css";

export default function Home() {
  //const { logout, user } = useauth();
  user = {
    username: "manh",
    // profileUrl: require("../assets/conech.jpg"),
    userId: "1",
  };
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
    <View className="flex-1 bg-white">
      <StatusBar style="light" />
      {users.length > 0 ? (
        <ConversationList users={users} currentUser={user} />
      ) : (
        <View className="flex item-center">
          <ActivityIndicator size="large" />
          {/*<loading size={hp(10)}/>*/}
        </View>
      )}
    </View>
  );
}
