import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../services/firebase";


// Importer le Google Provider
const provider = new GoogleAuthProvider();

// Fonctions Auth
export const loginWithGoogle = async () => {
    return await signInWithPopup(auth, provider)
}

export const logout = async () => {
    return await signOut(auth)
}
