import React, { useState, useEffect, useMemo } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { subscribeToReports, voteForReport, sendReport } from "../services/firebase"; 
import { useAuth } from "../contexts/AuthContext";
import type { Marker, UserReport, Props } from "../types/types";
import { Timestamp } from "firebase/firestore";

export const IndoorMapEngine: React.FC<Props> = ({ airport }) => {
  const { user } = useAuth();
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [activeMarker, setActiveMarker] = useState<Marker | null>(null);
  const [reports, setReports] = useState<UserReport[]>([]);

  // 1. Memoization de l'étage
  const floor = useMemo(() => {
    if (!airport?.floors) return null;
    return airport.floors.find((f) => f?.level === selectedFloor) || null;
  }, [airport?.floors, selectedFloor]);

  // 2. Subscription Realtime (Firebase)
  useEffect(() => {
    if (!airport?.id) return;
    const unsubscribe = subscribeToReports(airport.id, (data) => {
      setReports(data);
    });
    return () => unsubscribe();
  }, [airport?.id]);

  // 3. Indexation O(1) pour les reports (On utilise .position.x/y comme dans ton type)
  const indexedReports = useMemo(() => {
    const index: Record<string, UserReport> = {};
    if (!reports) return index;
    
    reports.forEach(r => {
      if (r?.floorLevel === selectedFloor && r?.position) {
        const key = `${Math.round(r.position.x)}-${Math.round(r.position.y)}`;
        index[key] = r;
      }
    });
    return index;
  }, [reports, selectedFloor]);

  if (!floor) return <div className="h-full flex items-center justify-center text-slate-400 italic">Chargement...</div>;

  // Récupération du report actif (Respect du type Marker)
  const activeReport = activeMarker?.position
    ? indexedReports[`${Math.round(activeMarker.position.x)}-${Math.round(activeMarker.position.y)}`]
    : null;

  const handleReport = async (type: UserReport['type']) => {
    if (!activeMarker || !user || !airport?.id) return;
    try {
      await sendReport({
        airportId: airport.id,
        floorLevel: selectedFloor,
        type,
        severity: 3,
        status: "active",
        position: { 
          x: Math.round(activeMarker.position.x), 
          y: Math.round(activeMarker.position.y) 
        },
        timestamp: Timestamp.now(),
        userId: user.uid,
        upvotes: [],
        downvotes: []
      });
      setActiveMarker(null);
    } catch (err) {
      console.error("Melio Error:", err);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white overflow-hidden font-sans">
      
      {/* SÉLECTEUR D'ÉTAGE */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
        {[...(airport?.floors || [])].sort((a,b) => (b?.level || 0) - (a?.level || 0)).map((f) => (
          <button
            key={f.level}
            onClick={() => { setSelectedFloor(f.level); setActiveMarker(null); }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shadow-xl transition-all duration-200 border-2 ${
              f.level === selectedFloor 
              ? "bg-slate-900 text-white border-slate-900 scale-110" 
              : "bg-white/90 backdrop-blur text-slate-500 border-white hover:border-slate-200"
            }`}
          >
            {f.level === 0 ? "P0" : f.level === 1 ? "P1" : f.level}
          </button>
        ))}
      </div>

      {/* TOOLTIP REPORT */}
      {activeMarker && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 bg-white p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-50 w-[90%] max-w-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Localisation</p>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                {activeMarker.name || activeMarker.label}
              </h3>
            </div>
            <button onClick={() => setActiveMarker(null)} className="bg-slate-100 p-2 rounded-full text-slate-400">✕</button>
          </div>
          
          {!activeReport ? (
             <button onClick={() => handleReport('traffic')} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-sm active:scale-95 shadow-lg shadow-orange-200">
               ⚠️ SIGNALER UN BOUCHON
             </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-center text-orange-700 text-xs font-bold italic">
                "Pas mal de monde ici..."
              </div>
              <div className="flex gap-2">
                <button onClick={() => voteForReport(activeReport.id, user!.uid, true)} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[11px] font-bold">C'EST VRAI</button>
                <button onClick={() => voteForReport(activeReport.id, user!.uid, false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-[11px] font-bold">C'EST FINI</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SVG ENGINE */}
      <div className="flex-1 bg-slate-50" onClick={() => setActiveMarker(null)}>
        <TransformWrapper centerOnInit minScale={0.8} maxScale={4}>
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            <svg viewBox="0 0 1000 800" className="w-full h-full">
              {/* Areas */}
              {floor.areas?.map((area: any) => (
                <polygon 
                  key={area.id} 
                  points={area.shape?.map((p: any) => `${p.x},${p.y}`).join(" ")} 
                  className={`${area.type === "hall" ? "fill-blue-100/40" : "fill-indigo-100/30"} stroke-slate-300 stroke-[0.5]`}
                />
              ))}

              {/* Markers (Utilisation stricte du type Marker) */}
              {floor.markers?.map((marker: Marker) => {
                const { x, y } = marker.position;
                const report = indexedReports[`${Math.round(x)}-${Math.round(y)}`];
                const isReportActive = report && (report.upvotes?.length || 0) >= (report.downvotes?.length || 0);

                return (
                  <g key={marker.id} onClick={(e) => { e.stopPropagation(); setActiveMarker(marker); }} className="cursor-pointer">
                    {isReportActive && <circle cx={x} cy={y} r={22} className="fill-orange-500 animate-ping opacity-20" />}
                    <circle
                      cx={x} cy={y}
                      r={activeMarker?.id === marker.id ? 10 : 7}
                      fill={isReportActive ? "#f97316" : (marker.type === "gate" ? "#10b981" : "#6366f1")}
                      className="stroke-white stroke-[2.5px] drop-shadow-md transition-all duration-300"
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