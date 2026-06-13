import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { EstadoPartido, FasePartido } from "@prisma/client";

const createSchema = z.object({
  torneoId: z.string().cuid(),
  parejaLocalId: z.string().cuid(),
  parejaVisitanteId: z.string().cuid(),
  fecha: z.string().datetime().optional().nullable(),
  fase: z.nativeEnum(FasePartido).optional(),
  ronda: z.number().int().positive().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const torneoId = searchParams.get("torneoId");
    const estado = searchParams.get("estado") as EstadoPartido | null;

    const partidos = await prisma.partido.findMany({
      where: {
        ...(torneoId ? { torneoId } : {}),
        ...(estado ? { estado } : {}),
      },
      include: {
        parejaLocal: true,
        parejaVisitante: true,
        ganador: true,
        torneo: { select: { id: true, nombre: true, categoria: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(partidos);
  } catch {
    return NextResponse.json({ error: "Error al obtener partidos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { parejaLocalId, parejaVisitanteId } = parsed.data;
    if (parejaLocalId === parejaVisitanteId) {
      return NextResponse.json(
        { error: "Una pareja no puede jugar contra sí misma." },
        { status: 400 }
      );
    }

    const partido = await prisma.partido.create({
      data: parsed.data,
      include: {
        parejaLocal: true,
        parejaVisitante: true,
        torneo: { select: { id: true, nombre: true, categoria: true } },
      },
    });

    return NextResponse.json(partido, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear partido" }, { status: 500 });
  }
}
