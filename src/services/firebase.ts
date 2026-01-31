// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import type { DocumentData } from 'firebase/firestore'
import { getAuth } from "firebase/auth";


// Remplace avec tes infos Firebase (trouvables dans la console Firebase)
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
const db = getFirestore(app);
const auth = getAuth(app)


export async function fetchAirports(): Promise<DocumentData[]> {
  const airportsCol = collection(db, "airports");
  const snapshot = await getDocs(airportsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export { db, auth };


