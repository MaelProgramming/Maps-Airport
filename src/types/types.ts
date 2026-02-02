import { Timestamp } from "firebase/firestore";

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


export interface UserReport{
    id: string,
    airportId: string,
    floorLevel: number,
    type: 'traffic' | 'accident' | 'closure' | 'info';
    severity: 1 | 2 | 3; // 1: fluide, 2: Ralenti, 3: Bloqué
    message?: string,
    position: { x: number; y: number };
    timestamp: Timestamp,
    userId: string;
    upvotes: string[]; // Liste des UIDs des gens qui ont confirmé
    downvotes: string[]; // Liste des UIDs des gens qui disent que c'est fini
}
