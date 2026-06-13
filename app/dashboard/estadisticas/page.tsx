"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface EstadisticasData {
  topParejas: {
    nombre: string;
    puntos: number;
    ganados: number;
    jugados: number;
    winRate: number;
  }[];
  distribucionTorneos: { nombre: string; cantidad: number }[];
  totalPartidos: number;
}

async function fetchEstadisticas(): Promise<EstadisticasData> {
  const res = await fetch("/api/estadisticas");
  if (!res.ok) throw new Error("Error");
  return res.json();
}

const COLORS = ["#84cc16", "#22d3ee", "#a78bfa", "#fb923c", "#f472b6", "#34d399", "#fbbf24", "#60a5fa"];

export default function EstadisticasPage() {
  const { data, isLoading } = useQuery({ queryKey: ["estadisticas"], queryFn: fetchEstadisticas });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Estadísticas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Análisis y métricas del torneo
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
        </div>
      ) : !data || data.totalPartidos === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay suficientes datos para mostrar estadísticas.</p>
          <p className="text-xs mt-1">Cargá resultados de partidos para ver las métricas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ranking por puntos */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-primary" />
                Ranking — Top 8 Parejas por Puntos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.topParejas} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
                  <XAxis
                    dataKey="nombre"
                    stroke="#64748b"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                    labelStyle={{ color: "#f8fafc" }}
                  />
                  <Bar dataKey="puntos" fill="#84cc16" radius={[4, 4, 0, 0]} name="Puntos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Win Rate */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">% de Victorias — Top 8</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.topParejas} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
                  <XAxis
                    dataKey="nombre"
                    stroke="#64748b"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" tick={{ fill: "#64748b", fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                    labelStyle={{ color: "#f8fafc" }}
                    formatter={(v) => [`${v}%`, "Win Rate"]}
                  />
                  <Bar dataKey="winRate" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Win Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Partidos por torneo */}
          {data.distribucionTorneos.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Partidos por Torneo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={data.distribucionTorneos}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="cantidad"
                      nameKey="nombre"
                      label={({ nombre, percent }) =>
                        `${nombre.slice(0, 12)} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {data.distribucionTorneos.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                      labelStyle={{ color: "#f8fafc" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Tabla rendimiento */}
          <Card className={data.distribucionTorneos.length > 0 ? "" : "lg:col-span-2"}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tabla de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-4">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    {["#", "Pareja", "PJ", "PG", "Win%", "Pts"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.topParejas.map((p, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2 font-medium text-white">{p.nombre}</td>
                      <td className="px-3 py-2 text-muted-foreground">{p.jugados}</td>
                      <td className="px-3 py-2 text-lime-400">{p.ganados}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden w-16">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${p.winRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{p.winRate}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-primary font-bold">{p.puntos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
