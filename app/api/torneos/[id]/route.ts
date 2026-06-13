import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { EstadoTorneo, FormatoTorneo } from "@prisma/client";

const updateSchema = z.object({
  nombre: z.string().min(3).max(100).optional(),
  categoria: z.string().min(1).max(50).optional(),
  fechaInicio: z.string().datetime().optional(),
  fechaFin: z.string().datetime().optional().nullable(),
  estado: z.nativeEnum(EstadoTorneo).optional(),
  formato: z.nativeEnum(FormatoTorneo).optional(),
  descripcion: z.string().max(500).optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const torneo = await prisma.torneo.findUnique({
      where: { id },
      include: {
        inscripciones: { include: { pareja: true } },
        partidos: {
          include: {
            parejaLocal: true,
            parejaVisitante: true,
            ganador: true,
          },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { partidos: true, inscripciones: true } },
      },
    });

    if (!torneo) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    return NextResponse.json(torneo);
  } catch {
    return NextResponse.json({ error: "Error al obtener torneo" }, { status: 500 });
  }
}

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

    const torneo = await prisma.torneo.update({ where: { id }, data: parsed.data });
    return NextResponse.json(torneo);
  } catch {
    return NextResponse.json({ error: "Error al actualizar torneo" }, { status: 500 });
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
    const torneo = await prisma.torneo.findUnique({ where: { id } });
    if (!torneo) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

    if (torneo.estado === "ACTIVO") {
      return NextResponse.json(
        { error: "No se puede eliminar un torneo activo." },
        { status: 400 }
      );
    }

    await prisma.torneo.delete({ where: { id } });
    return NextResponse.json({ message: "Torneo eliminado" });
  } catch {
    return NextResponse.json({ error: "Error al eliminar torneo" }, { status: 500 });
  }
}
