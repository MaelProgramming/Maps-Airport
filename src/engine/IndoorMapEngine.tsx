import React, { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Timestamp } from "firebase/firestore";

// Hooks et Contextes
import { useAuth } from "../contexts/AuthContext";
import { useAirportReports } from "../hooks/useAirportReports"; // Ton nouveau hook

// Composants et Types
import { MapMarker } from "./MapMarker"; // Ton nouveau composant
import type { Marker, UserReport, Props } from "../types/types";

export const IndoorMapEngine: React.FC<Props> = ({ airport }) => {
  const { user } = useAuth();
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [activeMarker, setActiveMarker] = useState<Marker | null>(null);

  // Utilisation du hook custom : toute la logique Firebase est là-dedans
  const { reportsMap, sendReport, voteForReport } = useAirportReports(airport.id);

  const floor = airport.floors.find((f) => f.level === selectedFloor);

  if (!floor) return <p className="p-4 text-center text-gray-500">Étage introuvable</p>;

  // --- LOGIQUE DE COLLISION & DATA ---
  
  // Clé pour le lookup dans la Map
  const getMarkerKey = (pos: { x: number; y: number }) => 
    `${Math.floor(pos.x / 5)},${Math.floor(pos.y / 5)}`;

  // Trouver l'incident sur le marqueur sélectionné via la Map (O(1))
  const activeReport = activeMarker ? reportsMap.get(getMarkerKey(activeMarker.position)) : undefined;

  const hasUpvoted = activeReport?.upvotes?.includes(user?.uid || '');
  const hasDownvoted = activeReport?.downvotes?.includes(user?.uid || '');

  // --- HANDLERS ---

  const handleReport = async (type: UserReport['type']) => {
    if (!activeMarker || !user) return;
    try {
      await sendReport({
        airportId: airport.id,
        floorLevel: selectedFloor,
        type,
        severity: 3,
        position: activeMarker.position,
        timestamp: Timestamp.now(),
        userId: user.uid,
        upvotes: [],
        downvotes: []
      });
      setActiveMarker(null);
    } catch (err) {
      console.error("Erreur signalement:", err);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white overflow-hidden">
      
      {/* Sélecteur d'étage */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <h2 className="text-sm font-bold bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm border border-gray-200">
          {floor.name}
        </h2>
        {airport.floors.map((f) => (
          <button
            key={f.level}
            onClick={() => { setSelectedFloor(f.level); setActiveMarker(null); }}
            className={`px-3 py-2 rounded-lg text-xs font-bold shadow transition-all border ${
              f.level === selectedFloor ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}
          >
            Niv. {f.level}
          </button>
        ))}
      </div>

      {/* Tooltip de l'incident */}
      {activeMarker && (
        <div className="absolute z-30 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 w-60 animate-in fade-in zoom-in duration-200"
             style={{ bottom: "20px", left: "50%", transform: "translateX(-50%)" }}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900">{activeMarker.name}</h3>
            <button onClick={() => setActiveMarker(null)} className="text-gray-400 p-1">✕</button>
          </div>

          {!activeReport ? (
            <button onClick={() => handleReport('traffic')} className="w-full py-2 bg-orange-500 text-white text-xs font-bold rounded-lg mt-4">
              ⚠️ Signaler un bouchon
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="p-2 bg-orange-50 rounded-lg border border-orange-100 text-center">
                <p className="text-[10px] text-orange-700 font-bold uppercase">Incident en cours</p>
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => voteForReport(activeReport.id, user!.uid, true)}
                    className={`flex-1 py-2 border rounded-lg text-[10px] font-bold transition-all ${
                      hasUpvoted ? "bg-green-500 text-white" : "bg-white text-green-600"
                    }`}
                  >
                    {hasUpvoted ? "Confirmé ✓" : `C'est vrai (${activeReport.upvotes?.length || 0})`}
                  </button>
                  <button 
                    onClick={() => voteForReport(activeReport.id, user!.uid, false)}
                    className={`flex-1 py-2 border rounded-lg text-[10px] font-bold transition-all ${
                      hasDownvoted ? "bg-red-500 text-white" : "bg-white text-red-600"
                    }`}
                  >
                    {hasDownvoted ? "Fini ✓" : `Fini (${activeReport.downvotes?.length || 0})`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Moteur de Map SVG */}
      <div className="flex-1 w-full h-full bg-gray-50" onClick={() => setActiveMarker(null)}>
        <TransformWrapper initialScale={1} centerOnInit={true}>
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            <svg viewBox="0 0 800 600" className="w-full h-full touch-none">
              {/* Rendu des zones (statique) */}
              {floor.areas.map((area) => (
                <polygon 
                  key={area.id} 
                  points={area.shape.map((p) => `${p.x},${p.y}`).join(" ")} 
                  fill={area.type === "hall" ? "#dbeafe" : "#fce7f3"} 
                  stroke="#94a3b8" 
                />
              ))}

              {/* Rendu des marqueurs (optimisé via MapMarker) */}
              {floor.markers.map((marker) => (
                <MapMarker 
                  key={marker.id}
                  marker={marker}
                  report={reportsMap.get(getMarkerKey(marker.position))}
                  isActive={activeMarker?.id === marker.id}
                  onClick={(e) => { e.stopPropagation(); setActiveMarker(marker); }}
                />
              ))}
            </svg>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
};