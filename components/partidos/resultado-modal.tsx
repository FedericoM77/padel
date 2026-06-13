"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toaster";
import type { PartidoConParejas, SetResult } from "@/types";

interface Props {
  partido: PartidoConParejas;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function parseSet(s: string): SetResult | null {
  const parts = s.split("-");
  if (parts.length !== 2) return null;
  const local = parseInt(parts[0]);
  const visitante = parseInt(parts[1]);
  if (isNaN(local) || isNaN(visitante)) return null;
  if (local < 0 || local > 7 || visitante < 0 || visitante > 7) return null;
  return { local, visitante };
}

function determinarGanador(sets: SetResult[], localId: string, visitanteId: string): string | null {
  let setsLocal = 0;
  let setsVisitante = 0;
  for (const s of sets) {
    if (s.local > s.visitante) setsLocal++;
    else if (s.visitante > s.local) setsVisitante++;
  }
  if (setsLocal > setsVisitante) return localId;
  if (setsVisitante > setsLocal) return visitanteId;
  return null;
}

export function ResultadoModal({ partido, open, onClose, onSuccess }: Props) {
  const [setInputs, setSetInputs] = useState<string[]>(["", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleSetChange = (i: number, val: string) => {
    setSetInputs((prev) => {
      const updated = [...prev];
      updated[i] = val;
      return updated;
    });
  };

  const handleSubmit = async () => {
    const sets: SetResult[] = [];
    for (const input of setInputs) {
      if (!input.trim()) continue;
      const parsed = parseSet(input.trim());
      if (!parsed) {
        toast({ title: "Formato inválido", description: "Usar formato: 6-4", variant: "destructive" });
        return;
      }
      sets.push(parsed);
    }

    if (sets.length === 0) {
      toast({ title: "Error", description: "Ingresá al menos un set.", variant: "destructive" });
      return;
    }

    const ganadorId = determinarGanador(sets, partido.parejaLocalId, partido.parejaVisitanteId);
    if (!ganadorId) {
      toast({ title: "Resultado empatado", description: "Los sets deben tener un ganador claro.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/partidos/${partido.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "FINALIZADO", sets, ganadorId }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast({ title: "Error", description: err.error, variant: "destructive" });
        return;
      }

      const ganador = ganadorId === partido.parejaLocalId ? partido.parejaLocal : partido.parejaVisitante;
      toast({
        title: "Resultado registrado",
        description: `Ganador: ${ganador.nombreJugador1} / ${ganador.nombreJugador2}`,
        variant: "success",
      });

      onSuccess();
      onClose();
    } catch {
      toast({ title: "Error de red", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cargar Resultado</DialogTitle>
          <DialogDescription>
            {partido.parejaLocal.nombreJugador1}/{partido.parejaLocal.nombreJugador2}
            {" vs "}
            {partido.parejaVisitante.nombreJugador1}/{partido.parejaVisitante.nombreJugador2}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="text-center px-4 py-2 bg-muted rounded-lg flex-1">
              <p className="font-medium text-white">{partido.parejaLocal.nombreJugador1}</p>
              <p className="text-xs text-muted-foreground">{partido.parejaLocal.nombreJugador2}</p>
              <span className="text-xs text-primary">Local</span>
            </div>
            <span className="px-3 text-muted-foreground font-bold">VS</span>
            <div className="text-center px-4 py-2 bg-muted rounded-lg flex-1">
              <p className="font-medium text-white">{partido.parejaVisitante.nombreJugador1}</p>
              <p className="text-xs text-muted-foreground">{partido.parejaVisitante.nombreJugador2}</p>
              <span className="text-xs text-blue-400">Visitante</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm">Sets (formato: local-visitante, ej: 6-4)</Label>
            {setInputs.map((val, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12">Set {i + 1}</span>
                <Input
                  value={val}
                  onChange={(e) => handleSetChange(i, e.target.value)}
                  placeholder="6-4"
                  className="w-28 text-center font-mono"
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Confirmar</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
