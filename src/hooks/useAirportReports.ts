import { useState, useEffect, useMemo } from "react";
import type { UserReport } from "../types/types";
// Importation directe des fonctions de service
import { subscribeToReports, sendReport, voteForReport } from "../services/firebase";

export const useAirportReports = (airportId: string) => {
  const [reports, setReports] = useState<UserReport[]>([]);
  
  // Constante pour le TTL (Time To Live) : 2 heures
  const INCIDENT_TTL_MS = 2 * 60 * 60 * 1000;

  useEffect(() => {
    const unsubscribe = subscribeToReports(airportId, setReports);
    return () => unsubscribe();
  }, [airportId]);

  const filteredReportsMap = useMemo(() => {
    const map = new Map<string, UserReport>();
    const now = Date.now();

    reports.forEach(r => {
      const reportTime = r.timestamp.toMillis();
      const score = (r.upvotes?.length || 0) - (r.downvotes?.length || 0);

      // FILTRES :
      // 1. Pas plus vieux que 2h
      // 2. Pas un score de -3 ou pire (signalement abusif)
      if (now - reportTime < INCIDENT_TTL_MS && score > -3) {
        const key = `${Math.floor(r.position.x / 5)},${Math.floor(r.position.y / 5)}`;
        map.set(key, r);
      }
    });
    return map;
  }, [reports]);

  return { reportsMap: filteredReportsMap, sendReport, voteForReport };
};