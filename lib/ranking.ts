import { FasePartido } from "@prisma/client";

export const PUNTOS_POR_FASE: Record<FasePartido, { victoria: number; derrota: number }> = {
  GRUPO: { victoria: 3, derrota: 1 },
  OCTAVOS: { victoria: 4, derrota: 1 },
  CUARTOS: { victoria: 4, derrota: 1 },
  SEMIFINAL: { victoria: 5, derrota: 1 },
  FINAL: { victoria: 10, derrota: 1 },
};

export const BONUS_CAMPEON = 15;
export const BONUS_SUBCAMPEON = 8;

export function calcularPuntosVictoria(fase: FasePartido): number {
  return PUNTOS_POR_FASE[fase].victoria;
}

export function calcularPuntosDerrota(fase: FasePartido): number {
  return PUNTOS_POR_FASE[fase].derrota;
}
