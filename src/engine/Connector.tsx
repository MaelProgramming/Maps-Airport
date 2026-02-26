import React, { useEffect, useState } from "react";
import type { Airport } from "../types/types";
import { IndoorMapEngine } from "./IndoorMapEngine";

export default function Connector(): React.JSX.Element {
  const [airport, setAirport] = useState<Airport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFullData = async () => {
      try {
        // Un seul fetch récupère maintenant le nom, la position ET tous les floors
        const response = await fetch('https://backend-mapsairport.vercel.app/api/airport/mad-barajas');
        
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        const data = await response.json();
        
        // Debug : regarde dans ta console Nox/Chrome, tu dois voir l'objet complet
        console.log("Melio Data Loaded:", data);
        
        setAirport(data);
      } catch (err: any) {
        console.error("Melio Debug Error:", err.message);
        setError(err.message);
      }
    };

    fetchFullData();
  }, []);

  if (error) return (
    <div className="flex items-center justify-center h-screen text-red-500 font-bold">
      Erreur : {error}
    </div>
  );

  if (!airport) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Chargement de Melio...
          </p>
        </div>
      </div>
    );
  }

  // Ici 'airport' contient déjà 'floors' avec ses 'areas' et 'markers'
  return <IndoorMapEngine airport={airport} />;
}