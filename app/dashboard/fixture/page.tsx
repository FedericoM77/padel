"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, RefreshCw, Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";
import { formatDateTime } from "@/lib/utils";
import type { Torneo, PartidoConParejas, SetResult } from "@/types";

async function fetchTorneos(): Promise<Torneo[]> {
  const res = await fetch("/api/torneos");
  if (!res.ok) throw new Error("Error");
  return res.json();
}

async function fetchPartidosTorneo(torneoId: string): Promise<PartidoConParejas[]> {
  const res = await fetch(`/api/partidos?torneoId=${torneoId}`);
  if (!res.ok) throw new Error("Error");
  return res.json();
}

const FASES_ORDER = ["GRUPO", "OCTAVOS", "CUARTOS", "SEMIFINAL", "FINAL"];
const FASE_LABELS: Record<string, string> = {
  GRUPO: "Fase de Grupos",
  OCTAVOS: "Octavos de Final",
  CUARTOS: "Cuartos de Final",
  SEMIFINAL: "Semifinal",
  FINAL: "Final",
};

export default function FixturePage() {
  const [torneoId, setTorneoId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: torneos = [], isLoading: loadingTorneos } = useQuery({
    queryKey: ["torneos"],
    queryFn: fetchTorneos,
  });

  const { data: partidos = [], isLoading: loadingPartidos } = useQuery({
    queryKey: ["partidos-fixture", torneoId],
    queryFn: () => fetchPartidosTorneo(torneoId!),
    enabled: !!torneoId,
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["partidos-fixture", torneoId] });
  }, [queryClient, torneoId]);

  const partidosPorFase = FASES_ORDER.reduce<Record<string, PartidoConParejas[]>>((acc, fase) => {
    const list = partidos.filter((p) => p.fase === fase);
    if (list.length > 0) acc[fase] = list;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Fixture
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visualización del fixture por torneo
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-72">
          {loadingTorneos ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select onValueChange={(v) => setTorneoId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná un torneo" />
              </SelectTrigger>
              <SelectContent>
                {torneos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.nombre} — {t.categoria}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {torneoId && (
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-3.5 h-3.5" />
            Actualizar
          </Button>
        )}
      </div>

      {!torneoId ? (
        <div className="text-center py-20 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Seleccioná un torneo para ver el fixture.</p>
        </div>
      ) : loadingPartidos ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : partidos.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Este torneo no tiene partidos programados.</p>
          <p className="text-xs mt-1">Andá a "Partidos" para programarlos.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(partidosPorFase).map(([fase, lista]) => (
            <div key={fase}>
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                {FASE_LABELS[fase] ?? fase}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {lista.map((p) => {
                  const sets = p.sets as SetResult[] | null;
                  return (
                    <div key={p.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted-foreground">
                          {p.fecha ? formatDateTime(p.fecha) : "Sin fecha"}
                        </span>
                        <Badge
                          variant={p.estado === "FINALIZADO" ? "success" : p.estado === "EN_JUEGO" ? "warning" : "secondary"}
                          className="text-xs"
                        >
                          {p.estado}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`flex-1 text-right ${p.ganadorId === p.parejaLocalId ? "text-lime-400" : ""}`}>
                          <p className="text-sm font-medium">{p.parejaLocal.nombreJugador1}</p>
                          <p className="text-xs text-muted-foreground">{p.parejaLocal.nombreJugador2}</p>
                        </div>
                        <div className="text-center shrink-0 min-w-[60px]">
                          {sets?.length ? (
                            <div className="space-y-0.5">
                              {sets.map((s, i) => (
                                <div key={i} className="text-xs font-mono font-bold text-white">
                                  {s.local}–{s.visitante}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm font-bold">vs</span>
                          )}
                        </div>
                        <div className={`flex-1 ${p.ganadorId === p.parejaVisitanteId ? "text-lime-400" : ""}`}>
                          <p className="text-sm font-medium">{p.parejaVisitante.nombreJugador1}</p>
                          <p className="text-xs text-muted-foreground">{p.parejaVisitante.nombreJugador2}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
