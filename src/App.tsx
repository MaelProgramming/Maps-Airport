import React, { useEffect, useState } from "react";
import { IndoorMapEngine } from "./engine/IndoorMapEngine";
import type { Airport } from "./engine/IndoorMapEngine";
import { fetchAirports } from "./services/firebase";

function App(): React.JSX.Element {
  const [airports, setAirports] = useState<Record<string, Airport>>({});
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Chargement des aéroports…
      </div>
    );

  if (!currentAirportKey)
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Aucun aéroport trouvé
      </div>
    );

  return (
    <div className="flex flex-col h-screen">
      {/* Sélecteur d'aéroport */}
      <div className="flex flex-wrap gap-2 p-3 border-b bg-gray-50">
        {Object.entries(airports).map(([key, airport]) => {
          const isActive = key === currentAirportKey;

          return (
            <button
              key={key}
              onClick={() => setCurrentAirportKey(key)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition
                ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }
              `}
            >
              {airport.name}
            </button>
          );
        })}
      </div>

      {/* Moteur de map */}
      <div className="flex-1">
        <IndoorMapEngine airport={airports[currentAirportKey]} />
      </div>
    </div>
  );
}

export default App;
