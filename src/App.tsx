import React, { useEffect, useState } from "react";
import { IndoorMapEngine } from "./engine/IndoorMapEngine";

type Airport = any; // on typeras proprement après

function App(): React.JSX.Element {
  const [airports, setAirports] = useState<Record<string, Airport>>({});
  const [currentAirportKey, setCurrentAirportKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://backend-mapsairport.vercel.app")
      .then(res => res.json())
      .then(data => {
        setAirports(data);

        // aéroport par défaut
        const firstKey = Object.keys(data)[0];
        setCurrentAirportKey(firstKey);
      })
      .catch(err => console.error("Erreur fetch airports", err));
  }, []);

  if (!currentAirportKey) {
    return <p>Chargement...</p>;
  }

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
              background:
                key === currentAirportKey ? "#333" : "#ddd",
              color:
                key === currentAirportKey ? "#fff" : "#000",
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
