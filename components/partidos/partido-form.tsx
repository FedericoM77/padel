"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toaster";
import type { Pareja, Torneo } from "@/types";

const schema = z.object({
  torneoId: z.string().min(1, "Seleccioná un torneo"),
  parejaLocalId: z.string().min(1, "Seleccioná pareja local"),
  parejaVisitanteId: z.string().min(1, "Seleccioná pareja visitante"),
  fecha: z.string().optional(),
  fase: z.enum(["GRUPO", "OCTAVOS", "CUARTOS", "SEMIFINAL", "FINAL"]).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  torneos: Torneo[];
  parejas: Pareja[];
  onSuccess: () => void;
}

const FASES = [
  { value: "GRUPO", label: "Fase de Grupos" },
  { value: "OCTAVOS", label: "Octavos de Final" },
  { value: "CUARTOS", label: "Cuartos de Final" },
  { value: "SEMIFINAL", label: "Semifinal" },
  { value: "FINAL", label: "Final" },
];

export function PartidoForm({ torneos, parejas, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fase: "GRUPO" },
  });

  const torneoId = watch("torneoId");
  const parejaLocalId = watch("parejaLocalId");

  const onSubmit = async (data: FormData) => {
    if (data.parejaLocalId === data.parejaVisitanteId) {
      toast({ title: "Error", description: "Una pareja no puede jugar contra sí misma.", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        ...data,
        fecha: data.fecha ? new Date(data.fecha).toISOString() : null,
      };

      const res = await fetch("/api/partidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        toast({ title: "Error", description: err.error, variant: "destructive" });
        return;
      }

      toast({ title: "Partido creado", variant: "success" });
      reset();
      onSuccess();
    } catch {
      toast({ title: "Error de red", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Swords className="w-4 h-4 text-primary" />
          Programar Partido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Torneo</Label>
            <Select onValueChange={(v) => setValue("torneoId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná torneo" />
              </SelectTrigger>
              <SelectContent>
                {torneos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.nombre} — {t.categoria}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.torneoId && <p className="text-xs text-destructive">{errors.torneoId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Pareja Local</Label>
            <Select onValueChange={(v) => setValue("parejaLocalId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná pareja local" />
              </SelectTrigger>
              <SelectContent>
                {parejas.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nombreJugador1} / {p.nombreJugador2}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.parejaLocalId && <p className="text-xs text-destructive">{errors.parejaLocalId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Pareja Visitante</Label>
            <Select onValueChange={(v) => setValue("parejaVisitanteId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná pareja visitante" />
              </SelectTrigger>
              <SelectContent>
                {parejas
                  .filter((p) => p.id !== parejaLocalId)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nombreJugador1} / {p.nombreJugador2}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.parejaVisitanteId && <p className="text-xs text-destructive">{errors.parejaVisitanteId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Fase</Label>
              <Select defaultValue="GRUPO" onValueChange={(v) => setValue("fase", v as FormData["fase"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FASES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha (opcional)</Label>
              <Input type="datetime-local" {...register("fecha")} />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Programar Partido"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
