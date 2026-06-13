import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  nombreJugador1: z.string().min(3).max(50).optional(),
  nombreJugador2: z.string().min(3).max(50).optional(),
  puntosRanking: z.number().int().min(0).optional(),
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

    const pareja = await prisma.pareja.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(pareja);
  } catch {
    return NextResponse.json({ error: "Error al actualizar pareja" }, { status: 500 });
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
    // Validar que no tenga partidos asociados
    const partidos = await prisma.partido.count({
      where: {
        OR: [{ parejaLocalId: id }, { parejaVisitanteId: id }],
      },
    });

    if (partidos > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar: la pareja tiene partidos asociados." },
        { status: 400 }
      );
    }

    // Validar que no esté inscripta en torneos activos
    const torneoActivo = await prisma.inscripcion.findFirst({
      where: {
        parejaId: id,
        torneo: { estado: { in: ["INSCRIPCION", "ACTIVO"] } },
      },
    });

    if (torneoActivo) {
      return NextResponse.json(
        { error: "No se puede eliminar: la pareja participa en un torneo activo." },
        { status: 400 }
      );
    }

    await prisma.pareja.delete({ where: { id } });
    return NextResponse.json({ message: "Pareja eliminada" });
  } catch {
    return NextResponse.json({ error: "Error al eliminar pareja" }, { status: 500 });
  }
}
