
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { data, type User } from "@/lib/data";
import { useRouter } from "next/navigation";


interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    login: (email: string, password?: string) => Promise<void>;
    logout: () => void;
    switchUser: (userId: string) => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded passwords for simulation. In a real app, never do this.
const MOCK_PASSWORDS: Record<string, string> = {
    "rishi.404@outlook.com": "password123",
    "tony@stark.com": "password123",
    "pepper@stark.com": "password123",
    "bruce@wayne.com": "password123",
    "lucius@wayne.com": "password123",
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUserDoc = async (fbUser: FirebaseUser | null): Promise<User | null> => {
         if (!fbUser) return null;
         const userDocRef = doc(db, "users", fbUser.uid);
         const userDoc = await getDoc(userDocRef);
         if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as User;
            setUser(userData);
            // Redirect any user if PIN is not set
            if (!userData.pinSet) {
                router.push('/set-pin');
            }
            return userData;
         }
         return null;
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);
            if (fbUser) {
                await fetchUserDoc(fbUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password?: string) => {
        // Use provided password, or a mock one if in a dev environment and password is not provided
        const pass = password || MOCK_PASSWORDS[email];
        if (!pass) {
            throw new Error("Password is required.");
        }
        await signInWithEmailAndPassword(auth, email, pass);
        // User fetching and redirection is now handled by onAuthStateChanged
    };
    
    const switchUser = async (email: string) => {
        // In a real app, this would be a more secure process
        await signOut(auth);
        await login(email); // This will use the mock password
    };

    const logout = async () => {
        await signOut(auth);
    };

    const refreshUser = async () => {
        if (auth.currentUser) {
            await fetchUserDoc(auth.currentUser);
        }
    }


    return (
        <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout, switchUser, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
