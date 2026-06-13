"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Trophy,
  Swords,
  CheckCircle2,
  Medal,
  Calendar,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import type { DashboardStats, SetResult } from "@/types";

async function fetchDashboard(): Promise<DashboardStats> {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Error al cargar dashboard");
  return res.json();
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-3xl font-bold text-white mt-1">{value}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: fetchDashboard });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Resumen general del sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Parejas" value={data?.totalParejas ?? 0} color="bg-lime-500/20 text-lime-400" loading={isLoading} />
        <StatCard icon={Trophy} label="Torneos Activos" value={data?.torneosActivos ?? 0} color="bg-yellow-500/20 text-yellow-400" loading={isLoading} />
        <StatCard icon={Clock} label="Partidos Pendientes" value={data?.partidosPendientes ?? 0} color="bg-blue-500/20 text-blue-400" loading={isLoading} />
        <StatCard icon={CheckCircle2} label="Partidos Finalizados" value={data?.partidosFinalizados ?? 0} color="bg-green-500/20 text-green-400" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Ranking */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Medal className="w-4 h-4 text-primary" />
              Top 5 Ranking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-4">
            {isLoading ? (
              <div className="px-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : !data?.topRanking?.length ? (
              <p className="text-center text-sm text-muted-foreground py-8">Sin datos de ranking</p>
            ) : (
              <div className="divide-y divide-border">
                {data.topRanking.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold w-6 text-center ${
                        i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-muted-foreground"
                      }`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white leading-none">{p.nombreJugador1}</p>
                        <p className="text-xs text-muted-foreground">{p.nombreJugador2}</p>
                      </div>
                    </div>
                    <span className="text-primary font-bold text-sm">{p.puntosRanking} pts</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimos Resultados */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              Últimos Resultados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-4">
            {isLoading ? (
              <div className="px-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : !data?.ultimosResultados?.length ? (
              <p className="text-center text-sm text-muted-foreground py-8">Sin resultados cargados</p>
            ) : (
              <div className="divide-y divide-border">
                {data.ultimosResultados.map((p) => {
                  const sets = p.sets as SetResult[] | null;
                  return (
                    <div key={p.id} className="px-4 py-3 hover:bg-white/[0.02]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{p.torneo.nombre}</span>
                        <Badge variant="success" className="text-xs">Finalizado</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={p.ganadorId === p.parejaLocalId ? "font-bold text-lime-400" : "text-muted-foreground"}>
                          {p.parejaLocal.nombreJugador1}/{p.parejaLocal.nombreJugador2}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {sets?.map(s => `${s.local}-${s.visitante}`).join(" | ")}
                        </span>
                        <span className={p.ganadorId === p.parejaVisitanteId ? "font-bold text-lime-400" : "text-muted-foreground"}>
                          {p.parejaVisitante.nombreJugador1}/{p.parejaVisitante.nombreJugador2}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Próximos Partidos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            Próximos Partidos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-4">
          {isLoading ? (
            <div className="px-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : !data?.proximosPartidos?.length ? (
            <p className="text-center text-sm text-muted-foreground py-8">Sin partidos programados</p>
          ) : (
            <div className="divide-y divide-border">
              {data.proximosPartidos.map((p) => (
                <div key={p.id} className="px-4 py-3 hover:bg-white/[0.02] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {p.parejaLocal.nombreJugador1}/{p.parejaLocal.nombreJugador2}
                      <span className="text-muted-foreground font-normal"> vs </span>
                      {p.parejaVisitante.nombreJugador1}/{p.parejaVisitante.nombreJugador2}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.torneo.nombre} — {p.fase}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-primary">{formatDateTime(p.fecha)}</p>
                    <Badge variant="secondary" className="text-xs mt-1">Pendiente</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
