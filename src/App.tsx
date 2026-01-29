import React, { useState, useEffect } from 'react';
import './App.css';
import { IndoorMapEngine } from './IndoorMapEngine';

function App(): React.JSX.Element {
  const [airportData, setAirportData] = useState<any | null>(null);

  useEffect(() => {
    async function fetchAirport() {
      try {
        const res = await fetch("/api");
        const data = await res.json();
        setAirportData(data);
      } catch (err) {
        console.error("Erreur lors du fetch :", err);
      }
    }

    fetchAirport();
  }, []);

  if (!airportData) {
    return <p>Chargement de la carte...</p>;
  }

  return (
    <div>
      <IndoorMapEngine airport={airportData} />
    </div>
  );
}

export default App;
