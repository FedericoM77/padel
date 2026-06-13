import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalParejas,
      torneosActivos,
      partidosPendientes,
      partidosFinalizados,
      topRanking,
      ultimosResultados,
      proximosPartidos,
    ] = await Promise.all([
      prisma.pareja.count(),
      prisma.torneo.count({ where: { estado: "ACTIVO" } }),
      prisma.partido.count({ where: { estado: "PENDIENTE" } }),
      prisma.partido.count({ where: { estado: "FINALIZADO" } }),
      prisma.pareja.findMany({
        orderBy: { puntosRanking: "desc" },
        take: 5,
      }),
      prisma.partido.findMany({
        where: { estado: "FINALIZADO" },
        include: {
          parejaLocal: true,
          parejaVisitante: true,
          ganador: true,
          torneo: { select: { id: true, nombre: true, categoria: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.partido.findMany({
        where: { estado: "PENDIENTE", fecha: { not: null } },
        include: {
          parejaLocal: true,
          parejaVisitante: true,
          torneo: { select: { id: true, nombre: true, categoria: true } },
        },
        orderBy: { fecha: "asc" },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      totalParejas,
      torneosActivos,
      partidosPendientes,
      partidosFinalizados,
      topRanking,
      ultimosResultados,
      proximosPartidos,
    });
  } catch {
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }
}
