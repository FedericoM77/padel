"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trophy, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toaster";
import type { Torneo } from "@/types";

const schema = z.object({
  nombre: z.string().min(3, "Mínimo 3 caracteres").max(100),
  categoria: z.string().min(1, "Requerido").max(50),
  fechaInicio: z.string().min(1, "Requerido"),
  fechaFin: z.string().optional(),
  formato: z.enum(["LIGA", "ELIMINACION_DIRECTA", "GRUPOS_PLAYOFFS"]),
  descripcion: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  editando: Torneo | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const FORMATOS = [
  { value: "LIGA", label: "Liga (todos contra todos)" },
  { value: "ELIMINACION_DIRECTA", label: "Eliminación Directa" },
  { value: "GRUPOS_PLAYOFFS", label: "Grupos + Playoffs" },
];

export function TorneoForm({ editando, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: editando?.nombre ?? "",
      categoria: editando?.categoria ?? "",
      fechaInicio: editando?.fechaInicio
        ? new Date(editando.fechaInicio).toISOString().slice(0, 16)
        : "",
      fechaFin: editando?.fechaFin
        ? new Date(editando.fechaFin).toISOString().slice(0, 16)
        : "",
      formato: (editando?.formato as FormData["formato"]) ?? "LIGA",
      descripcion: editando?.descripcion ?? "",
    },
  });

  const formato = watch("formato");

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        fechaInicio: new Date(data.fechaInicio).toISOString(),
        fechaFin: data.fechaFin ? new Date(data.fechaFin).toISOString() : null,
      };

      const url = editando ? `/api/torneos/${editando.id}` : "/api/torneos";
      const method = editando ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        toast({ title: "Error", description: err.error, variant: "destructive" });
        return;
      }

      toast({
        title: editando ? "Torneo actualizado" : "Torneo creado",
        description: data.nombre,
        variant: "success",
      });

      reset();
      onSuccess();
    } catch {
      toast({ title: "Error de red", description: "No se pudo conectar al servidor", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="w-4 h-4 text-primary" />
          {editando ? "Editar Torneo" : "Crear Torneo"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input placeholder="Ej: Copa Verano 2025" {...register("nombre")} />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Input placeholder="Ej: Primera, Segunda, Mixta" {...register("categoria")} />
            {errors.categoria && <p className="text-xs text-destructive">{errors.categoria.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Fecha de inicio</Label>
              <Input type="datetime-local" {...register("fechaInicio")} />
              {errors.fechaInicio && <p className="text-xs text-destructive">{errors.fechaInicio.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Fecha de fin</Label>
              <Input type="datetime-local" {...register("fechaFin")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Formato</Label>
            <Select value={formato} onValueChange={(v) => setValue("formato", v as FormData["formato"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMATOS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descripción (opcional)</Label>
            <Input placeholder="Información adicional del torneo" {...register("descripcion")} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editando ? (
                <><Save className="w-4 h-4" />Guardar Cambios</>
              ) : (
                <><Trophy className="w-4 h-4" />Crear Torneo</>
              )}
            </Button>
            {editando && (
              <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
