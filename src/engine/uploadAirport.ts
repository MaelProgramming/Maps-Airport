import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exemple d'aéroport
const airportGruand = {
    id: "gruand-airport",
    name: "Aéroport de Gruand",
    latitude: 48.8566,
    longitude: 2.3522,

    floors: [
      {
        level: 0,
        name: "Rez-de-chaussée",
        areas: [
          {
            id: "hall1",
            name: "Hall principal",
            type: "hall",
            shape: [
              { x: 50, y: 50 },
              { x: 300, y: 50 },
              { x: 300, y: 200 },
              { x: 50, y: 200 },
              { x: 50, y: 50 },
            ],
          },
          {
            id: "shop1",
            name: "Boutique duty-free",
            type: "shop",
            shape: [
              { x: 320, y: 60 },
              { x: 400, y: 60 },
              { x: 400, y: 150 },
              { x: 320, y: 150 },
              { x: 320, y: 60 },
            ],
          },
        ],
        markers: [
          {
            id: "gate-a1",
            name: "Porte A1",
            type: "gate",
            position: { x: 100, y: 100 },
          },
          {
            id: "toilet-0",
            name: "Toilettes",
            type: "facility",
            position: { x: 250, y: 150 },
          },
        ],
      },

      {
        level: 1,
        name: "Étage 1",
        areas: [
          {
            id: "vip-lounge",
            name: "Salon VIP",
            type: "hall",
            shape: [
              { x: 50, y: 50 },
              { x: 300, y: 50 },
              { x: 300, y: 200 },
              { x: 50, y: 200 },
              { x: 50, y: 50 },
            ],
          },
        ],
        markers: [
          {
            id: "gate-b1",
            name: "Porte B1",
            type: "gate",
            position: { x: 100, y: 100 },
          },
          {
            id: "cafe-1f",
            name: "Café",
            type: "shop",
            position: { x: 200, y: 150 },
          },
        ],
      },
    ],
  };
// Fonction pour uploader l'aéroport
async function uploadAirport(airport: typeof airportGruand) {
  await setDoc(doc(db, "airports", airport.id), airport);
  console.log(`Airport ${airport.name} uploaded!`);
}

// Upload
uploadAirport(airportGruand).catch(console.error);
