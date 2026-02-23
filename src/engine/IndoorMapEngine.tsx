import React, { useState, useEffect, useMemo } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { subscribeToReports, sendReport, voteForReport } from "../services/firebase"; 
import { useAuth } from "../contexts/AuthContext";
import type { Marker, UserReport, Props } from "../types/types";
import { Timestamp } from "firebase/firestore";

export const IndoorMapEngine: React.FC<Props> = ({ airport }) => {
  const { user } = useAuth();
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [activeMarker, setActiveMarker] = useState<Marker | null>(null);
  const [reports, setReports] = useState<UserReport[]>([]);

  const floor = airport.floors.find((f) => f.level === selectedFloor);

  // 1. Subscription temps réel aux incidents
  useEffect(() => {
    console.log("Subscribing to reports for airport:", airport.id);
    const unsubscribe = subscribeToReports(airport.id, (data) => {
      console.log("Reports reçus de Firebase:", data.length);
      setReports(data);
    });
    return () => unsubscribe();
  }, [airport.id]);

  // 2. Indexation ultra-rapide des reports par position arrondie
  // On crée une map type "x-y": report pour que le SVG n'ait pas à chercher
  const indexedReports = useMemo(() => {
    const index: Record<string, UserReport> = {};
    reports.forEach(r => {
      const key = `${Math.round(r.position.x)}-${Math.round(r.position.y)}`;
      index[key] = r;
    });
    return index;
  }, [reports]);

  if (!floor) return <p className="p-4 text-center text-gray-500">Étage introuvable</p>;

  // Helpers de score
  const getReportScore = (report: UserReport) => 
    (report.upvotes?.length || 0) - (report.downvotes?.length || 0);

  // Trouver l'incident sur le marqueur sélectionné (via l'index)
  const activeReport = activeMarker 
    ? indexedReports[`${Math.round(activeMarker.position.x)}-${Math.round(activeMarker.position.y)}`]
    : null;

  const hasUpvoted = activeReport?.upvotes?.includes(user?.uid || '');
  const hasDownvoted = activeReport?.downvotes?.includes(user?.uid || '');

  // 3. Handler de signalement
  const handleReport = async (type: UserReport['type']) => {
    if (!activeMarker || !user) return;

    try {
      console.log("Envoi du signalement...");
      await sendReport({
        airportId: airport.id,
        floorLevel: selectedFloor,
        type,
        severity: 3,
        status: "active",
        // ON ARRONDIT ICI POUR LE MATCHING FUTUR
        position: { 
            x: Math.round(activeMarker.position.x), 
            y: Math.round(activeMarker.position.y) 
        },
        timestamp: Timestamp.now(),
        userId: user.uid,
        upvotes: [], 
        downvotes: []
      });
      console.log("✅ Signalement envoyé !");
      setActiveMarker(null); // Ferme le tooltip
    } catch (err) {
      console.error("❌ Erreur signalement:", err);
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
              f.level === selectedFloor ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-800 border-gray-200"
            }`}
          >
            Niv. {f.level}
          </button>
        ))}
      </div>

      {/* --- TOOLTIP --- */}
      {activeMarker && (
        <div 
          className="absolute z-30 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 w-60 animate-in fade-in zoom-in duration-200"
          style={{ bottom: "20px", left: "50%", transform: "translateX(-50%)" }}
          onClick={(e) => e.stopPropagation()} // FIX : Empêche la map de fermer le tooltip
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900">{activeMarker.name}</h3>
            <button onClick={() => setActiveMarker(null)} className="text-gray-400 p-1">✕</button>
          </div>

          {!activeReport ? (
            <div className="mt-4">
              <button 
                onClick={() => handleReport('traffic')} 
                className="w-full py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200"
              >
                ⚠️ Signaler un bouchon
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="p-2 bg-orange-50 rounded-lg border border-orange-100 text-center">
                <p className="text-[10px] text-orange-700 font-bold uppercase">Incident en cours</p>
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => voteForReport(activeReport.id, user!.uid, true)}
                    className={`flex-1 py-2 border rounded-lg text-[10px] font-bold transition-all ${
                      hasUpvoted ? "bg-green-500 text-white border-green-600" : "bg-white text-green-600 border-green-200"
                    }`}
                  >
                    {hasUpvoted ? "Confirmé ✓" : `C'est vrai (${activeReport.upvotes?.length || 0})`}
                  </button>
                  <button 
                    onClick={() => voteForReport(activeReport.id, user!.uid, false)}
                    className={`flex-1 py-2 border rounded-lg text-[10px] font-bold transition-all ${
                      hasDownvoted ? "bg-red-500 text-white border-red-600" : "bg-white text-red-600 border-red-200"
                    }`}
                  >
                    {hasDownvoted ? "Fini ✓" : `Fini (${activeReport.downvotes?.length || 0})`}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <button className="w-full mt-2 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg" onClick={() => alert("GPS soon...")}>
            S'y rendre
          </button>
        </div>
      )}

      {/* Moteur de Map SVG */}
      <div className="flex-1 w-full h-full bg-gray-50" onClick={() => setActiveMarker(null)}>
        <TransformWrapper initialScale={1} centerOnInit={true}>
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            <svg viewBox="0 0 800 600" className="w-full h-full touch-none">
              {/* Zones (Halls, Shops) */}
              {floor.areas.map((area) => (
                <polygon 
                  key={area.id} 
                  points={area.shape.map((p) => `${p.x},${p.y}`).join(" ")} 
                  fill={area.type === "hall" ? "#dbeafe" : "#fce7f3"} 
                  stroke="#94a3b8" 
                  strokeWidth={1} 
                />
              ))}

              {/* Marqueurs avec logique d'incident */}
              {floor.markers.map((marker) => {
                // Matching via la clé indexée
                const report = indexedReports[`${Math.round(marker.position.x)}-${Math.round(marker.position.y)}`];
                const isReportActive = report && getReportScore(report) > -3;

                return (
                  <g key={marker.id} cursor="pointer" onClick={(e) => { e.stopPropagation(); setActiveMarker(marker); }}>
                    {/* Zone de clic élargie */}
                    <circle cx={marker.position.x} cy={marker.position.y} r={22} fill="transparent" />
                    
                    {/* Halo clignotant si incident */}
                    {isReportActive && (
                      <circle 
                        cx={marker.position.x} cy={marker.position.y} 
                        r={25} 
                        className="fill-orange-500 animate-ping opacity-30" 
                        style={{ pointerEvents: 'none' }}
                      />
                    )}

                    <circle
                      cx={marker.position.x} cy={marker.position.y}
                      r={activeMarker?.id === marker.id ? 14 : 10}
                      fill={isReportActive ? "#ea580c" : (marker.type === "gate" ? "#22c55e" : "#ef4444")}
                      stroke="white" 
                      strokeWidth={3} 
                      className="transition-all duration-300 drop-shadow-md"
                    />
                  </g>
                );
              })}
            </svg>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
};