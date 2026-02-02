import React, { useEffect, useState } from "react";
import { IndoorMapEngine } from "./engine/IndoorMapEngine";
import type { Airport } from "./types/types";
import { fetchAirports } from "./services/firebase";
import { useAuth } from "./contexts/AuthContext";
// Attention : vérifie si loginWithGoogle/logout sont dans hooks ou services
import { loginWithGoogle, logout } from "./hooks/useAuth"; 

function App(): React.JSX.Element {
  const [airports, setAirports] = useState<Record<string, Airport>>({});
  const { user } = useAuth();
  const [currentAirportKey, setCurrentAirportKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // fetchAirports renvoie déjà un Airport[] grâce à notre correction précédente
        const airportsList = await fetchAirports();
        
        if (airportsList.length > 0) {
          const airportsRecord = airportsList.reduce((acc, airport) => {
            acc[airport.id] = airport;
            return acc;
          }, {} as Record<string, Airport>);

          setAirports(airportsRecord);
          // On sélectionne le premier aéroport par défaut (ex: Barajas)
          setCurrentAirportKey(airportsList[0].id);
        }
      } catch (err) {
        console.error("Erreur chargement aéroports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Early returns pour plus de clarté (pattern classique de dev)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-gray-500 font-medium">
        <div className="animate-pulse">Chargement de Maps Airport...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 px-4 text-center bg-gray-50">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur Maps Airport</h1>
          <p className="text-gray-600">Évite les bouchons au terminal en un clic.</p>
        </div>
        <button
          onClick={loginWithGoogle}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold w-full max-w-xs"
        >
          Se connecter avec Google
        </button>
      </div>
    );
  }

  if (!currentAirportKey || !airports[currentAirportKey]) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 font-bold">
        Erreur : Aucun aéroport disponible.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-white">
      <header className="flex items-center justify-between p-3 border-b bg-white shadow-sm z-50">
        <div className="flex overflow-x-auto no-scrollbar gap-2 flex-1 mr-4">
          {Object.values(airports).map((airport) => {
            const isActive = airport.id === currentAirportKey;
            return (
              <button
                key={airport.id}
                onClick={() => setCurrentAirportKey(airport.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                  isActive 
                    ? "bg-gray-900 text-white border-gray-900 shadow-md" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {airport.name}
              </button>
            );
          })}
        </div>

        <button
          onClick={logout}
          className="px-3 py-2 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition"
        >
          Déconnexion
        </button>
      </header>

      <main className="flex-1 relative w-full overflow-hidden bg-gray-100">
        <IndoorMapEngine airport={airports[currentAirportKey]} />
      </main>
    </div>
  );
}

export default App;