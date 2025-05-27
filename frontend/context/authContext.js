import {createContext, useContext, useEffect, useState} from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "firebase/auth";
import auth from "../config/firebaseConfig";
import { initializeStreamClient, disconnectStreamClient } from "../services/streamService";
import { requestUserPermission } from "../services/pushNotificationService";
import {onAuthStateChanged, signOut} from "@react-native-firebase/auth";
import {fetchUserData} from "../api/user";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserPassword, setCurrentUserPassword] = useState(null);
    const [streamClient, setStreamClient] = useState(null);
    const [userIdForStream, setUserIdForStream] = useState(null);
    
    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    const userData = await fetchUserData(firebaseUser.uid);
                    const newUser = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        emailVerified: firebaseUser.emailVerified,
                        username: userData?.username || '',
                        profile_pic: userData?.profile_pic || '',
                        status: userData?.status || 'offline',
                        contacts: userData?.contacts || [],
                    };
                    setUser(newUser);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth state change error:", error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Initialize or disconnect Stream client when auth state changes
        if (isAuthenticated && user && user.id && user.id !== userIdForStream) {
            setUserIdForStream(user.id); // Store the ID being used
            initializeStreamClient(user.id)
                .then(client => {
                    setStreamClient(client);
                    // Once client is ready, setup push notifications for this user
                    requestUserPermission(client); // Pass client if needed by the function
                })
                .catch(error => {
                    console.error("AuthContext: Failed to initialize Stream client:", error);
                    // Handle initialization failure if needed
                });
        } else if (!isAuthenticated && streamClient) {
            disconnectStreamClient().then(() => {
                 setStreamClient(null);
                 setUserIdForStream(null);
            });
        }
    }, [isAuthenticated, user, streamClient, userIdForStream]); // Add dependencies


    const handleSignIn = async (email, password) => {
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            setCurrentUserPassword(password);
            return {
                success: true,
                uid: credential.user.uid,
            };

        } catch (e) {
            let message = e.message;

            if (message.includes("(auth/invalid-credential)")) {
                message = "Invalid email or password";
            } else if (message.includes("(auth/user-not-found)")) {
                message = "User not found";
            }

            console.error("Login error:", e);
            return {
                success: false,
                error: message,
            };
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            return {success: true, data: "User signed out successfully!"};
        }catch (e){
            return {success: false, data: e.message};

        }
    }

    const handleSignUp = async (username, email, password) => {
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);

            const id = response.user.uid;
            const full_name = username;
            const userData = {
                id,
                username,
                full_name,
                profile_pic: "https://www.gravatar.com/avatar/?d=identicon",
                status: "Active",
                contacts: [],
                created_at: new Date().toISOString()
            };
            await fetch('http://10.0.2.2:5000/api/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            await sendEmailVerification(response.user);

            return {
                success: true,
                message: "Account created successfully! \nA verification link has been sent to your email. Please verify your email and log in."
            };

            }catch (e){
            let message = e.message;
            if (message.includes("(auth/invalid-email)")) {
                message = "Invalid email";
            }
            if (message.includes("(auth/email-already-in-use)")) {
                message = "Email already in use";
            }
            return {success: false, data: message};
        }
    }

    const handleChangePassword = async (currentPassword, newPassword) => {
        try {
            // Create credential with the current email and password
            const credential = EmailAuthProvider.credential(
                auth.currentUser.email,
                currentPassword
            );

            // Reauthenticate the user
            await reauthenticateWithCredential(auth.currentUser, credential);

            // Now update the password
            await updatePassword(auth.currentUser, newPassword);

            // Update the stored password
            setCurrentUserPassword(newPassword);

            return {success: true, data: "Password changed successfully!"};
        } catch (e) {
            console.log(e);
            // Handle specific error cases
            if (e.code === 'auth/wrong-password') {
                return {success: false, data: "Current password is incorrect"};
            }
            return {success: false, data: e.message};
        }
    }

    return (
        <AuthContext.Provider value={{user, streamClient, isLoading, isAuthenticated, handleSignIn, handleSignOut , handleSignUp, currentUserPassword, handleChangePassword}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const value = useContext(AuthContext);

    if (!value) {
        throw new Error("useAuth must be used within an AuthProvider.");
    }

    return value;
}