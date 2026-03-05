import { Timestamp } from "firebase/firestore";

type Marker = {
  id: string;
  name: string;
  label: string;
  type: string;
  position: { x: number; y: number };
};

type Area = {
  id: string;
  name: string;
  shape: { x: number; y: number }[];
  type: AreaType;
};

type AreaType = 'hall' | 'gate' | 'security' | 'lounge' | 'shop' | 'restroom' | 'restaurant';

type Floor = {
  level: number;
  name: string;
  areas?: Area[];
  markers?: Marker[];
};

type Airport = {
  id: string;
  name: string;
  position: Position;
  floors: Floor[];
};

type Props = {
  airport: Airport;
};

type Point = {
  x: number,
  y: number
}

interface Position {
  latitude: number,
  longitude: number
  
}

interface UserReport{
    id: string,
    airportId: string,
    floorLevel: number,
    type: 'traffic' | 'accident' | 'closure' | 'info';
    status: 'active' | 'resolved' | 'expired';
    severity: 1 | 2 | 3; // 1: fluide, 2: Ralenti, 3: Bloqué
    message?: string,
    position: { x: number; y: number };
    timestamp: Timestamp,
    userId: string;
    upvotes: string[]; // Liste des UIDs des gens qui ont confirmé
    downvotes: string[]; // Liste des UIDs des gens qui disent que c'est fini
}


const AREA_COLORS: Record<AreaType, { fill: string, stroke: string }> = {
  hall: { fill: "#dbeafe" , stroke: "#93c5fd" }, // Bleu clair
  gate: { fill: "#fef9c3" , stroke: "#fde047" }, // Jaune
  security: { fill: "#fee2e2", stroke: "#fca5a5"}, // Rose très clair
  lounge: { fill: "#f3e88f", stroke: "#d8b4fe"}, // Violet
  shop: { fill: "#f0fdf4", stroke: "#86efac" }, // Vert
  restroom: { fill: "#f1f5f9", stroke: "#cbd5e1" }, // Gris
  restaurant: { fill: "#ffedd5", stroke: "#fb923c" }, // Orange ambré (Tailwind orange-100 / orange-400)
}
export type { Marker, Area, Floor, Airport, Props, UserReport, AreaType, Position, Point}

export { AREA_COLORS }