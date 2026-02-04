import React from "react";
import type { Marker, UserReport } from "../types/types";

// On définit l'interface ici ou on l'exporte depuis types.ts
interface MarkerProps {
  marker: Marker;
  report: UserReport | undefined; // undefined si pas de report sur ce marker
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const MapMarker = React.memo(({ marker, report, isActive, onClick }: MarkerProps) => {
  return (
    <g cursor="pointer" onClick={onClick}>
       {/* Zone de clic élargie pour les gros doigts sur mobile */}
       <circle cx={marker.position.x} cy={marker.position.y} r={22} fill="transparent" />
       
       {report && (
         <circle 
           cx={marker.position.x} cy={marker.position.y} 
           r={25} 
           className="fill-orange-500 animate-ping opacity-30" 
         />
       )}

       <circle
         cx={marker.position.x} cy={marker.position.y}
         r={isActive ? 14 : 10}
         fill={report ? "#ea580c" : (marker.type === "gate" ? "#22c55e" : "#ef4444")}
         stroke="white" 
         strokeWidth={3} 
         className="transition-all duration-300 drop-shadow-md"
       />
    </g>
  );
});

// On lui donne un nom pour le debugging React DevTools
MapMarker.displayName = "MapMarker";