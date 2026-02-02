import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import type { UserReport, Airport } from "../types/types";

const firebaseConfig = {
  apiKey: "AIzaSyBZRx3Bh7l5JIzzz1w76LkWaplBX9GcGbE",
  authDomain: "mapsairport-2025.firebaseapp.com",
  projectId: "mapsairport-2025",
  storageBucket: "mapsairport-2025.firebasestorage.app",
  messagingSenderId: "1003048235306",
  appId: "1:1003048235306:web:90dafe4766308bad90ae53",
  measurementId: "G-BNJN0TG7N1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Fetch initial des aéroports
export async function fetchAirports(): Promise<Airport[]> {
  const airportsCol = collection(db, "airports");
  const snapshot = await getDocs(airportsCol);
  // On cast ici pour que le reste de ton app soit contente
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Airport));
}

// Envoi d'un signalement "Waze-style"
export const sendReport = async (report: Omit<UserReport, 'id'>) => {
  return await addDoc(collection(db, "reports"), report);
};

// Real-time subscription pour la v1.6
export const subscribeToReports = (airportId: string, callback: (reports: UserReport[]) => void) => {
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  
  const q = query(
    collection(db, "reports"), 
    where("airportId", "==", airportId),
    where("timestamp", ">", twoHoursAgo)
  );

  // Le onSnapshot renvoie une fonction de "unsubscribe" 
  // très utile pour le cleanup dans ton useEffect
  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as UserReport));
    callback(reports);
  });
};

export const voteForReport = async (reportId: string, userId: string, isUpvote: boolean) => {
  const reportRef = doc(db, "reports", reportId);

  if (isUpvote) {
    // On ajoute l'utilisateur aux upvotes et on le retire des downvotes au cas où
    await updateDoc(reportRef, {
      upvotes: arrayUnion(userId),
      downvotes: arrayRemove(userId)
    });
  } else {
    // L'inverse pour le downvote
    await updateDoc(reportRef, {
      downvotes: arrayUnion(userId),
      upvotes: arrayRemove(userId)
    });
  }
};