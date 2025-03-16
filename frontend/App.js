import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import GoogleSign from "./components/googleSign";
import EmailSign from "./components/emailSign";

export default function App() {
  return (
    <View style={styles.container}>
      {/* <GoogleSign /> */}
      <EmailSign />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
