import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  nombreJugador1: z.string().min(3, "Mínimo 3 caracteres").max(50),
  nombreJugador2: z.string().min(3, "Mínimo 3 caracteres").max(50),
});

export async function GET() {
  try {
    const parejas = await prisma.pareja.findMany({
      orderBy: { puntosRanking: "desc" },
    });
    return NextResponse.json(parejas);
  } catch {
    return NextResponse.json({ error: "Error al obtener parejas" }, { status: 500 });
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

    const { nombreJugador1, nombreJugador2 } = parsed.data;
    const pareja = await prisma.pareja.create({
      data: {
        nombreJugador1: nombreJugador1.trim(),
        nombreJugador2: nombreJugador2.trim(),
      },
    });

    return NextResponse.json(pareja, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear pareja" }, { status: 500 });
  }
}
