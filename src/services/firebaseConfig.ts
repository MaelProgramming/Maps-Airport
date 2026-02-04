import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBZRx3Bh7l5JIzzz1w76LkWaplBX9GcGbE",
  authDomain: "mapsairport-2025.firebaseapp.com",
  projectId: "mapsairport-2025",
  storageBucket: "mapsairport-2025.firebasestorage.app",
  messagingSenderId: "1003048235306",
  appId: "1:1003048235306:web:90dafe4766308bad90ae53",
  measurementId: "G-BNJN0TG7N1"
};
const app = initializeApp(firebaseConfig)

export { app }
