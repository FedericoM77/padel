"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { ParejaForm } from "@/components/parejas/pareja-form";
import { RankingTable } from "@/components/parejas/ranking-table";
import type { Pareja } from "@/types";

async function fetchParejas(): Promise<Pareja[]> {
  const res = await fetch("/api/parejas");
  if (!res.ok) throw new Error("Error al cargar parejas");
  return res.json();
}

export default function ParejasPage() {
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState<Pareja | null>(null);

  const { data: parejas = [], isLoading } = useQuery({
    queryKey: ["parejas"],
    queryFn: fetchParejas,
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["parejas"] });
    setEditando(null);
  }, [queryClient]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Parejas / Ranking
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestión de parejas y ranking por puntos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="order-2 lg:order-1">
          <ParejaForm
            editando={editando}
            onSuccess={refresh}
            onCancel={() => setEditando(null)}
          />
        </div>
        <div className="order-1 lg:order-2">
          <RankingTable
            parejas={parejas}
            loading={isLoading}
            onEdit={setEditando}
            onRefresh={refresh}
          />
        </div>
      </div>
    </div>
  );
}
