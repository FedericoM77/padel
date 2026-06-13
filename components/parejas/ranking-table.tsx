"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2, Search, ChevronUp, ChevronDown, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";
import type { Pareja } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  parejas: Pareja[];
  loading: boolean;
  onEdit: (p: Pareja) => void;
  onRefresh: () => void;
}

type SortKey = "puntosRanking" | "partidosJugados" | "partidosGanados" | "nombreJugador1";
type SortDir = "asc" | "desc";

const ROWS_PER_PAGE = 10;

function MedalIcon({ pos }: { pos: number }) {
  if (pos === 1) return <span className="text-yellow-400 text-sm">🥇</span>;
  if (pos === 2) return <span className="text-slate-300 text-sm">🥈</span>;
  if (pos === 3) return <span className="text-amber-600 text-sm">🥉</span>;
  return <span className="text-muted-foreground text-sm font-mono">{pos}</span>;
}

export function RankingTable({ parejas, loading, onEdit, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("puntosRanking");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return parejas
      .filter(
        (p) =>
          p.nombreJugador1.toLowerCase().includes(q) ||
          p.nombreJugador2.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const valA = a[sortKey] as string | number;
        const valB = b[sortKey] as string | number;
        if (typeof valA === "string") {
          return sortDir === "asc"
            ? valA.localeCompare(valB as string)
            : (valB as string).localeCompare(valA);
        }
        return sortDir === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [parejas, search, sortKey, sortDir]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const handleDelete = async (p: Pareja) => {
    if (!confirm(`¿Eliminar la pareja ${p.nombreJugador1} / ${p.nombreJugador2}?`)) return;

    const res = await fetch(`/api/parejas/${p.id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      toast({ title: "No se puede eliminar", description: err.error, variant: "destructive" });
      return;
    }

    toast({ title: "Pareja eliminada", variant: "success" });
    onRefresh();
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-white select-none whitespace-nowrap"
      onClick={() => toggleSort(k)}
    >
      <span className="flex items-center gap-1">
        {label}
        <SortIcon k={k} />
      </span>
    </th>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Medal className="w-4 h-4 text-primary" />
            Ranking de Parejas
            <Badge variant="secondary" className="ml-1">{total}</Badge>
          </CardTitle>
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar jugador..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-8 text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            {search ? "Sin resultados para la búsqueda." : "No hay parejas registradas aún."}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-12">#</th>
                    <Th label="Pareja" k="nombreJugador1" />
                    <Th label="PJ" k="partidosJugados" />
                    <Th label="PG" k="partidosGanados" />
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase">PP</th>
                    <Th label="Pts" k="puntosRanking" />
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paged.map((p, idx) => {
                    const pos = (page - 1) * ROWS_PER_PAGE + idx + 1;
                    const globalPos = filtered.findIndex(f => f.id === p.id) + 1;
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-3 py-3 w-12">
                          <MedalIcon pos={globalPos} />
                        </td>
                        <td className="px-3 py-3">
                          <div>
                            <p className="font-medium text-white">{p.nombreJugador1}</p>
                            <p className="text-xs text-muted-foreground">{p.nombreJugador2}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{p.partidosJugados}</td>
                        <td className="px-3 py-3 text-lime-400">{p.partidosGanados}</td>
                        <td className="px-3 py-3 text-red-400">{p.partidosPerdidos}</td>
                        <td className="px-3 py-3">
                          <span className={cn(
                            "font-bold",
                            globalPos === 1 ? "text-yellow-400" : "text-primary"
                          )}>
                            {p.puntosRanking}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(p)} className="h-7 w-7">
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(p)} className="h-7 w-7 hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {(page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, total)} de {total}
                </p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
