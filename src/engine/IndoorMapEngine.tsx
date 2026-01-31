// IndoorMapEngine.tsx
import React, { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export type Marker = {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
};

export type Area = {
  id: string;
  name: string;
  shape: { x: number; y: number }[];
  type: string;
};

export type Floor = {
  level: number;
  name: string;
  areas: Area[];
  markers: Marker[];
};

export type Airport = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  floors: Floor[];
};

export type Props = {
  airport: Airport;
};

// ... (Gardez vos types Marker, Area, Floor, Airport et Props)

export const IndoorMapEngine: React.FC<Props> = ({ airport }) => {
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [activeMarker, setActiveMarker] = useState<Marker | null>(null);

  const floor = airport.floors.find((f) => f.level === selectedFloor);

  if (!floor) return <p className="p-4 text-center">Étage introuvable</p>;

  // Fermer le menu si on change d'étage
  const handleFloorChange = (level: number) => {
    setSelectedFloor(level);
    setActiveMarker(null);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white overflow-hidden">
      
      {/* Sélecteur d'étage (Flottant) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <h2 className="text-sm font-bold bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm border text-gray-800">
          {floor.name}
        </h2>
        {airport.floors.map((f) => (
          <button
            key={f.level}
            onClick={() => handleFloorChange(f.level)}
            className={`px-3 py-2 rounded-lg text-xs font-bold shadow transition-all border ${
              f.level === selectedFloor 
                ? "bg-gray-800 text-white border-gray-800" 
                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Niv. {f.level}
          </button>
        ))}
      </div>

      {/* --- MENU CONTEXTUEL (Tooltip) --- */}
      {activeMarker && (
        <div 
          className="absolute z-30 bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-48 animate-in fade-in zoom-in duration-200"
          style={{
            // Positionnement approximatif au centre pour éviter les calculs de coordonnées SVG complexes sur mobile
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)"
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900">{activeMarker.name}</h3>
            <button 
              onClick={() => setActiveMarker(null)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-2 h-2 rounded-full ${activeMarker.type === 'gate' ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              {activeMarker.type}
            </p>
          </div>
          <button className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition" onClick={() => alert("Pas encore implémenté")}>
            S'y rendre
          </button>
        </div>
      )}

      {/* Moteur de Map */}
      <div className="flex-1 w-full h-full bg-gray-50" onClick={() => setActiveMarker(null)}>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={5}
          centerOnInit={true}
        >
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            <svg
              viewBox="0 0 800 600"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full touch-none"
            >
              {/* Rendu des Zones */}
              {floor.areas.map((area) => (
                <polygon
                  key={area.id}
                  points={area.shape.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill={area.type === "hall" ? "#dbeafe" : "#fce7f3"}
                  stroke="#94a3b8"
                  strokeWidth={1}
                />
              ))}

              {/* Rendu des Marqueurs */}
              {floor.markers.map((marker) => (
                <g 
                  key={marker.id} 
                  cursor="pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // Empêche la fermeture immédiate
                    setActiveMarker(marker);
                  }}
                >
                  {/* Halo d'interaction pour mobile */}
                  <circle cx={marker.position.x} cy={marker.position.y} r={20} fill="transparent" />
                  
                  {/* Le marqueur visible */}
                  <circle
                    cx={marker.position.x}
                    cy={marker.position.y}
                    r={activeMarker?.id === marker.id ? 12 : 8}
                    fill={marker.type === "gate" ? "#22c55e" : "#ef4444"}
                    stroke="white"
                    strokeWidth={2}
                    className="transition-all duration-200 shadow-lg"
                  />
                </g>
              ))}
            </svg>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
};