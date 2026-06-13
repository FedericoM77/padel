"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Swords, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResultadoModal } from "@/components/partidos/resultado-modal";
import { formatDateTime } from "@/lib/utils";
import type { PartidoConParejas, SetResult } from "@/types";

interface Props {
  partidos: PartidoConParejas[];
  loading: boolean;
  onRefresh: () => void;
}

const ESTADO_STYLES: Record<string, { label: string; variant: "success" | "info" | "warning" | "secondary" }> = {
  PENDIENTE: { label: "Pendiente", variant: "secondary" },
  EN_JUEGO: { label: "En Juego", variant: "warning" },
  FINALIZADO: { label: "Finalizado", variant: "success" },
};

export function PartidoList({ partidos, loading, onRefresh }: Props) {
  const [selectedPartido, setSelectedPartido] = useState<PartidoConParejas | null>(null);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (partidos.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Swords className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No hay partidos registrados.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {partidos.map((p) => {
          const estado = ESTADO_STYLES[p.estado] ?? { label: p.estado, variant: "secondary" };
          const sets = p.sets as SetResult[] | null;
          const isLocal = (id: string) => id === p.ganadorId;

          return (
            <div key={p.id} className="rounded-lg border border-border bg-card p-4 hover:border-border/80 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={estado.variant as Parameters<typeof Badge>[0]["variant"]} className="text-xs">
                    {estado.variant === "success" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                    {estado.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{p.torneo.nombre} — {p.torneo.categoria}</span>
                  <span className="text-xs text-muted-foreground">{p.fase}</span>
                </div>
                {p.fecha && (
                  <span className="text-xs text-muted-foreground shrink-0">{formatDateTime(p.fecha)}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className={`flex-1 text-right ${p.ganadorId === p.parejaLocalId ? "text-lime-400" : ""}`}>
                  <p className="font-medium text-sm">{p.parejaLocal.nombreJugador1}</p>
                  <p className="text-xs text-muted-foreground">{p.parejaLocal.nombreJugador2}</p>
                  {p.ganadorId === p.parejaLocalId && (
                    <Trophy className="w-3 h-3 text-lime-400 ml-auto mt-1" />
                  )}
                </div>

                <div className="text-center shrink-0">
                  {sets && sets.length > 0 ? (
                    <div className="space-y-0.5">
                      {sets.map((s, i) => (
                        <div key={i} className="text-xs font-mono font-bold text-white">
                          {s.local} – {s.visitante}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground font-bold text-sm">VS</span>
                  )}
                </div>

                <div className={`flex-1 ${p.ganadorId === p.parejaVisitanteId ? "text-lime-400" : ""}`}>
                  <p className="font-medium text-sm">{p.parejaVisitante.nombreJugador1}</p>
                  <p className="text-xs text-muted-foreground">{p.parejaVisitante.nombreJugador2}</p>
                  {p.ganadorId === p.parejaVisitanteId && (
                    <Trophy className="w-3 h-3 text-lime-400 mt-1" />
                  )}
                </div>
              </div>

              {p.estado === "PENDIENTE" && (
                <div className="mt-3 pt-3 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedPartido(p)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Cargar Resultado
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedPartido && (
        <ResultadoModal
          partido={selectedPartido}
          open={!!selectedPartido}
          onClose={() => setSelectedPartido(null)}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
