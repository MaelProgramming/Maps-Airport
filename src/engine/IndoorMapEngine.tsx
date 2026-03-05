import { useEffect, useState, useMemo } from 'react';
import { MapPin, X, Navigation } from 'lucide-react'; 
import { FloorSelector } from './FloorSelector';

// --- Types Melio Engine ---
interface Point { lat: number; lng: number; }
interface Area { 
  id: string; 
  name: string; 
  label?: string; 
  path: Point[]; 
  type?: string;
  centerX?: number;
  centerY?: number;
  d?: string;
}

export const IndoorMapEngine = ({ airport }: { airport: any }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [floorData, setFloorData] = useState<{ areas: Area[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [hoveredArea, setHoveredArea] = useState<Area | null>(null);

  // --- Sync avec l'API Vercel ---
  useEffect(() => {
    setLoading(true);
    fetch(`https://backend-mapsairport.vercel.app/api/airport/${airport.id}/terminal/t4-main/floor/f${currentLevel}`)
      .then(res => res.json())
      .then(data => {
        if (data?.areas) setFloorData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [airport.id, currentLevel]);

  // --- Engine Géométrique : Calcule les paths et les centres ---
  const processedData = useMemo(() => {
    if (!floorData?.areas) return [];

    const validAreas = floorData.areas.filter(a => a.path?.length > 0);
    const allPoints = validAreas.flatMap(a => a.path);
    
    const minLat = Math.min(...allPoints.map(p => p.lat));
    const maxLat = Math.max(...allPoints.map(p => p.lat));
    const minLng = Math.min(...allPoints.map(p => p.lng));
    const maxLng = Math.max(...allPoints.map(p => p.lng));

    const latRange = maxLat - minLat || 0.00001;
    const lngRange = maxLng - minLng || 0.00001;

    return validAreas.map((area) => {
      let sumX = 0, sumY = 0;
      const d = area.path.map((p, i) => {
        const x = 50 + ((p.lng - minLng) / lngRange) * 900;
        const y = 50 + (1 - (p.lat - minLat) / latRange) * 900;
        sumX += x; sumY += y;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      }).join(' ') + ' Z';

      return {
        ...area,
        d,
        centerX: sumX / area.path.length,
        centerY: sumY / area.path.length
      };
    }).sort((a, b) => a.id.includes('outline') ? -1 : 1); // Outline en fond
  }, [floorData]);

  return (
    <div 
      className="h-screen w-full bg-[#030712] flex items-center justify-center relative overflow-hidden font-sans text-slate-200"
      onClick={() => setSelectedArea(null)} // Reset si clic n'importe où sur l'écran
    >
      
      {/* --- HUD Info --- */}
      <div className="absolute top-6 left-6 z-40 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-blue-500 font-black mb-1">Melio Core</p>
        <h2 className="text-xl font-black tracking-tighter uppercase italic">{airport.id} — LEVEL {currentLevel}</h2>
      </div>

      <div className="absolute top-6 right-6 z-50">
        <FloorSelector floors={airport.floors || []} currentLevel={currentLevel} onFloorChange={setCurrentLevel} />
      </div>

      {/* --- SVG Map --- */}
      {loading ? (
        <div className="text-blue-500 animate-pulse font-mono text-xs tracking-widest">MAP_CALCULATION...</div>
      ) : (
        <svg 
          viewBox="0 0 1000 1000" 
          className="w-[85vw] h-[85vh] drop-shadow-[0_0_60px_rgba(37,99,235,0.1)]"
          onClick={(e) => { e.stopPropagation(); setSelectedArea(null); }} // Ferme si clic sur le vide du SVG
        >
          <defs>
            {/* Pattern Grille */}
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
            </pattern>
            {/* Effet Glow */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feFlood floodColor="#3b82f6" floodOpacity="0.7" />
              <feComposite in2="blur" operator="in" />
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect width="1000" height="1000" fill="url(#grid)" />

          {processedData.map((area) => {
            const isOutline = area.id.includes('outline');
            const isHovered = hoveredArea?.id === area.id;
            const isSelected = selectedArea?.id === area.id;

            return (
              <g 
                key={area.id} 
                className="cursor-pointer"
                onMouseEnter={() => !isOutline && setHoveredArea(area)}
                onMouseLeave={() => setHoveredArea(null)}
                onClick={(e) => {
                  e.stopPropagation(); // Évite de fermer la modale via le clic parent
                  if (!isOutline) setSelectedArea(area);
                  else setSelectedArea(null); // Clique sur le mur = ferme la modale
                }}
              >
                {/* Polygone */}
                <path
                  d={area.d}
                  fill={isOutline ? "rgba(15, 23, 42, 0.4)" : (isSelected ? "#2563eb" : "#1d4ed8")}
                  fillOpacity={isOutline ? "1" : (isHovered ? "0.9" : "0.6")}
                  stroke={isOutline ? "#334155" : "#60a5fa"}
                  strokeWidth={isOutline ? "2" : "1.5"}
                  className="transition-all duration-300"
                />
                
                {/* Marker Blanc Glow */}
                {!isOutline && (
                  <circle 
                    cx={area.centerX} 
                    cy={area.centerY} 
                    r={isHovered ? "8" : "5"} 
                    fill="white" 
                    filter={isHovered ? "url(#glow)" : "none"}
                    className="transition-all duration-200"
                  />
                )}
              </g>
            );
          })}
        </svg>
      )}

      {/* --- Fiche d'info Melio --- */}
      {selectedArea && (
        <div 
          className="absolute bottom-10 w-full max-w-sm bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-10 z-[100]"
          onClick={(e) => e.stopPropagation()} // Empêche le clic dans la fiche de la fermer
        >
          <button onClick={() => setSelectedArea(null)} className="absolute top-5 right-6 text-slate-500 hover:text-white transition-colors">
            <X size={20}/>
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/40">
              <Navigation size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight leading-tight">{selectedArea.label || selectedArea.name}</h3>
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{selectedArea.type || 'Inconnu'}</p>
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-tighter">
            Tracer l'itinéraire
          </button>
        </div>
      )}

      {/* Footer Branding [cite: 2026-02-07] */}
      <div className="absolute bottom-6 left-6 font-mono text-[9px] opacity-20 uppercase tracking-[0.5em]">
        Melio Engine // Live // {airport.id}
      </div>
    </div>
  );
};