import type { Pareja, Torneo, Partido, Inscripcion, EstadoTorneo, EstadoPartido, FormatoTorneo, FasePartido } from "@prisma/client";

export type { Pareja, Torneo, Partido, Inscripcion, EstadoTorneo, EstadoPartido, FormatoTorneo, FasePartido };

export interface ParejaConEstadisticas extends Pareja {
  posicionRanking?: number;
}

export interface TorneoConInscripciones extends Torneo {
  inscripciones: (Inscripcion & { pareja: Pareja })[];
  _count: { partidos: number; inscripciones: number };
}

export interface PartidoConParejas extends Partido {
  parejaLocal: Pareja;
  parejaVisitante: Pareja;
  ganador: Pareja | null;
  torneo: Pick<Torneo, "id" | "nombre" | "categoria">;
}

export interface SetResult {
  local: number;
  visitante: number;
}

export interface DashboardStats {
  totalParejas: number;
  torneosActivos: number;
  partidosPendientes: number;
  partidosFinalizados: number;
  topRanking: ParejaConEstadisticas[];
  ultimosResultados: PartidoConParejas[];
  proximosPartidos: PartidoConParejas[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
