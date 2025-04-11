import {createContext, useContext, useEffect, useState} from "react";
import auth from "../config/firebaseConfig";
import {onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "@react-native-firebase/auth";


export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    const userData = await fetchUserData(firebaseUser.uid);
                    const newUser = {
                        uid: firebaseUser.uid,
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


    const fetchUserData = async (userID) => {
        try {
            const response = await fetch(`http://10.0.2.2:5000/api/users/${userID}`,
                {
                    method: 'GET',
                });
            return await response.json();
        } catch (error) {
            console.error("Fetch user data failed:", error);
            return {};
        }
    };

    const handleSignIn = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return {
                success: true,
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

            return {
                success: true
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

    return (
        <AuthContext.Provider value={{user, isAuthenticated, handleSignIn, handleSignOut , handleSignUp}}>
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