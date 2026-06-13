"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Swords } from "lucide-react";
import { PartidoForm } from "@/components/partidos/partido-form";
import { PartidoList } from "@/components/partidos/partido-list";
import type { PartidoConParejas, Torneo, Pareja } from "@/types";

async function fetchPartidos(): Promise<PartidoConParejas[]> {
  const res = await fetch("/api/partidos");
  if (!res.ok) throw new Error("Error");
  return res.json();
}

async function fetchTorneos(): Promise<Torneo[]> {
  const res = await fetch("/api/torneos");
  if (!res.ok) throw new Error("Error");
  return res.json();
}

async function fetchParejas(): Promise<Pareja[]> {
  const res = await fetch("/api/parejas");
  if (!res.ok) throw new Error("Error");
  return res.json();
}

export default function PartidosPage() {
  const queryClient = useQueryClient();

  const { data: partidos = [], isLoading: loadingPartidos } = useQuery({ queryKey: ["partidos"], queryFn: fetchPartidos });
  const { data: torneos = [] } = useQuery({ queryKey: ["torneos"], queryFn: fetchTorneos });
  const { data: parejas = [] } = useQuery({ queryKey: ["parejas"], queryFn: fetchParejas });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["partidos"] });
    queryClient.invalidateQueries({ queryKey: ["parejas"] });
  }, [queryClient]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Swords className="w-6 h-6 text-primary" />
          Partidos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Programación y carga de resultados
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <div>
          <PartidoForm torneos={torneos} parejas={parejas} onSuccess={refresh} />
        </div>
        <div>
          <PartidoList partidos={partidos} loading={loadingPartidos} onRefresh={refresh} />
        </div>
      </div>
    </div>
  );
}
