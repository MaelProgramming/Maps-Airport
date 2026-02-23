import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import type { Floor, Position, Airport} from "../types/types";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBZRx3Bh7l5JIzzz1w76LkWaplBX9GcGbE",
  authDomain: "mapsairport-2025.firebaseapp.com",
  projectId: "mapsairport-2025",
  storageBucket: "mapsairport-2025.firebasestorage.app",
  messagingSenderId: "1003048235306",
  appId: "1:1003048235306:web:90dafe4766308bad90ae53",
  measurementId: "G-BNJN0TG7N1"
};

const position: Position = {
  latitude:40.4839,
  longitude:-3.5680
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exemple d'aéroport
const madridBarajas: { 
  id: string, name: string, position: Position,  floors: Floor[] } = {
  id: "mad-barajas",
  name: "Adolfo Suárez Madrid-Barajas (T4)",
  position: position,

  floors: [
    {
      level: 0,
      name: "Arrivées (P0)",
      areas: [
        {
          id: "baggage-claim-t4",
          name: "Zone de récupération des bagages",
          type: "hall",
          shape: [
            { x: 0, y: 0 }, { x: 500, y: 0 }, { x: 500, y: 150 }, { x: 0, y: 150 }, { x: 0, y: 0 }
          ],
        }
      ],
      markers: [
        {
          id: "taxi-stand",
          name: "Station de Taxi",
          type: "facility",
          position: { x: 250, y: 180 },
        },
      ],
    },
    {
      level: 1,
      name: "Départs (P1)",
      areas: [
        {
          id: "duty-free-main",
          name: "World Duty Free",
          type: "shop",
          shape: [
            { x: 100, y: 50 }, { x: 300, y: 50 }, { x: 300, y: 120 }, { x: 100, y: 120 }, { x: 100, y: 50 }
          ],
        },
        {
          id: "lounge-velazquez",
          name: "Sala VIP Velázquez",
          type: "lounge",
          shape: [
            { x: 400, y: 20 }, { x: 480, y: 20 }, { x: 480, y: 80 }, { x: 400, y: 80 }, { x: 400, y: 20 }
          ],
        }
      ],
      markers: [
        {
          id: "gate-j50",
          name: "Porte J50",
          type: "gate",
          position: { x: 50, y: 200 },
        },
        {
          id: "starbucks-t4",
          name: "Starbucks",
          type: "shop",
          position: { x: 320, y: 70 },
        },
      ],
    },
  ],
};
// Fonction pour uploader l'aéroport
async function uploadAirport(airport: Airport) { 
  try {
    const airportRef = doc(db, "airports", airport.id);
    await setDoc(airportRef, airport);
    console.log(`✅ [Maps Airport] ${airport.name} est en ligne !`);
  } catch (e) {
    console.error("❌ Erreur Firebase :", e);
  }
}

// Upload
uploadAirport(madridBarajas).catch(console.error);
