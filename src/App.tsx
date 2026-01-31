import React, { useEffect, useState } from "react";
import { IndoorMapEngine } from "./engine/IndoorMapEngine";
import type { Airport } from "./engine/IndoorMapEngine";
import { fetchAirports } from "./services/firebase";
import { useAuth } from "./contexts/AuthContext";
import { loginWithGoogle, logout } from "./hooks/useAuth";

function App(): React.JSX.Element {
  const [airports, setAirports] = useState<Record<string, Airport>>({});
  const { user } = useAuth();
  const [currentAirportKey, setCurrentAirportKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAirports() {
      try {
        const airportsFromFirestore = await fetchAirports();
        const airportsRecord: Record<string, Airport> = {};
        (airportsFromFirestore as Airport[]).forEach((airport: Airport) => {
          airportsRecord[airport.id] = airport;
        });
        setAirports(airportsRecord);
        const firstKey = Object.keys(airportsRecord)[0];
        setCurrentAirportKey(firstKey);
      } catch (err) {
        console.error("Erreur fetch airports", err);
      } finally {
        setLoading(false);
      }
    }
    loadAirports();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-gray-500">
      Chargement des aéroports…
    </div>
  );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-4 text-center">
        <p className="text-gray-700">Connecte-toi pour accéder à Maps Airport</p>
        <button
          onClick={loginWithGoogle}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full max-w-xs font-semibold"
        >
          Se connecter avec Google
        </button>
      </div>
    );
  }

  if (!currentAirportKey) return (
    <div className="flex items-center justify-center h-screen text-red-500">
      Aucun aéroport trouvé
    </div>
  );

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-white">
      {/* Barre de navigation supérieure responsive */}
      <header className="flex flex-wrap items-center justify-between p-2 sm:p-4 border-b bg-gray-50 gap-2">
        {/* Liste des aéroports (scroll horizontal sur mobile) */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 flex-1 mr-2">
          {Object.entries(airports).map(([key, airport]) => {
            const isActive = key === currentAirportKey;
            return (
              <button
                key={key}
                onClick={() => setCurrentAirportKey(key)}
                className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  isActive ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {airport.name}
              </button>
            );
          })}
        </div>

        {/* Bouton Déconnexion - Plus discret sur mobile */}
        <button
          onClick={logout}
          className="px-3 py-1.5 bg-red-500 text-white text-xs sm:text-sm rounded-md hover:bg-red-600 transition"
        >
          Déconnexion
        </button>
      </header>

      {/* Zone de la Carte - Prend tout l'espace restant */}
      <main className="flex-1 relative w-full overflow-hidden bg-gray-100">
        <IndoorMapEngine airport={airports[currentAirportKey]} />
      </main>
    </div>
  );
}

export default App;