import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Fix Icône Leaflet ---
const MelioIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface AirportPosition { latitude: number; longitude: number; }
interface AirportArea { id: string; path: { lat: number; lng: number }[]; label?: string; }
interface Airport { id: string; name: string; position: AirportPosition; }

const RecenterMap = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 17, { animate: true });
  }, [coords, map]);
  return null;
};

export const IndoorMapEngine = ({ airport }: { airport: Airport }) => {
  const [terminalData, setTerminalData] = useState<{ areas: AirportArea[] } | null>(null);
  const URL: string = `https://backend-mapsairport.vercel.app/api/airport/${airport.id}/terminal/t4-main`
  // 1. On récupère les data de ton backend
  useEffect(() => {
    if (!airport.id) return;
    fetch(URL)
      .then(res => res.json())
      .then(setTerminalData)
      .catch(err => console.error("Erreur Melio Engine:", err));
  }, [airport.id]);

  // 2. LOGIQUE DE POSITIONNEMENT CORRIGÉE
  // On utilise les data du tracé geojson.io si elles existent, sinon le centre théorique
  const preciseCenter = useMemo<[number, number]>(() => {
    const firstPath = terminalData?.areas?.[0]?.path?.[0];
    if (firstPath) {
      return [firstPath.lat, firstPath.lng]; // Coordonnées chirurgicales du tracé
    }
    return [airport.position.latitude, airport.position.longitude]; // Coordonnées vagues Firebase
  }, [airport.position, terminalData]);

  if (!preciseCenter[0] || !preciseCenter[1]) return null;

  return (
    <div className="h-screen w-full relative">
      <MapContainer 
        center={preciseCenter} 
        zoom={17} 
        className="h-full w-full"
      >
        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
          attribution='&copy; Melio Maps'
        />
        
        {/* On force le recentrage sur le dessin geojson.io dès qu'il arrive */}
        <RecenterMap coords={preciseCenter} />

        {/* Marqueur : Il sera désormais PILE sur ton polygone bleu */}
        <Marker position={preciseCenter} icon={MelioIcon}>
          <Popup>
            <div className="p-1">
              <p className="font-bold text-blue-600">{airport.name}</p>
              <p className="text-xs">Terminal 4 (Tracé précis)</p>
            </div>
          </Popup>
        </Marker>

        {terminalData?.areas?.map((area) => (
          <Polygon
            key={area.id}
            positions={area.path.map(p => [p.lat, p.lng])} 
            pathOptions={{
              fillColor: '#3b82f6',
              fillOpacity: 0.45,
              color: '#1e3a8a',
              weight: 2,
              className: 'hover:fill-opacity-70 cursor-pointer'
            }}
          />
        ))}
      </MapContainer>

      {!terminalData && (
        <div className="absolute top-20 right-5 z-[1000] bg-white p-3 rounded-lg shadow-xl border italic text-blue-500">
          Sync Melio avec geojson.io...
        </div>
      )}
    </div>
  );
};