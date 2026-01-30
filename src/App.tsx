import React, { useEffect, useState } from "react";
import { IndoorMapEngine } from "./engine/IndoorMapEngine";
import type { Airport } from "./engine/IndoorMapEngine";
import { fetchAirports } from "./services/firebase"; // notre service Firebaseç


function App(): React.JSX.Element {
  const [airports, setAirports] = useState<Record<string, Airport>>({});
  const [currentAirportKey, setCurrentAirportKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAirports() {
      try {
        const airportsFromFirestore = await fetchAirports();

        // On transforme le tableau Firestore en record avec id comme clé
        const airportsRecord: Record<string, Airport> = {};
        (airportsFromFirestore as Airport[]).forEach((airport: Airport) => {
          airportsRecord[airport.id] = airport;
        });

        setAirports(airportsRecord);

        // Aéroport par défaut
        const firstKey = Object.keys(airportsRecord)[0];
        setCurrentAirportKey(firstKey);
        setLoading(false);
      } catch (err) {
        console.error("Erreur fetch airports", err);
        setLoading(false);
      }
    }

    loadAirports();
  }, []);

  if (loading) return <p>Chargement des aéroports...</p>;
  if (!currentAirportKey) return <p>Aucun aéroport trouvé</p>;

  return (
    <div>
      {/* Sélecteur d'aéroport */}
      <div style={{ marginBottom: 12 }}>
        {Object.entries(airports).map(([key, airport]) => (
          <button
            key={key}
            onClick={() => setCurrentAirportKey(key)}
            style={{
              marginRight: 8,
              padding: "6px 12px",
              cursor: "pointer",
              background: key === currentAirportKey ? "#333" : "#ddd",
              color: key === currentAirportKey ? "#fff" : "#000",
              border: "none",
              borderRadius: 4
            }}
          >
            {airport.name}
          </button>
        ))}
      </div>

      {/* Moteur de map */}
      <IndoorMapEngine airport={airports[currentAirportKey]} />
    </div>
  );
}

export default App;
