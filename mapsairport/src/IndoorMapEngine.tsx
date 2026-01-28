// IndoorMapEngine.tsx
import React, { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

type Marker = {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
};

type Area = {
  id: string;
  name: string;
  shape: { x: number; y: number }[];
  type: string;
};

type Floor = {
  level: number;
  name: string;
  areas: Area[];
  markers: Marker[];
};

type Airport = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  floors: Floor[];
};

type Props = {
  airport: Airport;
};

export const IndoorMapEngine: React.FC<Props> = ({ airport }) => {
  const [selectedFloor, setSelectedFloor] = useState<number>(0);

  const floor = airport.floors.find(f => f.level === selectedFloor);

  if (!floor) return <p>Étage introuvable</p>;

  return (
    <div style={{ width: "800px", margin: "auto" }}>
      <h2>{airport.name} - {floor.name}</h2>

      {/* Boutons de changement d'étage */}
      <div style={{ marginBottom: 10 }}>
        {airport.floors.map(f => (
          <button
            key={f.level}
            onClick={() => setSelectedFloor(f.level)}
            style={{
              marginRight: 5,
              padding: "5px 10px",
              background: f.level === selectedFloor ? "#333" : "#eee",
              color: f.level === selectedFloor ? "#fff" : "#000",
              border: "none",
              cursor: "pointer"
            }}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* Zone de map avec zoom/pan */}
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent>
          <svg width={800} height={600} style={{ border: "1px solid #ccc" }}>
            {/* Zones */}
            {floor.areas.map(area => (
              <polygon
                key={area.id}
                points={area.shape.map(p => `${p.x},${p.y}`).join(" ")}
                fill={area.type === "hall" ? "#a2d2ff" : "#ffc8dd"}
                stroke="#333"
                strokeWidth={1}
              />
            ))}

            {/* Markers */}
            {floor.markers.map(marker => (
              <circle
                key={marker.id}
                cx={marker.position.x}
                cy={marker.position.y}
                r={8}
                fill={marker.type === "gate" ? "green" : "red"}
                style={{ cursor: "pointer" }}
                onClick={() => alert(`${marker.name} (${marker.type})`)}
              />
            ))}
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};
