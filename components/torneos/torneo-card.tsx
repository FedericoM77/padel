"use client";

import { Pencil, Trash2, Calendar, Users, Swords } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { formatDate } from "@/lib/utils";
import type { Torneo } from "@/types";

interface TorneoConCount extends Torneo {
  _count: { partidos: number; inscripciones: number };
}

interface Props {
  torneo: TorneoConCount;
  onEdit: (t: Torneo) => void;
  onRefresh: () => void;
}

const ESTADO_LABELS: Record<string, { label: string; variant: "success" | "info" | "warning" | "secondary" | "destructive" }> = {
  BORRADOR: { label: "Borrador", variant: "secondary" },
  INSCRIPCION: { label: "Inscripción", variant: "info" },
  ACTIVO: { label: "Activo", variant: "success" },
  FINALIZADO: { label: "Finalizado", variant: "secondary" },
};

const FORMATO_LABELS: Record<string, string> = {
  LIGA: "Liga",
  ELIMINACION_DIRECTA: "Eliminación Directa",
  GRUPOS_PLAYOFFS: "Grupos + Playoffs",
};

export function TorneoCard({ torneo, onEdit, onRefresh }: Props) {
  const estado = ESTADO_LABELS[torneo.estado] ?? { label: torneo.estado, variant: "secondary" };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el torneo "${torneo.nombre}"?`)) return;

    const res = await fetch(`/api/torneos/${torneo.id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      toast({ title: "No se puede eliminar", description: err.error, variant: "destructive" });
      return;
    }
    toast({ title: "Torneo eliminado", variant: "success" });
    onRefresh();
  };

  return (
    <Card className="hover:border-border/80 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{torneo.nombre}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{torneo.categoria}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant={estado.variant as Parameters<typeof Badge>[0]["variant"]}>{estado.label}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(torneo.fechaInicio)}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {torneo.fechaFin ? formatDate(torneo.fechaFin) : "Sin fecha fin"}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {torneo._count.inscripciones} parejas
          </div>
          <div className="flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5" />
            {torneo._count.partidos} partidos
          </div>
        </div>

        <div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {FORMATO_LABELS[torneo.formato] ?? torneo.formato}
          </span>
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(torneo)}>
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
