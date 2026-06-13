"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trophy, Plus } from "lucide-react";
import { TorneoForm } from "@/components/torneos/torneo-form";
import { TorneoCard } from "@/components/torneos/torneo-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Torneo } from "@/types";

interface TorneoConCount extends Torneo {
  _count: { partidos: number; inscripciones: number };
}

async function fetchTorneos(): Promise<TorneoConCount[]> {
  const res = await fetch("/api/torneos");
  if (!res.ok) throw new Error("Error al cargar torneos");
  return res.json();
}

export default function TorneosPage() {
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState<Torneo | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: torneos = [], isLoading } = useQuery({
    queryKey: ["torneos"],
    queryFn: fetchTorneos,
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["torneos"] });
    setEditando(null);
    setShowForm(false);
  }, [queryClient]);

  const handleEdit = (t: Torneo) => {
    setEditando(t);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Torneos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestión de torneos y categorías
          </p>
        </div>
        <button
          onClick={() => { setEditando(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Torneo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {showForm && (
          <div>
            <TorneoForm
              editando={editando}
              onSuccess={refresh}
              onCancel={() => { setShowForm(false); setEditando(null); }}
            />
          </div>
        )}

        <div className={showForm ? "" : "lg:col-span-2"}>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-52 w-full" />
              ))}
            </div>
          ) : torneos.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay torneos registrados.</p>
              <p className="text-xs mt-1">Hacé clic en "Nuevo Torneo" para comenzar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {torneos.map((t) => (
                <TorneoCard
                  key={t.id}
                  torneo={t}
                  onEdit={handleEdit}
                  onRefresh={refresh}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
