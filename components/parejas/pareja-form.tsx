"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import type { Pareja } from "@/types";

const schema = z.object({
  nombreJugador1: z.string().min(3, "Mínimo 3 caracteres").max(50, "Máximo 50 caracteres"),
  nombreJugador2: z.string().min(3, "Mínimo 3 caracteres").max(50, "Máximo 50 caracteres"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  editando: Pareja | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ParejaForm({ editando, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombreJugador1: editando?.nombreJugador1 ?? "",
      nombreJugador2: editando?.nombreJugador2 ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const url = editando ? `/api/parejas/${editando.id}` : "/api/parejas";
      const method = editando ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        toast({ title: "Error", description: err.error, variant: "destructive" });
        return;
      }

      toast({
        title: editando ? "Pareja actualizada" : "Pareja registrada",
        description: `${data.nombreJugador1} / ${data.nombreJugador2}`,
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
          <UserPlus className="w-4 h-4 text-primary" />
          {editando ? "Editar Pareja" : "Registrar Pareja"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jugador1">Jugador 1</Label>
            <Input
              id="jugador1"
              placeholder="Nombre del jugador 1"
              {...register("nombreJugador1")}
            />
            {errors.nombreJugador1 && (
              <p className="text-xs text-destructive">{errors.nombreJugador1.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jugador2">Jugador 2</Label>
            <Input
              id="jugador2"
              placeholder="Nombre del jugador 2"
              {...register("nombreJugador2")}
            />
            {errors.nombreJugador2 && (
              <p className="text-xs text-destructive">{errors.nombreJugador2.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editando ? (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Registrar Pareja
                </>
              )}
            </Button>
            {editando && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
