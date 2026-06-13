import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { calcularPuntosVictoria, calcularPuntosDerrota, BONUS_CAMPEON, BONUS_SUBCAMPEON } from "@/lib/ranking";
import { FasePartido } from "@prisma/client";

const setSchema = z.object({
  local: z.number().int().min(0).max(7),
  visitante: z.number().int().min(0).max(7),
});

const updateSchema = z.object({
  fecha: z.string().datetime().optional().nullable(),
  estado: z.enum(["PENDIENTE", "EN_JUEGO", "FINALIZADO"]).optional(),
  sets: z.array(setSchema).min(1).max(5).optional(),
  ganadorId: z.string().cuid().optional().nullable(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { estado, sets, ganadorId, fecha } = parsed.data;

    const partidoActual = await prisma.partido.findUnique({ where: { id } });
    if (!partidoActual) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

    // Actualizar partido
    const partido = await prisma.partido.update({
      where: { id },
      data: {
        ...(fecha !== undefined ? { fecha } : {}),
        ...(estado ? { estado } : {}),
        ...(sets ? { sets } : {}),
        ...(ganadorId !== undefined ? { ganadorId } : {}),
      },
      include: { parejaLocal: true, parejaVisitante: true, ganador: true },
    });

    // Si se finaliza el partido, actualizar ranking automáticamente
    if (estado === "FINALIZADO" && ganadorId && partidoActual.estado !== "FINALIZADO") {
      const perdedorId =
        ganadorId === partido.parejaLocalId
          ? partido.parejaVisitanteId
          : partido.parejaLocalId;

      const fase = partidoActual.fase as FasePartido;
      const puntosGanador = calcularPuntosVictoria(fase);
      const puntosPerdedor = calcularPuntosDerrota(fase);

      await prisma.$transaction([
        // Ganador
        prisma.pareja.update({
          where: { id: ganadorId },
          data: {
            puntosRanking: { increment: puntosGanador },
            partidosJugados: { increment: 1 },
            partidosGanados: { increment: 1 },
          },
        }),
        // Perdedor
        prisma.pareja.update({
          where: { id: perdedorId },
          data: {
            puntosRanking: { increment: puntosPerdedor },
            partidosJugados: { increment: 1 },
            partidosPerdidos: { increment: 1 },
          },
        }),
      ]);

      // Bonus campeón/subcampeón en final
      if (fase === FasePartido.FINAL) {
        await prisma.$transaction([
          prisma.pareja.update({
            where: { id: ganadorId },
            data: { puntosRanking: { increment: BONUS_CAMPEON } },
          }),
          prisma.pareja.update({
            where: { id: perdedorId },
            data: { puntosRanking: { increment: BONUS_SUBCAMPEON } },
          }),
        ]);
      }
    }

    return NextResponse.json(partido);
  } catch {
    return NextResponse.json({ error: "Error al actualizar partido" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    const partido = await prisma.partido.findUnique({ where: { id } });
    if (!partido) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

    if (partido.estado === "FINALIZADO") {
      return NextResponse.json(
        { error: "No se puede eliminar un partido finalizado." },
        { status: 400 }
      );
    }

    await prisma.partido.delete({ where: { id } });
    return NextResponse.json({ message: "Partido eliminado" });
  } catch {
    return NextResponse.json({ error: "Error al eliminar partido" }, { status: 500 });
  }
}
