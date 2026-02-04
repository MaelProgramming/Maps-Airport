import React, { useEffect, useState } from "react";
import { IndoorMapEngine } from "./engine/IndoorMapEngine";
import type { Airport } from "./types/types";
import { fetchAirports } from "./services/firebase";
import { useAuth } from "./contexts/AuthContext";
import { loginWithGoogle, logout, loginAnonymously } from "./hooks/useAuth"; 

function App(): React.JSX.Element {
  const [airports, setAirports] = useState<Record<string, Airport>>({});
  const { user, loading: authLoading } = useAuth();
  const [currentAirportKey, setCurrentAirportKey] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // 1. Login anonyme automatique dès que l'auth est prête et qu'aucun user n'est là
  useEffect(() => {
    if (!authLoading && !user) {
      loginAnonymously().catch((err) => 
        console.error("Échec de la connexion silencieuse:", err)
      );
    }
  }, [user, authLoading]);

  // 2. Chargement des données des aéroports
  useEffect(() => {
    async function loadData() {
      try {
        const airportsList = await fetchAirports();
        
        if (airportsList.length > 0) {
          const airportsRecord = airportsList.reduce((acc, airport) => {
            acc[airport.id] = airport;
            return acc;
          }, {} as Record<string, Airport>);

          setAirports(airportsRecord);
          // Sélection par défaut (Barajas ou le premier de la liste)
          setCurrentAirportKey(airportsList[0].id);
        }
      } catch (err) {
        console.error("Erreur chargement aéroports:", err);
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, []);

  // --- RENDU DES ÉTATS DE CHARGEMENT ---

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-gray-500 font-medium">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="animate-pulse">Maps Airport se prépare...</div>
        </div>
      </div>
    );
  }

  // Si l'auth auto a foiré (ex: pas d'internet), on affiche l'écran de secours
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 px-4 text-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900">Oups !</h1>
        <p className="text-gray-600">Impossible de vous connecter automatiquement.</p>
        <button
          onClick={() => loginAnonymously()}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold w-full max-w-xs"
        >
          Réessayer la connexion rapide
        </button>
      </div>
    );
  }

  if (!currentAirportKey || !airports[currentAirportKey]) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 font-bold">
        Erreur : Aucun aéroport disponible dans la base.
      </div>
    );
  }

  // --- RENDU DE L'APPLICATION ---

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

        <div className="flex items-center gap-2">
          {/* Si l'user est anonyme, Eliot peut vouloir afficher un bouton de "Promotion" Google */}
          {user.isAnonymous && (
            <button 
              onClick={loginWithGoogle}
              className="px-3 py-2 text-[10px] bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-100 hidden sm:block"
            >
              Lier Google
            </button>
          )}
          <button
            onClick={logout}
            className="px-3 py-2 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition"
          >
            Quitter
          </button>
        </div>
      </header>

      <main className="flex-1 relative w-full overflow-hidden bg-gray-100">
        <IndoorMapEngine airport={airports[currentAirportKey]} />
      </main>
    </div>
  );
}

export default App;