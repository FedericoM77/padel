import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { EstadoTorneo, FormatoTorneo } from "@prisma/client";

const createSchema = z.object({
  nombre: z.string().min(3).max(100),
  categoria: z.string().min(1).max(50),
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime().optional().nullable(),
  estado: z.nativeEnum(EstadoTorneo).optional(),
  formato: z.nativeEnum(FormatoTorneo).optional(),
  descripcion: z.string().max(500).optional().nullable(),
});

export async function GET() {
  try {
    const torneos = await prisma.torneo.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { partidos: true, inscripciones: true } },
      },
    });
    return NextResponse.json(torneos);
  } catch {
    return NextResponse.json({ error: "Error al obtener torneos" }, { status: 500 });
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

    const torneo = await prisma.torneo.create({ data: parsed.data });
    return NextResponse.json(torneo, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear torneo" }, { status: 500 });
  }
}
