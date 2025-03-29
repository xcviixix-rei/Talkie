import {createContext, useEffect, useState, useContext} from "react";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword,} from "firebase/auth";
import  auth  from "../config/firebaseConfig";
import {onAuthStateChanged, signOut} from "@react-native-firebase/auth";


export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                setUser(user);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        });

        // Cleanup subscription khi component unmount
        return () => unsubscribe();
    }, []); // Dependency array rỗng để chạy một lần khi mount

    const handleSignIn = async (email, password) => {
        try {
            // 1. Sign in with Firebase Authentication
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in successfully!", response);

            // 2. Get the user's unique ID from Firebase
            const userId = response.user.uid;

            // 3. Fetch user info from your backend API
            const apiResponse = await fetch(`http://localhost:5000/api/users/${userId}`,
                {
                    method: 'GET',
                });

            if (!apiResponse.ok) {
                throw new Error(`Failed to fetch user data: ${apiResponse.status}`);
            }

            const userData = await apiResponse.json();
            console.log("User data fetched successfully!", userData);

            // 4. Return success with user data
            return {
                success: true,
                data: {
                    message: "Login successful",
                    user: userData
                }
            };

        } catch (e) {
            let message = e.message;

            // Handle common Firebase errors
            if (message.includes("(auth/invalid-credential)")) {
                message = "Invalid email or password";
            } else if (message.includes("(auth/user-not-found)")) {
                message = "User not found";
            } else if (message.includes("(auth/wrong-password)")) {
                message = "Incorrect password";
            } else if (message.includes("(auth/too-many-requests)")) {
                message = "Too many attempts. Try again later";
            } else if (message.includes("(auth/user-disabled)")) {
                message = "This account has been disabled";
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
            console.log(response);
            console.log("User registered successfully!");
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
            const apiResponse = await fetch('http://localhost:5000/api/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            if (!apiResponse.ok) {
                throw new Error(`API Error: ${apiResponse.status}`);
            }


            // 4. Return success if everything worked
            return {
                success: true, data: "User registered successfully!"
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