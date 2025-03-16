import { auth } from "../config/firebaseConfig";
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { GoogleSignin, GoogleSigninButton, statusCodes } from "@react-native-google-signin/google-signin";
import { Colors, Header } from "react-native/Libraries/NewAppScreen";
import { StatusBar } from "expo-status-bar";

export default function GoogleSign() {
  const [user, setUser] = useState(null);
  const [loggedIn, setloggedIn] = useState(false);
  const [userInfo, setuserInfo] = useState([]);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.idToken || userInfo.data?.idToken || userInfo.user?.idToken;

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const firebaseUserCredential = await auth.signInWithCredential(googleCredential);
      console.log("Firebase User Credential:", firebaseUserCredential);

    } catch (error) {
      console.error("Google Sign-In Full Error:", error);
      alert(`Error: ${error.code} - ${error.message}`);

      // console.error("Google Sign-In Error:", JSON.stringify(error, null, 2) || error);
  
      // if (!error) {
      //   alert("Unknown error: error object is null or undefined");
      //   return;
      // }
  
      // // If the error is an object but empty
      // if (Object.keys(error).length === 0) {
      //   alert("Unexpected error object is empty {}");
      //   return;
      // }
  
      // // Ensure `error.code` exists before accessing it
      // if (typeof error === "object" && "code" in error) {
      //   switch (error.code) {
      //     case statusCodes.SIGN_IN_CANCELLED:
      //       alert("Sign-in cancelled");
      //       break;
      //     case statusCodes.IN_PROGRESS:
      //       alert("Sign-in in progress");
      //       break;
      //     case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
      //       alert("Google Play Services not available");
      //       break;
      //     default:
      //       alert("Something went wrong: " + error.message);
      //   }
      // } else {
      //   alert("Unexpected error format: " + JSON.stringify(error));
      // }
    }
  };
  
  function onAuthStateChanged(user) {
    setUser(user);
    console.log(user);
    if (user) setloggedIn(true);
  }
  useEffect(() => {
  GoogleSignin.configure({
    scopes: ['email', 'profile'], // what API you want to access on behalf of the user, default is email
    webClientId:
      '1046922751971-19gaitfr88fae6n03psh3ppbqgqrbs94.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
    offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  });
  const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
  return subscriber; // unsubscribe on unmount
  }, []);

  const handleSignOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      auth
        .signOut()
        .then(() => alert('Your are signed out!'));
      setloggedIn(false);
      // setuserInfo([]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <Header />

          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              {!loggedIn && (
                <GoogleSigninButton
                  style={{width: 192, height: 48}}
                  size={GoogleSigninButton.Size.Wide}
                  color={GoogleSigninButton.Color.Dark}
                  onPress={handleGoogleSignIn}
                />
              )}
            </View>
            <View style={styles.buttonContainer}>
              {!user ? (
                <Text>You are currently logged out</Text>
              ) : (
                <View>
                  <Text>Welcome {user.displayName}</Text>
                  <Text>Email: {user.email}</Text> 
                  <Button
                    onPress={handleSignOut}
                    title="LogOut"
                    color="red" />
                </View>
              )}
            </View>
            <View>
                  <Button
                    onPress={handleSignOut}
                    title="LogOut"
                    color="red" />
                </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonContainer: {
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});