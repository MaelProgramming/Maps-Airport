import {  
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import type { UserReport, Airport } from "../types/types";
import { app } from "./firebaseConfig";

const auth = getAuth(app);

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
})

// Fetch initial des aéroports
async function fetchAirports(): Promise<Airport[]> {
  const airportsCol = collection(db, "airports");
  const snapshot = await getDocs(airportsCol);
  // On cast ici pour que le reste de ton app soit contente
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Airport));
}

// Envoi d'un signalement "Waze-style"
const sendReport = async (report: Omit<UserReport, 'id'>) => {
  return await addDoc(collection(db, "reports"), report);
};

// Real-time subscription pour la v1.6
const subscribeToReports = (airportId: string, callback: (reports: UserReport[]) => void) => {
  // 1. Convertir le JS Date en Timestamp Firestore
  const dateThreshold = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const firestoreTimestamp = Timestamp.fromDate(dateThreshold);
  
  const q = query(
    collection(db, "reports"), 
    where("airportId", "==", airportId),
    where("timestamp", ">", firestoreTimestamp) // Là, Firebase comprend la comparaison
  );

  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        // Optionnel: s'assurer que le timestamp est bien un Timestamp et pas un objet bizarre
        timestamp: data.timestamp 
      } as UserReport;
    });
    callback(reports);
  });
};

const voteForReport = async (reportId: string, userId: string, isUpvote: boolean) => {
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

export { fetchAirports, sendReport, subscribeToReports, voteForReport, db, auth };
