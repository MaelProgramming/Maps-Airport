import { GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously } from "firebase/auth";
import { auth  } from "../services/firebase";


// Importer le Google Provider
const provider = new GoogleAuthProvider();

// Fonctions Auth
export const loginWithGoogle = async () => {
    return await signInWithPopup(auth, provider)
}

export const logout = async () => {
    return await signOut(auth)
}

export const loginAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Erreur auth anonyme:", error);
  }
};