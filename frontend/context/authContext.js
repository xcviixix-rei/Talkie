import {createContext, useEffect, useState, useContext} from "react";

import {signInWithEmailAndPassword, createUserWithEmailAndPassword,} from "firebase/auth";
import  auth  from "../config/firebaseConfig";
import {onAuthStateChanged, signOut} from "@react-native-firebase/auth";
import {doc, addDoc, getDoc, setDoc, getDocs, collection} from "firebase/firestore";
import db from "../config/firebaseConfig";

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
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in!");
        }catch (e){
            let message = e.message;
            if (message.includes("(auth/invalid-credential)")) {
                message = "Invalid email or password";
            }
            return {success: false, data: message};
        }
    }

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
            console.log("User registered successfully!");

            await setDoc(doc(db, "users", response?.user?.uid), {
                username,
                userId: response?.user?.uid,
            });
            return {success: true, data: response?.user};
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