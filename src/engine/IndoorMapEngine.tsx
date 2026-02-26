import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export const IndoorMapEngine = ({ airport }: { airport: any }) => {
  const [terminalData, setTerminalData] = useState<any>(null);

  // 1. On va chercher les polygones du T4 spécifiquement
  useEffect(() => {
    fetch(`https://backend-mapsairport.vercel.app/api/airport/${airport.id}/terminal/t4-main`)
      .then(res => res.json())
      .then(data => setTerminalData(data))
      .catch(err => console.error("Erreur plan Melio:", err));
  }, [airport.id]);

  if (!terminalData) return <div className="p-10 italic">Chargement du plan T4...</div>;

  // 2. Coordonnées centrales pour Madrid-Barajas T4
  const madridCenter: [number, number] = [40.4915, -3.5930];

  return (
    <div className="h-screen w-full">
      <MapContainer center={madridCenter} zoom={17} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 3. On dessine tes polygones "path" envoyés par Firebase */}
        {terminalData.areas?.map((area: any) => (
          <Polygon
            key={area.id}
            // Conversion du format {lng, lat} de ton JSON en [lat, lng] pour Leaflet
            positions={area.path.map((p: any) => [p.lat, p.lng])} 
            pathOptions={{
              fillColor: '#3b82f6',
              fillOpacity: 0.5,
              color: '#1e293b',
              weight: 2
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
};